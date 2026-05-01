import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Mic, Square, Loader2, Sparkles, Volume2, VolumeX, Info, MessageCircle, Activity, Play, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "hi-IN", label: "हिन्दी (Hindi)" },
  { code: "ur-PK", label: "اردو (Urdu)" },
  { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ta-IN", label: "தமிழ் (Tamil)" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "bn-IN", label: "বাংলা (Bengali)" },
  { code: "te-IN", label: "తెలుగు (Telugu)" },
  { code: "mr-IN", label: "मराठी (Marathi)" },
  { code: "ar-SA", label: "العربية (Arabic)" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" },
];

interface Feedback {
  confidence?: number;
  clarity?: number;
  fluency?: number;
  overall?: number;
  summary?: string;
  mistakes?: { issue: string; correction: string }[];
  tips?: string[];
}

interface AudioStats {
  durationSec: number;
  avgLevel: number;
  peakLevel: number;
  speakingRatio: number; // % of time above silence threshold
  wordsPerMin: number;
}

type Tab = "coach" | "talk" | "about";

const Coach = () => {
  const [tab, setTab] = useState<Tab>("coach");
  const [lang, setLang] = useState("en-US");

  // shared mic state
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [level, setLevel] = useState(0);

  // coach state
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [audioStats, setAudioStats] = useState<AudioStats | null>(null);

  // talk state
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [thinking, setThinking] = useState(false);

  // tts
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const listeningRef = useRef(false);
  const tabRef = useRef<Tab>("coach");
  const langRef = useRef(lang);
  const transcriptRef = useRef("");
  const interimRef = useRef("");

  // audio metrics
  const startTimeRef = useRef(0);
  const sumLevelRef = useRef(0);
  const peakLevelRef = useRef(0);
  const sampleCountRef = useRef(0);
  const speakingFramesRef = useRef(0);

  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { interimRef.current = interim; }, [interim]);

  const SpeechRecognition = useMemo(() => {
    if (typeof window === "undefined") return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  }, []);

  // ---------- TTS ----------
  const speak = (text: string, language?: string) => {
    if (!ttsEnabled || !text || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = language || langRef.current;
      utter.rate = 1;
      utter.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang === utter.lang) || voices.find((v) => v.lang.startsWith(utter.lang.split("-")[0]));
      if (match) utter.voice = match;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("tts failed", e);
    }
  };

  const stopSpeaking = () => {
    try { window.speechSynthesis?.cancel(); } catch {}
    setSpeaking(false);
  };

  // preload voices (some browsers populate async)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => window.speechSynthesis.getVoices();
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  // ---------- audio meter + metrics ----------
  const stopAudio = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    setLevel(0);
  };

  const startAudioMeter = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);

    startTimeRef.current = performance.now();
    sumLevelRef.current = 0;
    peakLevelRef.current = 0;
    sampleCountRef.current = 0;
    speakingFramesRef.current = 0;

    const tick = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length / 255;
      sumLevelRef.current += avg;
      sampleCountRef.current += 1;
      if (avg > peakLevelRef.current) peakLevelRef.current = avg;
      if (avg > 0.04) speakingFramesRef.current += 1;
      setLevel((prev) => prev * 0.6 + avg * 0.4);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const computeAudioStats = (text: string): AudioStats => {
    const durationSec = Math.max(0.1, (performance.now() - startTimeRef.current) / 1000);
    const samples = Math.max(1, sampleCountRef.current);
    const avgLevel = sumLevelRef.current / samples;
    const peakLevel = peakLevelRef.current;
    const speakingRatio = speakingFramesRef.current / samples;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const wordsPerMin = (words / durationSec) * 60;
    return { durationSec, avgLevel, peakLevel, speakingRatio, wordsPerMin };
  };

  // ---------- mic control ----------
  const startListening = async () => {
    if (!SpeechRecognition) {
      toast({
        title: "Not supported",
        description: "Your browser doesn't support speech recognition. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }
    stopSpeaking();
    setFeedback(null);
    setAudioStats(null);
    setTranscript("");
    setInterim("");

    try {
      await startAudioMeter();
    } catch {
      toast({ title: "Microphone blocked", description: "Allow mic access to use the coach.", variant: "destructive" });
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t + " ";
        else interimText += t;
      }
      if (finalText) setTranscript((prev) => (prev + " " + finalText).trim());
      setInterim(interimText);

      // Auto-send in talk mode after a final segment with brief pause
      if (tabRef.current === "talk" && finalText.trim()) {
        // debounce: wait for any further finals shortly
        if ((rec as any)._talkTimer) clearTimeout((rec as any)._talkTimer);
        (rec as any)._talkTimer = setTimeout(() => {
          const full = (transcriptRef.current + " " + interimRef.current).trim();
          if (full) sendChat(full);
        }, 900);
      }
    };

    rec.onerror = (e: any) => {
      console.warn("speech error", e);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        toast({ title: "Mic blocked", variant: "destructive" });
        stopListening();
      }
    };

    rec.onend = () => {
      if (recognitionRef.current === rec && listeningRef.current) {
        try { rec.start(); } catch {}
      }
    };

    recognitionRef.current = rec;
    listeningRef.current = true;
    rec.start();
    setListening(true);
  };

  const stopListening = async (opts: { analyze?: boolean } = { analyze: true }) => {
    listeningRef.current = false;
    setListening(false);
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      try { rec.stop(); } catch {}
      if ((rec as any)._talkTimer) clearTimeout((rec as any)._talkTimer);
    }

    const fullText = (transcriptRef.current + " " + interimRef.current).trim();
    const stats = computeAudioStats(fullText);
    stopAudio();
    setInterim("");

    if (opts.analyze && tabRef.current === "coach" && fullText.length >= 2) {
      setAudioStats(stats);
      setAnalyzing(true);
      try {
        const { data, error } = await supabase.functions.invoke("speech-coach", {
          body: { transcript: fullText, language: lang, mode: "analyze" },
        });
        if (error) throw error;
        const fb = data as Feedback;
        setFeedback(fb);
        if (fb?.summary) speak(fb.summary, lang);
      } catch (e: any) {
        toast({ title: "Analysis failed", description: e?.message || "Try again.", variant: "destructive" });
      } finally {
        setAnalyzing(false);
      }
    }
  };

  // ---------- talk mode ----------
  const sendChat = async (userText: string) => {
    // stop mic while AI replies, capture stats, clear buffers
    listeningRef.current = false;
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) { try { rec.stop(); } catch {} }
    stopAudio();
    setListening(false);

    setChatHistory((h) => [...h, { role: "user", text: userText }]);
    setTranscript("");
    setInterim("");
    setThinking(true);
    try {
      const { data, error } = await supabase.functions.invoke("speech-coach", {
        body: { transcript: userText, language: langRef.current, mode: "chat" },
      });
      if (error) throw error;
      const reply = (data as any)?.reply || "";
      if (reply) {
        setChatHistory((h) => [...h, { role: "assistant", text: reply }]);
        speak(reply, langRef.current);
      }
    } catch (e: any) {
      toast({ title: "Reply failed", description: e?.message || "Try again.", variant: "destructive" });
    } finally {
      setThinking(false);
    }
  };

  // cleanup
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch {}
      stopAudio();
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when switching tabs, stop everything
  useEffect(() => {
    if (listening) stopListening({ analyze: false });
    stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const scale = 1 + level * 0.55;
  const glow = 30 + level * 90;
  const showActivity = listening || speaking || thinking;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-base font-semibold gradient-text flex items-center gap-2">
          <Sparkles size={16} /> Speaking Coach
        </h1>
        <button
          onClick={() => setTtsEnabled((v) => !v)}
          className="p-2 rounded-lg hover:bg-accent/40 transition-colors"
          title={ttsEnabled ? "Mute voice" : "Enable voice"}
          aria-label={ttsEnabled ? "Mute voice" : "Enable voice"}
        >
          {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-muted-foreground" />}
        </button>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-4 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-muted/40 border border-border">
          <TabBtn active={tab === "coach"} onClick={() => setTab("coach")} icon={<Activity size={14} />} label="Coach" />
          <TabBtn active={tab === "talk"} onClick={() => setTab("talk")} icon={<MessageCircle size={14} />} label="Talk" />
          <TabBtn active={tab === "about"} onClick={() => setTab("about")} icon={<Info size={14} />} label="About" />
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center px-4 py-6 max-w-2xl mx-auto w-full">
        {tab !== "about" && (
          <div className="w-full mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              disabled={listening}
              className="mt-2 w-full px-4 py-3 rounded-xl bg-card border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        )}

        {tab !== "about" && (
          <>
            <div className="relative flex items-center justify-center my-6 select-none">
              <div
                className="absolute rounded-full opacity-40 transition-all duration-150 ease-out"
                style={{
                  width: 280,
                  height: 280,
                  transform: `scale(${1 + level * 0.3})`,
                  background: "radial-gradient(circle, hsl(var(--gradient-mid) / 0.35), transparent 70%)",
                  filter: `blur(${20 + level * 30}px)`,
                }}
              />
              <button
                onClick={listening ? () => stopListening({ analyze: tab === "coach" }) : startListening}
                disabled={analyzing || thinking}
                className={cn(
                  "relative rounded-full flex items-center justify-center transition-transform duration-150 ease-out cursor-pointer disabled:cursor-wait",
                  speaking && "animate-pulse"
                )}
                style={{
                  width: 200,
                  height: 200,
                  transform: `scale(${scale})`,
                  background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-mid)) 50%, hsl(var(--gradient-end)))",
                  boxShadow: `0 0 ${glow}px hsl(var(--gradient-mid) / 0.6), 0 0 ${glow / 2}px hsl(var(--gradient-start) / 0.5), inset 0 0 60px hsl(var(--gradient-end) / 0.3)`,
                }}
                aria-label={listening ? "Stop listening" : "Start listening"}
              >
                <span
                  className="absolute rounded-full"
                  style={{
                    inset: 12,
                    background: "radial-gradient(circle at 35% 30%, hsl(0 0% 100% / 0.45), transparent 55%)",
                  }}
                />
                <span className="relative text-white drop-shadow-md">
                  {analyzing || thinking ? <Loader2 size={42} className="animate-spin" /> : listening ? <Square size={36} fill="white" /> : <Mic size={42} />}
                </span>
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4 text-center min-h-[1.5rem]">
              {analyzing
                ? "Analyzing your speech…"
                : thinking
                ? "Thinking of a reply…"
                : speaking
                ? "Speaking…"
                : listening
                ? tab === "talk"
                  ? "Listening… pause briefly when you're done"
                  : "Listening… tap the orb to stop"
                : tab === "talk"
                ? "Tap the orb and ask anything — I'll reply by voice"
                : "Tap the orb and start speaking"}
            </p>

            {speaking && (
              <button
                onClick={stopSpeaking}
                className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-xs font-semibold hover:bg-accent/40 transition-colors"
              >
                <Pause size={14} /> Stop voice
              </button>
            )}
          </>
        )}

        {/* COACH TAB */}
        {tab === "coach" && (
          <>
            {(transcript || interim) && (
              <div className="w-full p-4 rounded-2xl bg-card border border-border mb-4 animate-fade-in-up">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Transcript</p>
                <p className="text-sm leading-relaxed">
                  {transcript}
                  {interim && <span className="opacity-50"> {interim}</span>}
                </p>
              </div>
            )}

            {audioStats && (
              <div className="w-full p-4 rounded-2xl bg-card border border-border mb-4 animate-fade-in-up">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Audio Analysis</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat label="Duration" value={`${audioStats.durationSec.toFixed(1)}s`} />
                  <Stat label="Pace" value={`${Math.round(audioStats.wordsPerMin)} wpm`} />
                  <Stat label="Loudness" value={`${Math.round(audioStats.avgLevel * 100)}%`} />
                  <Stat label="Active" value={`${Math.round(audioStats.speakingRatio * 100)}%`} />
                </div>
              </div>
            )}

            {feedback && (
              <div className="w-full space-y-4 animate-fade-in-up">
                <div className="p-5 rounded-2xl border border-border bg-card">
                  {feedback.summary && (
                    <div className="flex items-start gap-3 mb-4">
                      <p className="flex-1 text-sm font-medium leading-relaxed">{feedback.summary}</p>
                      <button
                        onClick={() => (speaking ? stopSpeaking() : speak(feedback.summary!, lang))}
                        className="shrink-0 p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 transition-colors border border-primary/30"
                        title={speaking ? "Stop" : "Play summary"}
                        aria-label={speaking ? "Stop" : "Play summary"}
                      >
                        {speaking ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ScoreCard label="Confidence" value={feedback.confidence} />
                    <ScoreCard label="Clarity" value={feedback.clarity} />
                    <ScoreCard label="Fluency" value={feedback.fluency} />
                    <ScoreCard label="Overall" value={feedback.overall} highlight />
                  </div>
                </div>

                {feedback.mistakes && feedback.mistakes.length > 0 && (
                  <div className="p-5 rounded-2xl border border-border bg-card">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Mistakes & Corrections</h3>
                    <ul className="space-y-2">
                      {feedback.mistakes.map((m, i) => (
                        <li key={i} className="text-sm">
                          <span className="text-destructive line-through opacity-80">{m.issue}</span>
                          <span className="mx-2 text-muted-foreground">→</span>
                          <span className="text-primary font-medium">{m.correction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.tips && feedback.tips.length > 0 && (
                  <div className="p-5 rounded-2xl border border-border bg-card">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tips to Improve</h3>
                    <ul className="space-y-2">
                      {feedback.tips.map((t, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-accent">✦</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* TALK TAB */}
        {tab === "talk" && (
          <div className="w-full space-y-3">
            {(transcript || interim) && (
              <div className="p-3 rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                <span className="text-foreground">{transcript}</span>
                {interim && <span className="opacity-60"> {interim}</span>}
              </div>
            )}
            {chatHistory.length === 0 && !listening && !thinking && (
              <div className="text-center text-sm text-muted-foreground py-8">
                Ask anything — I'll listen and reply with voice in your language.
              </div>
            )}
            {chatHistory.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "p-4 rounded-2xl border animate-fade-in-up text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-muted/40 border-border ml-6"
                    : "bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/30 mr-6"
                )}
              >
                <div className="flex items-start gap-3">
                  <p className="flex-1 whitespace-pre-wrap">{m.text}</p>
                  {m.role === "assistant" && (
                    <button
                      onClick={() => (speaking ? stopSpeaking() : speak(m.text, lang))}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-accent/40 transition-colors"
                      aria-label={speaking ? "Stop" : "Play"}
                    >
                      {speaking ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABOUT TAB */}
        {tab === "about" && (
          <div className="w-full space-y-4 animate-fade-in-up">
            <div className="p-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
              <h2 className="text-lg font-bold gradient-text mb-2 flex items-center gap-2">
                <Sparkles size={18} /> About Speaking Coach
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your private, multilingual speaking partner. Practice out loud and get instant feedback,
                or just have a natural voice-to-voice conversation in the language you're learning.
              </p>
            </div>

            <AboutItem
              icon={<Activity size={16} />}
              title="Coach Mode"
              body="Speak freely. Get scored on confidence, clarity, fluency and overall, plus mistake corrections and personalised tips — read aloud in your language."
            />
            <AboutItem
              icon={<MessageCircle size={16} />}
              title="Talk Mode (voice ↔ voice)"
              body="Ask anything by voice. The coach listens, thinks and replies out loud — like a hands-free assistant. Pause briefly to send your message."
            />
            <AboutItem
              icon={<Volume2 size={16} />}
              title="Voice Playback"
              body="Every reply and feedback summary can be spoken in 12+ languages including English, हिन्दी, اردو, ಕನ್ನಡ, தமிழ், ਪੰਜਾਬੀ and more."
            />
            <AboutItem
              icon={<Sparkles size={16} />}
              title="Audio Analysis"
              body="We measure your speaking pace (words/min), loudness, active speaking time and duration — alongside the AI's language feedback."
            />
          </div>
        )}
      </main>

      {showActivity && tab !== "about" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur border border-border text-[11px] font-medium text-muted-foreground shadow-lg">
          {speaking ? "🔊 Speaking" : thinking ? "💭 Thinking" : listening ? "🎙 Listening" : ""}
        </div>
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all",
      active
        ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md"
        : "text-muted-foreground hover:text-foreground"
    )}
  >
    {icon} {label}
  </button>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="p-3 rounded-xl bg-muted/40 text-center">
    <div className="text-base font-bold text-foreground">{value}</div>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
  </div>
);

const AboutItem = ({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) => (
  <div className="p-4 rounded-2xl border border-border bg-card flex gap-3">
    <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-primary">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  </div>
);

const ScoreCard = ({ label, value, highlight }: { label: string; value?: number; highlight?: boolean }) => {
  const v = typeof value === "number" ? Math.max(0, Math.min(100, Math.round(value))) : 0;
  return (
    <div className={`p-3 rounded-xl text-center ${highlight ? "bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/30" : "bg-muted/40"}`}>
      <div className={`text-2xl font-bold ${highlight ? "gradient-text" : "text-foreground"}`}>{v}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
};

export default Coach;
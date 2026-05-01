import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Mic, Square, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

const Coach = () => {
  const [lang, setLang] = useState("en-US");
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [level, setLevel] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const SpeechRecognition = useMemo(() => {
    if (typeof window === "undefined") return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  }, []);

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
    try {
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
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length / 255;
        setLevel((prev) => prev * 0.6 + avg * 0.4);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      toast({ title: "Microphone blocked", description: "Allow mic access to use the coach.", variant: "destructive" });
      throw e;
    }
  };

  const startListening = async () => {
    if (!SpeechRecognition) {
      toast({
        title: "Not supported",
        description: "Your browser doesn't support speech recognition. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }
    setFeedback(null);
    setTranscript("");
    setInterim("");

    try {
      await startAudioMeter();
    } catch {
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
    };

    rec.onerror = (e: any) => {
      console.warn("speech error", e);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        toast({ title: "Mic blocked", variant: "destructive" });
        stopListening();
      }
    };

    rec.onend = () => {
      // auto-restart while user wants to keep listening
      if (recognitionRef.current === rec && listening) {
        try { rec.start(); } catch {}
      }
    };

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stopListening = async () => {
    setListening(false);
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      try { rec.stop(); } catch {}
    }
    stopAudio();

    const fullText = (transcript + " " + interim).trim();
    setInterim("");
    if (fullText.length < 2) return;

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("speech-coach", {
        body: { transcript: fullText, language: lang },
      });
      if (error) throw error;
      setFeedback(data as Feedback);
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e?.message || "Try again.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch {}
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Orb scale & glow react to mic level
  const scale = 1 + level * 0.55;
  const glow = 30 + level * 90;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-base font-semibold gradient-text flex items-center gap-2">
          <Sparkles size={16} /> Speaking Coach
        </h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Language picker */}
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

        {/* Orb */}
        <div className="relative flex items-center justify-center my-6 select-none">
          {/* Outer ripples */}
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
          {/* Main orb */}
          <button
            onClick={listening ? stopListening : startListening}
            disabled={analyzing}
            className="relative rounded-full flex items-center justify-center transition-transform duration-150 ease-out cursor-pointer disabled:cursor-wait"
            style={{
              width: 200,
              height: 200,
              transform: `scale(${scale})`,
              background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-mid)) 50%, hsl(var(--gradient-end)))",
              boxShadow: `0 0 ${glow}px hsl(var(--gradient-mid) / 0.6), 0 0 ${glow / 2}px hsl(var(--gradient-start) / 0.5), inset 0 0 60px hsl(var(--gradient-end) / 0.3)`,
            }}
            aria-label={listening ? "Stop listening" : "Start listening"}
          >
            {/* Inner gloss */}
            <span
              className="absolute rounded-full"
              style={{
                inset: 12,
                background: "radial-gradient(circle at 35% 30%, hsl(0 0% 100% / 0.45), transparent 55%)",
              }}
            />
            <span className="relative text-white drop-shadow-md">
              {analyzing ? <Loader2 size={42} className="animate-spin" /> : listening ? <Square size={36} fill="white" /> : <Mic size={42} />}
            </span>
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6 text-center min-h-[1.5rem]">
          {analyzing ? "Analyzing your speech…" : listening ? "Listening… tap the orb to stop" : "Tap the orb and start speaking"}
        </p>

        {/* Live transcript */}
        {(transcript || interim) && (
          <div className="w-full p-4 rounded-2xl bg-card border border-border mb-4 animate-fade-in-up">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Transcript</p>
            <p className="text-sm leading-relaxed">
              {transcript}
              {interim && <span className="opacity-50"> {interim}</span>}
            </p>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="w-full space-y-4 animate-fade-in-up">
            <div className="p-5 rounded-2xl border border-border bg-card">
              {feedback.summary && <p className="text-sm font-medium mb-4">{feedback.summary}</p>}
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
      </main>
    </div>
  );
};

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
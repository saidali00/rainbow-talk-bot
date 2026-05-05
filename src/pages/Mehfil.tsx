import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, Feather, Volume2, VolumeX, RefreshCw, Copy, Check,
  Wand2, Trash2, Download, Heart, Shuffle, Share2, Music2, MicOff,
} from "lucide-react";

type Piece = {
  id: string;
  prompt: string;
  text: string;
  lang: string;
  mood: string;
  length: string;
  ts: number;
  fav?: boolean;
};

const LANGS = [
  { code: "english", label: "English" },
  { code: "urdu", label: "اردو Urdu" },
  { code: "hindi", label: "हिन्दी Hindi" },
  { code: "kashmiri", label: "کٲشُر Koshur" },
  { code: "roman-koshur", label: "Roman Koshur" },
];

const MOODS = [
  { code: "romantic", label: "💞 Romantic" },
  { code: "mystical", label: "🌙 Mystical" },
  { code: "melancholic", label: "🥀 Melancholic" },
  { code: "playful", label: "🎈 Playful" },
  { code: "epic", label: "⚔️ Epic" },
  { code: "nostalgic", label: "📜 Nostalgic" },
];

const LENGTHS = [
  { code: "haiku", label: "Haiku" },
  { code: "short", label: "Short" },
  { code: "long", label: "Long" },
];

const PROMPTS = [
  "A lonely shikara at dawn on Dal Lake",
  "The first snowfall in Anantnag",
  "Chinar leaves falling in autumn",
  "A grandmother's kahwa story",
  "Love letter from a soldier",
  "Midnight rain on a tin roof",
  "Two old friends meeting after 20 years",
  "A poem about hope",
  "Whispers in an empty mosque",
  "The blacksmith's last song",
  "A child chasing fireflies",
  "Saffron fields at sunset",
];

const STORAGE_KEY = "mehfil:history:v1";

export default function Mehfil() {
  const [prompt, setPrompt] = useState("");
  const [lang, setLang] = useState("english");
  const [mood, setMood] = useState("mystical");
  const [length, setLength] = useState("short");
  const [history, setHistory] = useState<Piece[]>([]);
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ambient, setAmbient] = useState(false);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // load saved history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
    return () => window.speechSynthesis.cancel();
  }, []);

  // persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-30))); } catch {}
  }, [history]);

  // auto-scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, busy]);

  // ambient (procedural soft tones via WebAudio)
  useEffect(() => {
    if (!ambient) {
      ambientRef.current?.pause();
      ambientRef.current = null;
      return;
    }
    try {
      const a = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_1718e36b9a.mp3?filename=indian-bansuri-flute-loop-21661.mp3");
      a.loop = true; a.volume = 0.25;
      a.play().catch(() => {});
      ambientRef.current = a;
    } catch {}
    return () => { ambientRef.current?.pause(); ambientRef.current = null; };
  }, [ambient]);

  const speak = (text: string, id: string) => {
    if (muted) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92; u.pitch = 1;
      u.onstart = () => setSpeaking(id);
      u.onend = () => setSpeaking(null);
      window.speechSynthesis.speak(u);
    } catch {}
  };
  const stop = () => { window.speechSynthesis.cancel(); setSpeaking(null); };

  const generate = async (p?: string) => {
    const t = (p ?? prompt).trim();
    if (!t || busy) return;
    setBusy(true); stop();
    try {
      const enriched = `${t}\n\n[Mood: ${mood}] [Length: ${length}]`;
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ transcript: enriched, language: lang, mode: "mehfil" }),
      });
      const j = await r.json();
      const text = j.reply || j.error || "The muse is quiet — try again.";
      const newPiece: Piece = {
        id: crypto.randomUUID(), prompt: t, text, lang, mood, length, ts: Date.now(),
      };
      setHistory((h) => [...h, newPiece]);
      setPrompt("");
      const spoken = text.replace(/[*_#>`]/g, "").replace(/---/g, "");
      speak(spoken, newPiece.id);
    } finally {
      setBusy(false);
    }
  };

  const copyText = async (p: Piece) => {
    await navigator.clipboard.writeText(p.text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const downloadPiece = (p: Piece) => {
    const blob = new Blob(
      [`Mehfil — ${new Date(p.ts).toLocaleString()}\nPrompt: ${p.prompt}\nLanguage: ${p.lang} · Mood: ${p.mood} · ${p.length}\n\n${p.text}`],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mehfil-${p.id.slice(0, 8)}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const sharePiece = async (p: Piece) => {
    const data = { title: "Mehfil", text: p.text };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(p.text); setCopiedId(p.id); setTimeout(() => setCopiedId(null), 1500); }
    } catch {}
  };

  const toggleFav = (id: string) =>
    setHistory((h) => h.map((x) => (x.id === id ? { ...x, fav: !x.fav } : x)));

  const clearChat = () => {
    stop();
    if (history.length && !confirm("Clear all pieces from this Mehfil?")) return;
    setHistory([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const surprise = () => {
    const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    const m = MOODS[Math.floor(Math.random() * MOODS.length)].code;
    setMood(m);
    generate(p);
  };

  return (
    <div className="min-h-screen bg-[#0a0612] text-white relative overflow-hidden">
      {/* Animated gradient backdrop */}
      <motion.div
        className="absolute inset-0 opacity-60 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, rgba(244,114,182,0.25), transparent 60%), radial-gradient(circle at 80% 70%, rgba(251,191,36,0.18), transparent 60%), radial-gradient(circle at 50% 100%, rgba(139,92,246,0.25), transparent 60%)",
            "radial-gradient(circle at 70% 30%, rgba(244,114,182,0.25), transparent 60%), radial-gradient(circle at 20% 80%, rgba(251,191,36,0.18), transparent 60%), radial-gradient(circle at 50% 0%, rgba(139,92,246,0.25), transparent 60%)",
            "radial-gradient(circle at 20% 20%, rgba(244,114,182,0.25), transparent 60%), radial-gradient(circle at 80% 70%, rgba(251,191,36,0.18), transparent 60%), radial-gradient(circle at 50% 100%, rgba(139,92,246,0.25), transparent 60%)",
          ],
        }}
        transition={{ duration: 18, repeat: Infinity }}
      />

      {/* Floating embers */}
      {[...Array(18)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-300/70 shadow-[0_0_8px_2px_rgba(251,191,36,0.6)] pointer-events-none"
          style={{ left: `${Math.random() * 100}%`, top: "100%" }}
          animate={{ y: [-20, -window.innerHeight - 50], opacity: [0, 1, 0], x: [0, i % 2 ? 30 : -30] }}
          transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 backdrop-blur-md bg-black/20">
        <Link to="/" className="flex items-center gap-2 text-sm hover:text-amber-200 transition">
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <Feather size={16} className="text-amber-300" />
          <span className="text-xs sm:text-sm font-medium tracking-widest uppercase">Mehfil · AI Storyteller</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAmbient((a) => !a)}
            className={`p-2 rounded-lg hover:bg-white/10 transition ${ambient ? "text-amber-300" : "text-white/60"}`}
            title={ambient ? "Stop ambient music" : "Play ambient music"}
          >
            {ambient ? <Music2 size={16} /> : <MicOff size={16} />}
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            title={muted ? "Unmute narration" : "Mute narration"}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={clearChat}
            disabled={!history.length}
            className="p-2 rounded-lg hover:bg-white/10 transition disabled:opacity-30"
            title="Clear all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-48">
        {/* Hero (only when empty) */}
        {history.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 mb-4 shadow-[0_0_40px_rgba(244,114,182,0.5)]"
            >
              <Feather className="text-white" size={28} />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-200 via-rose-300 to-purple-300 bg-clip-text text-transparent">
              Mehfil
            </h1>
            <p className="text-sm text-white/60 mt-2 max-w-md mx-auto">
              Whisper a topic, choose a mood — receive a hand-crafted story or poem, narrated aloud.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {PROMPTS.slice(0, 6).map((p) => (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => generate(p)}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* History */}
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {history.map((p) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 backdrop-blur-xl p-5 sm:p-7 shadow-2xl relative"
              >
                <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-widest text-white/40">
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{p.lang}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{p.mood}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{p.length}</span>
                  <span className="ml-auto normal-case tracking-normal text-white/40">"{p.prompt}"</span>
                </div>

                <AnimatePresence>
                  {speaking === p.id && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-300/40 backdrop-blur"
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <motion.span key={i} className="w-1 bg-amber-300 rounded-full"
                          animate={{ height: [4, 14, 4] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                      <span className="text-[10px] uppercase tracking-widest text-amber-200 ml-1">Narrating</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className="prose prose-invert max-w-none text-base sm:text-[17px] leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {p.text.split("\n").map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <br key={i} />;
                    if (trimmed.startsWith("**") && trimmed.endsWith("**"))
                      return (
                        <h2 key={i} className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-200 to-rose-300 bg-clip-text text-transparent mb-3">
                          {trimmed.replace(/\*\*/g, "")}
                        </h2>
                      );
                    if (trimmed.startsWith("*") && trimmed.endsWith("*"))
                      return <p key={i} className="italic text-amber-200/80 mt-3">{trimmed.replace(/\*/g, "")}</p>;
                    return <p key={i} className="text-white/85 mb-2">{trimmed}</p>;
                  })}
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => (speaking === p.id ? stop() : speak(p.text.replace(/[*_#>`]/g, ""), p.id))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs"
                  >
                    {speaking === p.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    {speaking === p.id ? "Stop" : "Read"}
                  </button>
                  <button onClick={() => generate(p.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs">
                    <RefreshCw size={13} /> Re-compose
                  </button>
                  <button onClick={() => copyText(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs">
                    {copiedId === p.id ? <Check size={13} /> : <Copy size={13} />}
                    {copiedId === p.id ? "Copied" : "Copy"}
                  </button>
                  <button onClick={() => downloadPiece(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs">
                    <Download size={13} /> Save
                  </button>
                  <button onClick={() => sharePiece(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs">
                    <Share2 size={13} /> Share
                  </button>
                  <button onClick={() => toggleFav(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition ${
                      p.fav ? "bg-rose-500/20 border-rose-300/40 text-rose-200" : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}>
                    <Heart size={13} fill={p.fav ? "currentColor" : "none"} />
                    {p.fav ? "Loved" : "Love"}
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          {busy && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 text-white/60 py-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full border-2 border-amber-300/30 border-t-amber-300"
              />
              <span className="text-xs tracking-widest uppercase">The muse is writing…</span>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      {/* Composer (sticky) */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#0a0612] via-[#0a0612]/95 to-transparent pt-6 pb-4 px-4">
        <div className="max-w-3xl mx-auto rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-3 sm:p-4 shadow-2xl">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition ${
                  lang === l.code
                    ? "bg-gradient-to-r from-amber-500/30 to-rose-500/30 border-amber-300/50 text-amber-100"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}>{l.label}</button>
            ))}
            <span className="w-px bg-white/10 mx-1" />
            {MOODS.map((m) => (
              <button key={m.code} onClick={() => setMood(m.code)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition ${
                  mood === m.code
                    ? "bg-gradient-to-r from-purple-500/30 to-rose-500/30 border-purple-300/50 text-purple-100"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}>{m.label}</button>
            ))}
            <span className="w-px bg-white/10 mx-1" />
            {LENGTHS.map((l) => (
              <button key={l.code} onClick={() => setLength(l.code)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition ${
                  length === l.code
                    ? "bg-amber-500/30 border-amber-300/50 text-amber-100"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}>{l.label}</button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); generate(); }} className="flex items-center gap-2">
            <button type="button" onClick={surprise} disabled={busy}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40"
              title="Surprise me">
              <Shuffle size={16} />
            </button>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A topic, mood, or single word…"
              className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-300/50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              disabled={busy || !prompt.trim()}
              className="px-4 py-3 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 disabled:opacity-40 shadow-lg flex items-center gap-2 text-sm font-medium"
            >
              <Wand2 size={16} />
              <span className="hidden sm:inline">Compose</span>
            </motion.button>
          </form>

          <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/40">
            <span className="flex items-center gap-1"><Sparkles size={10} /> Mehfil · {history.length} piece{history.length === 1 ? "" : "s"}</span>
            {history.some((h) => h.fav) && (
              <span className="flex items-center gap-1 text-rose-300/70">
                <Heart size={10} fill="currentColor" /> {history.filter((h) => h.fav).length} loved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Feather, Volume2, VolumeX, RefreshCw, Copy, Check, Wand2 } from "lucide-react";

type Piece = { id: string; prompt: string; text: string; lang: string };

const LANGS = [
  { code: "english", label: "English" },
  { code: "urdu", label: "اردو Urdu" },
  { code: "hindi", label: "हिन्दी Hindi" },
  { code: "kashmiri", label: "کٲشُر Koshur" },
  { code: "roman-koshur", label: "Roman Koshur" },
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
];

export default function Mehfil() {
  const [prompt, setPrompt] = useState("");
  const [lang, setLang] = useState("english");
  const [piece, setPiece] = useState<Piece | null>(null);
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const speak = (text: string) => {
    if (muted) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      u.pitch = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      utterRef.current = u;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const generate = async (p?: string) => {
    const t = (p ?? prompt).trim();
    if (!t || busy) return;
    setBusy(true);
    stop();
    try {
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ transcript: t, language: lang, mode: "mehfil" }),
      });
      const j = await r.json();
      const text = j.reply || j.error || "The muse is quiet — try again.";
      const newPiece = { id: crypto.randomUUID(), prompt: t, text, lang };
      setPiece(newPiece);
      // strip markdown for speech
      const spoken = text.replace(/[*_#>`]/g, "").replace(/---/g, "");
      speak(spoken);
    } finally {
      setBusy(false);
    }
  };

  const copyText = async () => {
    if (!piece) return;
    await navigator.clipboard.writeText(piece.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0612] text-white relative overflow-hidden">
      {/* Animated gradient backdrop */}
      <motion.div
        className="absolute inset-0 opacity-60"
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
      {[...Array(20)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-300/70 shadow-[0_0_8px_2px_rgba(251,191,36,0.6)]"
          style={{ left: `${Math.random() * 100}%`, top: "100%" }}
          animate={{ y: [-20, -window.innerHeight - 50], opacity: [0, 1, 0], x: [0, (i % 2 ? 30 : -30)] }}
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
        <button
          onClick={() => setMuted((m) => !m)}
          className="p-2 rounded-lg hover:bg-white/10 transition"
          title={muted ? "Unmute narration" : "Mute narration"}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
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
            Whisper a topic, mood or a single word — receive a hand-crafted story or poem, narrated aloud.
          </p>
        </motion.div>

        {/* Input card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 sm:p-5 shadow-2xl"
        >
          <div className="flex flex-wrap gap-2 mb-3">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  lang === l.code
                    ? "bg-gradient-to-r from-amber-500/30 to-rose-500/30 border-amber-300/50 text-amber-100"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); generate(); }}
            className="flex items-center gap-2"
          >
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A topic, mood, or single word..."
              className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-300/50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={busy || !prompt.trim()}
              className="px-4 py-3 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 disabled:opacity-40 shadow-lg flex items-center gap-2 text-sm font-medium"
            >
              <Wand2 size={16} />
              <span className="hidden sm:inline">Compose</span>
            </motion.button>
          </form>

          {/* Suggestion chips */}
          {!piece && (
            <div className="mt-4 flex flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setPrompt(p); generate(p); }}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  {p}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Output */}
        <AnimatePresence mode="wait">
          {busy && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex flex-col items-center gap-3 text-white/60"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full border-2 border-amber-300/30 border-t-amber-300"
              />
              <span className="text-xs tracking-widest uppercase">The muse is writing…</span>
            </motion.div>
          )}

          {piece && !busy && (
            <motion.article
              key={piece.id}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7 }}
              className="mt-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative"
            >
              {/* speaking pulse */}
              <AnimatePresence>
                {speaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-300/40 backdrop-blur"
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1 bg-amber-300 rounded-full"
                        animate={{ height: [4, 14, 4] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                    <span className="text-[10px] uppercase tracking-widest text-amber-200 ml-1">Narrating</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="prose prose-invert max-w-none text-base sm:text-[17px] leading-relaxed whitespace-pre-wrap font-serif"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {piece.text.split("\n").map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <br key={i} />;
                  if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                    return (
                      <motion.h2
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-200 to-rose-300 bg-clip-text text-transparent mb-4"
                      >
                        {trimmed.replace(/\*\*/g, "")}
                      </motion.h2>
                    );
                  }
                  if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
                    return (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="italic text-amber-200/80 mt-4"
                      >
                        {trimmed.replace(/\*/g, "")}
                      </motion.p>
                    );
                  }
                  return (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="text-white/85 mb-2"
                    >
                      {trimmed}
                    </motion.p>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => (speaking ? stop() : speak(piece.text.replace(/[*_#>`]/g, "")))}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs"
                >
                  {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  {speaking ? "Stop" : "Read aloud"}
                </button>
                <button
                  onClick={() => generate(piece.prompt)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs"
                >
                  <RefreshCw size={14} />
                  Re-compose
                </button>
                <button
                  onClick={copyText}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <span className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/40">
                  <Sparkles size={10} /> Mehfil
                </span>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
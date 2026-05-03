import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, MapPin, Code2, Languages, Sparkles, Mountain } from "lucide-react";
import aakashFace from "@/assets/aakash-face.png";

type Msg = { id: string; role: "user" | "aakash"; content: string };

const SUGGESTIONS = [
  "Tell me about yourself",
  "Where are you from?",
  "What did you build?",
  "What's life like in Kashmir?",
  "Teach me something about coding",
  "What's your vision?",
];

const FACTS = [
  { icon: MapPin, label: "Anantnag, Kashmir · 192210" },
  { icon: Code2, label: "Founder · Xenonymous" },
  { icon: Languages, label: "Koshur · Urdu · English" },
  { icon: Sparkles, label: "Builder of WadiAi & Koshur 2.0" },
];

export default function TalkAakash() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "intro",
      role: "aakash",
      content:
        "Assalamualaikum! I'm Aakash Bashir from Anantnag, Kashmir. Ask me anything — about my work, Kashmir, code, or just say hi 🙂",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: t }]);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ transcript: t, mode: "aakash" }),
      });
      const j = await r.json();
      const reply = j.reply || j.error || "Hmm, give me a sec — try again?";
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "aakash", content: reply }]);
      // speak
      try {
        const u = new SpeechSynthesisUtterance(reply);
        u.rate = 1; u.pitch = 1;
        u.onstart = () => setSpeaking(true);
        u.onend = () => setSpeaking(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {}
    } catch (e) {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "aakash", content: "Network hiccup, try once more." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0820] via-[#120a2e] to-[#1a0b2e] text-white relative overflow-hidden">
      {/* Animated bg orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-pink-500/20 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 backdrop-blur-md bg-black/20">
        <Link to="/" className="flex items-center gap-2 text-sm hover:text-pink-300 transition">
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <Mountain size={16} className="text-pink-300" />
          <span className="text-xs sm:text-sm font-medium tracking-wide">Talk to Aakash · Live AI</span>
        </div>
        <div className="w-12" />
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 grid md:grid-cols-[320px_1fr] gap-6">
        {/* Aakash 3D-ish character panel */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl bg-white/5 border border-white/10 p-5 backdrop-blur-xl flex flex-col items-center text-center h-fit md:sticky md:top-24"
        >
          <div className="relative w-44 h-44 mb-4">
            {/* glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 blur-xl opacity-60"
              animate={{ scale: speaking ? [1, 1.15, 1] : [1, 1.05, 1], rotate: [0, 360] }}
              transition={{ scale: { duration: speaking ? 0.6 : 4, repeat: Infinity }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
            />
            {/* face with subtle 3D tilt */}
            <motion.div
              className="absolute inset-2 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl"
              style={{ perspective: 800 }}
              animate={{ rotateY: [-8, 8, -8], rotateX: [4, -4, 4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={aakashFace} alt="Aakash Bashir" className="w-full h-full object-cover" />
              {/* speaking mouth flash overlay */}
              <AnimatePresence>
                {speaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.0, 0.25, 0.0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="absolute inset-0 bg-pink-300/30 mix-blend-overlay"
                  />
                )}
              </AnimatePresence>
            </motion.div>
            {/* floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-pink-300"
                style={{ left: `${20 + i * 12}%`, top: `${10 + (i % 3) * 25}%` }}
                animate={{ y: [-5, -25, -5], opacity: [0, 1, 0] }}
                transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </div>
          <h2 className="text-xl font-bold tracking-tight">Aakash Bashir</h2>
          <p className="text-xs text-pink-200/80 mt-1">Founder · Xenonymous</p>
          <p className="text-[11px] text-white/50 mt-1">Anantnag, Kashmir · 192210</p>

          <div className="mt-5 w-full space-y-2">
            {FACTS.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-2 text-xs text-white/80 bg-white/5 rounded-lg px-3 py-2"
              >
                <f.icon size={14} className="text-pink-300 shrink-0" />
                <span>{f.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.aside>

        {/* Chat panel */}
        <section className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col min-h-[70vh]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-br-md"
                        : "bg-white/10 text-white/95 border border-white/10 rounded-bl-md"
                    }`}
                  >
                    {m.role === "aakash" && (
                      <div className="text-[10px] uppercase tracking-widest text-pink-300 mb-1">Aakash</div>
                    )}
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {busy && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-4">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-pink-300"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          {messages.length < 3 && (
            <div className="px-4 sm:px-6 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-3 sm:p-4 border-t border-white/10 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aakash anything..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-pink-400/50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={busy || !input.trim()}
              className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 disabled:opacity-40 shadow-lg"
            >
              <Send size={18} />
            </motion.button>
          </form>
        </section>
      </main>
    </div>
  );
}
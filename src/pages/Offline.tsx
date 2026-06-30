import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, WifiOff, Wifi, Send, Sparkles } from "lucide-react";
import { offlineAnswer } from "@/lib/offlineEngine";

interface Msg { role: "user" | "assistant"; text: string }

const SUGGESTIONS = [
  "12 * 8 + 5",
  "30 C to F",
  "10 km to miles",
  "what is the date today",
  "20% of 150",
];

const Offline = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Salaam! I'm WadiAi's offline helper. I work with no internet — try math, conversions, date/time, or text tools below." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const reply = offlineAnswer(q);
    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: reply.text }]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border/50 backdrop-blur sticky top-0 bg-background/80 z-10">
        <Link to="/" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center">
            <WifiOff size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold leading-tight">Offline Mode</h1>
            <p className="text-xs text-muted-foreground">Works with no internet</p>
          </div>
        </div>
        <span className={`ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${online ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
          {online ? <Wifi size={13} /> : <WifiOff size={13} />}
          {online ? "Online" : "Offline"}
        </span>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-2xl w-full mx-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </main>

      <div className="max-w-2xl w-full mx-auto px-4 pb-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 border border-border/50 flex items-center gap-1 transition-colors"
            >
              <Sparkles size={11} className="text-primary" />
              {s}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(input); }}
        className="max-w-2xl w-full mx-auto px-4 pb-5 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask offline… (math, conversions, date)"
          className="flex-1 px-4 py-3 rounded-2xl bg-muted border border-border/50 text-sm outline-none focus:border-primary/50"
        />
        <button
          type="submit"
          className="w-12 h-12 grid place-items-center rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          disabled={!input.trim()}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Offline;

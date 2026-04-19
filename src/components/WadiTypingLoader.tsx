import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const PHRASES = [
  "Thinking",
  "Composing answer",
  "Gathering details",
  "Almost there",
  "Polishing words",
];

const WadiTypingLoader = () => {
  const [phrase, setPhrase] = useState(PHRASES[0]);
  const [typed, setTyped] = useState("");

  // Cycle phrases every ~2.2s
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % PHRASES.length;
      setPhrase(PHRASES[i]);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // Typewriter effect for current phrase
  useEffect(() => {
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(phrase.slice(0, i));
      if (i >= phrase.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [phrase]);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-muted/60 border border-border animate-fade-in-up">
      <Sparkles size={14} className="text-emerald-500 animate-pulse" />
      <span className="text-sm font-medium text-foreground/80">
        {typed}
        <span className="inline-block w-1.5 h-4 bg-foreground/70 rounded-sm align-middle ml-0.5 animate-pulse" />
      </span>
    </div>
  );
};

export default WadiTypingLoader;

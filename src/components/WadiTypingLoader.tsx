import { Sparkles } from "lucide-react";

const PHRASES = [
  "Thinking",
  "Composing answer",
  "Almost there",
  "Polishing words",
];

const WadiTypingLoader = () => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-muted/60 border border-border animate-fade-in-up">
      <Sparkles size={14} className="text-emerald-500 animate-pulse" />
      <span className="relative inline-block text-sm font-medium text-foreground/80 overflow-hidden">
        <span className="inline-block animate-[wadi-cycle_6s_steps(1,end)_infinite]">
          {PHRASES[0]}
        </span>
        <style>{`
          @keyframes wadi-cycle {
            0%, 24% { content: "${PHRASES[0]}"; }
            25%, 49% { content: "${PHRASES[1]}"; }
            50%, 74% { content: "${PHRASES[2]}"; }
            75%, 100% { content: "${PHRASES[3]}"; }
          }
        `}</style>
      </span>
      {/* Blinking caret like ChatGPT */}
      <span className="inline-block w-2 h-4 bg-foreground/70 rounded-sm animate-pulse" />
      {/* Bouncing dots */}
      <span className="flex gap-1 ml-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"
            style={{ animation: `bounce-slow 1.2s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </span>
    </div>
  );
};

export default WadiTypingLoader;

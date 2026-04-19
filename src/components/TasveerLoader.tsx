import { useEffect, useState } from "react";
import { Image as ImageIcon, Sparkles, Wand2, Palette, Brush, Stars } from "lucide-react";

const STATUSES = [
  { label: "Reading your prompt", icon: Sparkles, color: "from-pink-400 to-rose-500", text: "text-pink-500" },
  { label: "Composing scene", icon: Wand2, color: "from-amber-400 to-orange-500", text: "text-amber-500" },
  { label: "5 sec more...", icon: Palette, color: "from-fuchsia-500 to-purple-500", text: "text-fuchsia-500" },
  { label: "Painting colors", icon: Brush, color: "from-violet-500 to-indigo-500", text: "text-violet-500" },
  { label: "Almost ready", icon: Stars, color: "from-emerald-400 to-teal-500", text: "text-emerald-500" },
];

const TasveerLoader = ({ prompt }: { prompt: string }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % STATUSES.length), 1800);
    return () => clearInterval(id);
  }, []);

  const current = STATUSES[stage];
  const Icon = current.icon;

  return (
    <div className="rounded-2xl border-2 border-pink-400/30 bg-gradient-to-br from-amber-500/10 via-pink-500/10 to-fuchsia-500/10 overflow-hidden animate-fade-in-up shadow-lg">
      {/* Color-shifting canvas area */}
      <div className="relative aspect-square w-full max-w-sm overflow-hidden">
        {/* Animated colorful gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${current.color} opacity-30 transition-all duration-700`}
        />
        {/* Multi-color blobs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-pink-400/40 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-amber-400/40 blur-3xl animate-pulse-glow" style={{ animationDelay: "0.7s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-fuchsia-500/40 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.3s" }} />

        {/* Shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Center icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="relative">
            <div className={`absolute inset-0 blur-2xl rounded-full opacity-70 bg-gradient-to-br ${current.color} animate-pulse-glow`} />
            <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-2xl animate-bounce-slow`}>
              <Icon size={36} className="text-white drop-shadow" strokeWidth={1.8} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border shadow">
            <ImageIcon size={12} className={current.text} />
            <span className="text-xs font-bold text-foreground/90">TasveerAI • {current.label}</span>
          </div>

          {/* Stage dots */}
          <div className="flex gap-1.5 mt-1">
            {STATUSES.map((s, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === stage
                    ? `w-6 bg-gradient-to-r ${s.color}`
                    : i < stage
                    ? "w-1.5 bg-foreground/40"
                    : "w-1.5 bg-foreground/15"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Prompt + colorful progress bars */}
      <div className="p-3 space-y-2 bg-card/40 backdrop-blur">
        <p className="text-xs text-muted-foreground italic line-clamp-2">"{prompt}"</p>
        <div className="space-y-1.5">
          <div className="h-2 rounded-full overflow-hidden bg-muted">
            <div className="h-full w-3/4 bg-gradient-to-r from-pink-400 via-fuchsia-500 to-amber-400 animate-[shimmer_1.8s_ease-in-out_infinite]" />
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-muted">
            <div className="h-full w-1/2 bg-gradient-to-r from-violet-500 via-pink-500 to-rose-400 animate-[shimmer_2.2s_ease-in-out_infinite]" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasveerLoader;

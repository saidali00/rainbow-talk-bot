import { useEffect, useState } from "react";
import { Film, Camera, Clapperboard, Sparkles, Video, Wand2 } from "lucide-react";

const STATUSES = [
  { label: "Reading scene", icon: Sparkles },
  { label: "Storyboarding", icon: Clapperboard },
  { label: "Composing frames", icon: Camera },
  { label: "5 sec more...", icon: Wand2 },
  { label: "Animating motion", icon: Video },
  { label: "Final render", icon: Film },
];

const VideoLoader = ({ prompt }: { prompt: string }) => {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % STATUSES.length), 1600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 95 ? 12 : p + Math.random() * 6));
    }, 600);
    return () => clearInterval(id);
  }, []);

  const Icon = STATUSES[stage].icon;

  return (
    <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden border-2 border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 via-emerald-500/10 to-teal-500/10 shadow-xl animate-fade-in-up">
      {/* Animated color blobs */}
      <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-cyan-400/40 blur-3xl animate-pulse-glow" />
      <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-emerald-400/40 blur-3xl animate-pulse-glow" style={{ animationDelay: "0.7s" }} />

      {/* Scanning bar */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[scan_2s_ease-in-out_infinite]" style={{ top: 0 }} />

      {/* Film strip */}
      <div className="absolute left-2 top-2 bottom-2 w-3 flex flex-col justify-around">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-sm bg-foreground/40" />
        ))}
      </div>
      <div className="absolute right-2 top-2 bottom-2 w-3 flex flex-col justify-around">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-sm bg-foreground/40" />
        ))}
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan-400/40 blur-xl animate-pulse-glow" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-teal-500 flex items-center justify-center shadow-lg animate-bounce-slow">
            <Icon size={26} className="text-white" />
          </div>
        </div>
        <p className="text-sm font-bold text-foreground">ManzarX • {STATUSES[stage].label}</p>
        <p className="text-[11px] text-muted-foreground line-clamp-2 max-w-[90%]">{prompt}</p>

        {/* Progress bar */}
        <div className="w-3/4 mt-1">
          <div className="h-1.5 rounded-full bg-foreground/15 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-500 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground font-medium">
            <span>{Math.floor(progress)}%</span>
            <span>10s clip</span>
          </div>
        </div>
      </div>

      {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_linear_infinite]" />
    </div>
  );
};

export default VideoLoader;

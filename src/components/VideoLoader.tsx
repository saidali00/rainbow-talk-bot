import { Film } from "lucide-react";

const VideoLoader = ({ prompt }: { prompt: string }) => {
  return (
    <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-cyan-500/10 via-emerald-500/10 to-teal-500/10">
      {/* Scanning bar */}
      <div className="absolute inset-0">
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[scan_2s_ease-in-out_infinite]" style={{ top: 0 }} />
      </div>
      {/* Film strip dots */}
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
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-xl animate-pulse-glow" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-teal-500 flex items-center justify-center shadow-lg animate-bounce-slow">
            <Film size={26} className="text-white" />
          </div>
        </div>
        <p className="text-sm font-bold text-foreground">Rendering ManzarX video</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{prompt}</p>
        <div className="flex gap-1.5 mt-1">
          {["Composing", "Animating", "Rendering"].map((step, i) => (
            <span
              key={step}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-foreground/10 text-foreground/80"
              style={{ animation: `pulse-glow 1.5s ease-in-out ${i * 0.3}s infinite` }}
            >
              {step}
            </span>
          ))}
        </div>
      </div>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_linear_infinite]" />
    </div>
  );
};

export default VideoLoader;

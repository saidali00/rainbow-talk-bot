import { Mountain, Sparkles } from "lucide-react";

const MountainLoader = ({ prompt }: { prompt: string }) => {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-muted/40 via-background to-primary/5 overflow-hidden animate-fade-in-up">
      {/* Skeleton image area */}
      <div className="relative aspect-square w-full max-w-sm bg-gradient-to-b from-primary/10 via-secondary/10 to-accent/10 overflow-hidden">
        {/* Shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        {/* Center mountain icon with pulse */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-primary/40 rounded-full animate-pulse-glow" />
            <div className="relative p-5 rounded-2xl bg-card/80 backdrop-blur border border-primary/30 shadow-lg">
              <Mountain size={42} className="text-primary animate-bounce-slow" strokeWidth={1.5} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/70 backdrop-blur border border-border">
            <Sparkles size={12} className="text-secondary animate-spin-slow" />
            <span className="text-xs font-medium text-foreground/80">Painting your image...</span>
          </div>

          {/* Loading dots */}
          <div className="flex gap-1.5 mt-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Animated peaks at the bottom */}
        <svg className="absolute bottom-0 left-0 w-full opacity-30" viewBox="0 0 200 60" preserveAspectRatio="none">
          <path d="M0 60 L40 25 L70 45 L110 10 L150 35 L200 20 L200 60 Z" fill="hsl(var(--primary))" />
          <path d="M0 60 L30 40 L80 30 L120 50 L170 25 L200 45 L200 60 Z" fill="hsl(var(--secondary))" opacity="0.6" />
        </svg>
      </div>

      {/* Prompt + status */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-muted-foreground italic line-clamp-2">"{prompt}"</p>
        <div className="space-y-1.5">
          <div className="h-2 rounded bg-muted animate-pulse w-3/4" />
          <div className="h-2 rounded bg-muted animate-pulse w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default MountainLoader;

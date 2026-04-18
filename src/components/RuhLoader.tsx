import { Brain, Sparkles } from "lucide-react";

const RuhLoader = () => {
  return (
    <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-violet-400/30 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-indigo-500/10 animate-fade-in-up">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-fuchsia-400/40 blur-xl animate-pulse-glow" />
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500 flex items-center justify-center shadow-lg">
          <Brain size={20} className="text-white animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
          Ruh is thinking deeply
        </span>
        <div className="flex items-center gap-1 mt-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
          <Sparkles size={12} className="text-fuchsia-500 ml-1 animate-spin-slow" />
        </div>
      </div>
    </div>
  );
};

export default RuhLoader;

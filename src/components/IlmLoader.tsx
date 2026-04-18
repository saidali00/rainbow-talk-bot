import { BookOpen, GraduationCap, Lightbulb } from "lucide-react";

const IlmLoader = ({ prompt }: { prompt: string }) => {
  return (
    <div className="rounded-2xl border-2 border-sky-400/30 bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-indigo-600/10 overflow-hidden animate-fade-in-up">
      <div className="relative p-5 flex flex-col items-center text-center gap-3">
        {/* Floating books animation */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-sky-400/30 blur-2xl animate-pulse-glow" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-xl animate-bounce-slow">
            <GraduationCap size={36} className="text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg animate-spin-slow">
            <Lightbulb size={14} className="text-yellow-900" />
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/70 backdrop-blur border border-sky-400/30">
          <BookOpen size={12} className="text-sky-500" />
          <span className="text-xs font-medium text-foreground/80">IlmAI is studying...</span>
        </div>

        <p className="text-xs text-muted-foreground italic line-clamp-2">"{prompt}"</p>

        {/* Knowledge bars */}
        <div className="w-full space-y-1.5">
          {["Researching", "Analyzing", "Explaining"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="text-[10px] font-bold w-20 text-left text-sky-600 dark:text-sky-400">{s}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-full"
                  style={{ width: "70%", animation: `shimmer 1.5s ease-in-out ${i * 0.3}s infinite` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IlmLoader;

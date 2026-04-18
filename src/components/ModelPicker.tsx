import { Brain, Image as ImageIcon, Film, Check, BookOpen, Wrench } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export type ModelKey = "ruh" | "tasveerai" | "manzarx" | "ilmai";

export const MODELS: {
  key: ModelKey;
  name: string;
  tagline: string;
  icon: typeof Brain;
  gradient: string;
  ring: string;
}[] = [
  {
    key: "ruh",
    name: "Ruh",
    tagline: "Deep thinking",
    icon: Brain,
    gradient: "from-violet-500 via-fuchsia-500 to-indigo-500",
    ring: "ring-violet-400/50",
  },
  {
    key: "ilmai",
    name: "IlmAI",
    tagline: "Study companion",
    icon: BookOpen,
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    ring: "ring-sky-400/50",
  },
  {
    key: "tasveerai",
    name: "TasveerAI",
    tagline: "Image • Nano Banana",
    icon: ImageIcon,
    gradient: "from-amber-400 via-pink-500 to-rose-500",
    ring: "ring-pink-400/50",
  },
  {
    key: "manzarx",
    name: "ManzarX",
    tagline: "Video • 10s",
    icon: Film,
    gradient: "from-cyan-400 via-emerald-400 to-teal-500",
    ring: "ring-cyan-400/50",
  },
];

interface ModelPickerProps {
  value: ModelKey;
  onChange: (m: ModelKey) => void;
}

const ModelPicker = ({ value, onChange }: ModelPickerProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = MODELS.find((m) => m.key === value)!;
  const Icon = active.icon;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handlePick = (m: typeof MODELS[number]) => {
    onChange(m.key);
    setOpen(false);
    if (m.key !== value) {
      toast({
        title: `✨ Switched to ${m.name}`,
        description: m.tagline,
      });
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-all ${
          open ? "ring-2 " + active.ring : ""
        }`}
      >
        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
          <Wrench size={12} />
        </span>
        <span className="text-xs font-semibold text-foreground">Tools</span>
        <span className="hidden sm:inline text-[10px] text-muted-foreground">•</span>
        <span
          className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-gradient-to-br ${active.gradient}`}
        >
          <Icon size={10} /> {active.name}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 min-w-[280px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up z-20">
          <div className="px-3 py-2 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Wrench size={10} /> Tools • Choose a model
            </p>
          </div>
          {MODELS.map((m) => {
            const MIcon = m.icon;
            const selected = m.key === value;
            return (
              <button
                key={m.key}
                onClick={() => handlePick(m)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors ${
                  selected ? "bg-muted/60" : ""
                }`}
              >
                <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white shadow-md`}>
                  <MIcon size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    {m.name}
                    {selected && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                        DEFAULT
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{m.tagline}</p>
                </div>
                {selected && <Check size={16} className="text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModelPicker;

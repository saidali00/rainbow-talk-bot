import { Brain, Image as ImageIcon, Film, Check, BookOpen, Wrench, Zap, Snowflake, X, Sparkles, Mountain, Home, Languages } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import koshurLogo from "@/assets/koshur-logo.png";

export type ModelKey = "wadix" | "ruh" | "tasveerai" | "manzarx" | "ilmai" | "koshur";

export const DEFAULT_MODEL: ModelKey = "wadix";

export const MODELS: {
  key: ModelKey;
  name: string;
  tagline: string;
  icon: typeof Brain;
  gradient: string;
  ring: string;
}[] = [
  {
    key: "wadix",
    name: "WadiX",
    tagline: "Fast & friendly • default",
    icon: Zap,
    gradient: "from-emerald-400 via-lime-400 to-amber-400",
    ring: "ring-emerald-400/50",
  },
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
  {
    key: "koshur",
    name: "Koshur 2.0",
    tagline: "کٲشُر • Kashmiri voice",
    icon: Snowflake,
    gradient: "from-rose-500 via-amber-400 to-teal-500",
    ring: "ring-amber-400/50",
  },
];

interface ModelPickerProps {
  value: ModelKey;
  onChange: (m: ModelKey) => void;
}

const ModelPicker = ({ value, onChange }: ModelPickerProps) => {
  const [open, setOpen] = useState(false);
  const [showKoshurInfo, setShowKoshurInfo] = useState(false);
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
    if (m.key === "koshur") {
      setShowKoshurInfo(true);
    }
  };

  return (
    <>
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
                    {m.key === "wadix" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        DEFAULT
                      </span>
                    )}
                    {selected && m.key !== "wadix" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                        ACTIVE
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

    {/* Koshur 2.0 info popup */}
    {showKoshurInfo && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setShowKoshurInfo(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scale-in border border-amber-300/30"
          style={{
            background:
              "linear-gradient(160deg, hsl(20 90% 96%) 0%, hsl(40 90% 95%) 35%, hsl(180 40% 94%) 100%)",
          }}
        >
          {/* Decorative snowflakes */}
          <Snowflake className="absolute top-3 left-3 text-teal-400/40" size={18} />
          <Snowflake className="absolute top-8 right-10 text-rose-300/50" size={12} />
          <Snowflake className="absolute bottom-20 left-6 text-amber-400/40" size={14} />

          <button
            onClick={() => setShowKoshurInfo(false)}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/70 hover:bg-white text-slate-700 transition-colors shadow-sm"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Hero with logo */}
          <div className="relative pt-7 pb-4 px-6 flex flex-col items-center text-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-60"
                style={{ background: "radial-gradient(circle, hsl(35 90% 65% / 0.7), transparent 70%)" }}
              />
              <img
                src={koshurLogo}
                alt="Koshur 2.0 — Kashmiri AI"
                width={1024}
                height={1024}
                loading="lazy"
                className="relative w-32 h-32 object-contain drop-shadow-xl"
              />
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              Koshur 2.0
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow">
                NEW
              </span>
            </h2>
            <p
              className="mt-1 text-base font-semibold"
              style={{ fontFamily: "'Noto Nastaliq Urdu', serif", color: "hsl(15 70% 35%)" }}
              dir="rtl"
            >
              کٲشُر زبان — وادیِ کشمیر کٲ آواز
            </p>
            <p className="mt-2 text-xs text-slate-600 max-w-xs">
              Your AI friend from the Valley — replies in fluent <strong>Kashmiri</strong> with the warmth of home.
            </p>
          </div>

          {/* Feature chips */}
          <div className="px-6 pb-5 grid grid-cols-2 gap-2">
            <Feature icon={<Languages size={14} />} title="Kashmiri" sub="نستعلیق + Roman" tint="rose" />
            <Feature icon={<Mountain size={14} />} title="Snowy Valley" sub="Pahalgam vibes" tint="teal" />
            <Feature icon={<Home size={14} />} title="Old Culture" sub="Pheran • Kangri" tint="amber" />
            <Feature icon={<Sparkles size={14} />} title="Smart Replies" sub="Voice & text" tint="rose" />
          </div>

          <div className="px-6 pb-6">
            <div className="rounded-2xl bg-white/70 border border-amber-200/60 p-3 text-[11px] text-slate-700 leading-relaxed">
              <strong className="text-slate-900">About:</strong> Koshur 2.0 is built to celebrate Kashmiri language &
              heritage — chinar leaves 🍁, snow-laden roofs, shikara on Dal lake, the cozy <em>pheran</em>, and the
              poetry of <em>Lal Ded</em> & <em>Habba Khatoon</em>. Ask anything — it always answers in Kashmiri.
            </div>

            <button
              onClick={() => setShowKoshurInfo(false)}
              className="mt-4 w-full py-2.5 rounded-xl font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(135deg, hsl(345 80% 55%), hsl(35 90% 55%) 50%, hsl(180 60% 45%))",
              }}
            >
              ✨ Try Koshur 2.0
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

const Feature = ({
  icon,
  title,
  sub,
  tint,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  tint: "rose" | "teal" | "amber";
}) => {
  const map = {
    rose: "from-rose-500/15 to-rose-500/5 text-rose-700 border-rose-300/40",
    teal: "from-teal-500/15 to-teal-500/5 text-teal-700 border-teal-300/40",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-800 border-amber-300/50",
  } as const;
  return (
    <div className={`rounded-xl border bg-gradient-to-br ${map[tint]} p-2.5`}>
      <div className="flex items-center gap-1.5 font-bold text-xs">
        {icon} {title}
      </div>
      <div className="text-[10px] opacity-80 mt-0.5">{sub}</div>
    </div>
  );
};

export default ModelPicker;

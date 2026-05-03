import { useEffect, useState } from "react";
import { Snowflake, X, Sparkles, Mountain, Home, Languages } from "lucide-react";
import koshurLogo from "@/assets/koshur-logo.png";

interface Props {
  onTry?: () => void;
}

const STORAGE_KEY = "koshur_home_popup_shown_v1";

const KoshurHomePopup = ({ onTry }: Props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, 10000);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  const close = () => setOpen(false);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scale-in border border-amber-300/30"
        style={{
          background:
            "linear-gradient(160deg, hsl(20 90% 96%) 0%, hsl(40 90% 95%) 35%, hsl(180 40% 94%) 100%)",
        }}
      >
        {/* Floating snowflakes */}
        <Snowflake className="absolute top-3 left-3 text-teal-400/50 animate-pulse" size={20} />
        <Snowflake className="absolute top-10 right-12 text-rose-300/60 animate-pulse" size={14} style={{ animationDelay: "0.4s" }} />
        <Snowflake className="absolute bottom-24 left-8 text-amber-400/50 animate-pulse" size={16} style={{ animationDelay: "0.8s" }} />
        <Snowflake className="absolute bottom-32 right-6 text-teal-300/40 animate-pulse" size={12} style={{ animationDelay: "1.2s" }} />

        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 transition-colors shadow"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Hero */}
        <div className="relative pt-7 pb-4 px-6 flex flex-col items-center text-center">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-70 animate-pulse"
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
          <div className="mt-3 inline-flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow">
              ✨ NEW MODEL
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700">
              Try it now
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-800">
            Meet <span className="bg-gradient-to-r from-rose-600 via-amber-500 to-teal-600 bg-clip-text text-transparent">Koshur 2.0</span>
          </h2>
          <p
            className="mt-1 text-base font-semibold"
            style={{ fontFamily: "'Noto Nastaliq Urdu', serif", color: "hsl(15 70% 35%)" }}
            dir="rtl"
          >
            کٲشُر زبان — وادیِ کشمیر کٲ آواز
          </p>
          <p className="mt-2 text-xs text-slate-600 max-w-xs">
            Now replies in <strong>both Nastaliq & Roman Kashmiri</strong> — your voice from the Valley.
          </p>
        </div>

        {/* Feature chips */}
        <div className="px-6 pb-5 grid grid-cols-2 gap-2">
          <Feature icon={<Languages size={14} />} title="Dual Script" sub="نستعلیق + Roman" tint="rose" />
          <Feature icon={<Mountain size={14} />} title="Snowy Valley" sub="Pahalgam vibes" tint="teal" />
          <Feature icon={<Home size={14} />} title="Old Culture" sub="Pheran • Kangri" tint="amber" />
          <Feature icon={<Sparkles size={14} />} title="Smart Replies" sub="Voice & text" tint="rose" />
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl bg-white/70 border border-amber-200/60 p-3 text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-slate-900">About:</strong> Koshur 2.0 celebrates Kashmiri language &
            heritage — chinar leaves 🍁, snow-laden roofs, shikara on Dal lake, the cozy <em>pheran</em>, and the
            poetry of <em>Lal Ded</em> & <em>Habba Khatoon</em>. Every answer comes in both Nastaliq and Roman
            Kashmiri so everyone can read it.
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={close}
              className="flex-1 py-2.5 rounded-xl font-semibold text-slate-700 bg-white/70 hover:bg-white border border-slate-200 transition"
            >
              Maybe later
            </button>
            <button
              onClick={() => {
                close();
                onTry?.();
              }}
              className="flex-[1.4] py-2.5 rounded-xl font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(135deg, hsl(345 80% 55%), hsl(35 90% 55%) 50%, hsl(180 60% 45%))",
              }}
            >
              ✨ Try Koshur 2.0
            </button>
          </div>
        </div>
      </div>
    </div>
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

export default KoshurHomePopup;
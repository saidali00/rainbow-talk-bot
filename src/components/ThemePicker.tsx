import { useEffect, useState } from "react";
import { Palette, ChevronLeft, Check } from "lucide-react";
import { THEMES, ThemeId, applyTheme, getStoredTheme, playThemeSound } from "@/lib/themes";

interface Props {
  onBack: () => void;
}

const ThemePicker = ({ onBack }: Props) => {
  const [active, setActive] = useState<ThemeId>(getStoredTheme());

  useEffect(() => {
    applyTheme(active);
  }, []);

  const choose = (id: ThemeId) => {
    setActive(id);
    applyTheme(id);
    const t = THEMES.find((x) => x.id === id);
    if (t) playThemeSound(t);
  };

  return (
    <div className="flex-1 flex flex-col">
      <button
        onClick={onBack}
        className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-dark-hover transition-colors"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <h2 className="px-6 mt-3 text-xs font-semibold uppercase tracking-wider opacity-50 flex items-center gap-2">
        <Palette size={12} /> Themes & Sounds
      </h2>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-2">
        {THEMES.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => choose(t.id)}
              className={`w-full group flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                isActive
                  ? "bg-sidebar-dark-hover border-sidebar-dark-active scale-[1.01]"
                  : "border-transparent hover:bg-sidebar-dark-hover hover:border-sidebar-dark-hover"
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3"
                style={{
                  background: t.id === "default"
                    ? "linear-gradient(135deg, hsl(174 72% 40%), hsl(260 60% 58%), hsl(32 95% 55%))"
                    : `linear-gradient(135deg, hsl(${t.vars["--gradient-start"] || "0 0% 50%"}), hsl(${t.vars["--gradient-mid"] || "0 0% 50%"}), hsl(${t.vars["--gradient-end"] || "0 0% 50%"}))`,
                }}
              >
                <span className="drop-shadow">{t.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  {t.label}
                  {isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/30 text-primary">ACTIVE</span>
                  )}
                </div>
                <div className="text-[11px] opacity-60 truncate">{t.description}</div>
              </div>
              {isActive && <Check size={16} className="text-primary shrink-0" />}
            </button>
          );
        })}
        <p className="text-[10px] opacity-40 text-center pt-2 px-4">
          Each theme plays a unique signature sound. Tap any theme to preview.
        </p>
      </div>
    </div>
  );
};

export default ThemePicker;

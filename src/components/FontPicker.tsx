import { useEffect, useState } from "react";
import { Type, ChevronLeft, Check } from "lucide-react";
import { FONTS, applyFont, getStoredFont } from "@/lib/fonts";

interface Props {
  onBack: () => void;
}

const FontPicker = ({ onBack }: Props) => {
  const [active, setActive] = useState<string>(getStoredFont());

  useEffect(() => {
    applyFont(active);
  }, []);

  const choose = (id: string) => {
    setActive(id);
    applyFont(id);
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
        <Type size={12} /> Answer Font
      </h2>
      <p className="px-6 mt-1 text-[11px] opacity-50">Pick a font — every AI answer will use it.</p>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-2">
        {FONTS.map((f) => {
          const isActive = f.id === active;
          return (
            <button
              key={f.id}
              onClick={() => choose(f.id)}
              className={`w-full group flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                isActive
                  ? "bg-sidebar-dark-hover border-sidebar-dark-active scale-[1.01]"
                  : "border-transparent hover:bg-sidebar-dark-hover hover:border-sidebar-dark-hover"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  {f.label}
                  {f.urdu && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">اردو</span>
                  )}
                  {isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/30 text-primary">ACTIVE</span>
                  )}
                </div>
                <div
                  className="text-lg opacity-90 truncate mt-0.5"
                  style={{ fontFamily: f.family || "inherit", direction: f.urdu ? "rtl" : "ltr" }}
                >
                  {f.sample}
                </div>
              </div>
              {isActive && <Check size={16} className="text-primary shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FontPicker;
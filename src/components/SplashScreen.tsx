import { useState, useEffect } from "react";
import wadiLogo from "@/assets/wadi-ai-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SEASONS = [
  { name: "snow", bg: "from-blue-100 via-white to-blue-200", glow1: "bg-blue-300/30", glow2: "bg-cyan-200/20", text: "text-blue-600" },
  { name: "spring", bg: "from-green-100 via-emerald-50 to-teal-100", glow1: "bg-green-300/30", glow2: "bg-emerald-200/20", text: "text-emerald-600" },
  { name: "autumn", bg: "from-orange-100 via-amber-50 to-yellow-100", glow1: "bg-orange-300/30", glow2: "bg-amber-200/20", text: "text-amber-600" },
  { name: "summer", bg: "from-rose-100 via-pink-50 to-purple-100", glow1: "bg-rose-300/30", glow2: "bg-purple-200/20", text: "text-rose-600" },
];

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState(0);
  const [seasonIdx, setSeasonIdx] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 5400);
    const t3 = setTimeout(() => onComplete(), 6000);

    // Cycle seasons every 1.2s
    const seasonInterval = setInterval(() => {
      setSeasonIdx((prev) => (prev + 1) % SEASONS.length);
    }, 1200);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearInterval(seasonInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const season = SEASONS[seasonIdx];

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-1000 bg-gradient-to-br ${season.bg} ${
        phase === 2 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Animated glow orbs that change with season */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full ${season.glow1} blur-[140px] animate-pulse transition-colors duration-1000`} />
        <div className={`absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full ${season.glow2} blur-[120px] animate-pulse transition-colors duration-1000`} style={{ animationDelay: "0.5s" }} />
        <div className={`absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full ${season.glow1} blur-[100px] animate-pulse transition-colors duration-1000`} style={{ animationDelay: "1s" }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-foreground/10"
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${5 + (i * 13) % 90}%`,
              animation: `splash-float ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Logo - BIG */}
      <div
        className={`relative z-10 transition-all duration-1000 ease-out ${
          phase >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}
      >
        <div className="relative">
          <div className={`absolute -inset-8 rounded-[2rem] ${season.glow1} blur-3xl animate-pulse transition-colors duration-1000`} />
          <img
            src={wadiLogo}
            alt="WadiAi Logo"
            className="relative w-64 h-64 object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Welcome Text with season color animation */}
      <h1
        className={`relative z-10 mt-6 text-5xl font-bold transition-all duration-1000 ease-out ${season.text} ${
          phase >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ transitionDelay: "300ms" }}
      >
        Welcome to{" "}
        <span className="splash-season-text">WadiAi</span>
      </h1>

      {/* Tagline */}
      <p
        className={`relative z-10 mt-3 text-base text-foreground/60 transition-all duration-700 ease-out ${
          phase >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "500ms" }}
      >
        Next-Generation AI Assistant
      </p>

      {/* Feature badges */}
      <div
        className={`relative z-10 mt-10 flex flex-wrap justify-center gap-2.5 max-w-md px-4 transition-all duration-700 ease-out ${
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {[
          "⚡ Ultra Fast Responses",
          "🧠 Advanced Reasoning",
          "🎨 Creative & Versatile",
          "🔒 Private & Secure",
        ].map((feature, i) => (
          <span
            key={feature}
            className="px-4 py-2 text-xs font-medium rounded-full border border-foreground/10 bg-white/50 backdrop-blur-md text-foreground/80 shadow-sm transition-all duration-500"
            style={{ transitionDelay: `${i * 120 + 100}ms` }}
          >
            {feature}
          </span>
        ))}
      </div>

      {/* Description */}
      <p
        className={`relative z-10 mt-6 text-sm text-center text-foreground/50 max-w-xs px-4 transition-all duration-700 ease-out ${
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ transitionDelay: "600ms" }}
      >
        Built different. Smarter context understanding, faster streaming, and beautifully crafted responses.
      </p>

      {/* Powered by */}
      <div
        className={`relative z-10 mt-auto mb-8 flex flex-col items-center transition-all duration-700 ease-out ${
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "700ms" }}
      >
        <div className="flex items-center gap-2 text-sm text-foreground/50">
          <span>Powered by</span>
          <span className={`font-bold ${season.text} transition-colors duration-1000`}>WadiAi</span>
          <span className={`${season.text} transition-colors duration-1000`}>×</span>
          <span className="font-bold text-foreground/80">Xenonymous</span>
        </div>
        {/* Loading bar */}
        <div className="mt-4 w-48 h-1 rounded-full bg-foreground/10 overflow-hidden">
          <div
            className="h-full rounded-full splash-load-bar"
            style={{
              animation: "splash-load 5.4s ease-in-out forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

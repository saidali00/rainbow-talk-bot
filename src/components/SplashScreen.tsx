import { useState, useEffect } from "react";
import wadiLogo from "@/assets/wadi-ai-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState(0); // 0=logo, 1=details, 2=fade-out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 5400);
    const t3 = setTimeout(() => onComplete(), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-400 ${
        phase === 2 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-accent/10 blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Logo */}
      <div
        className={`relative z-10 transition-all duration-700 ease-out ${
          phase >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 blur-xl animate-pulse" />
          <img
            src={wadiLogo}
            alt="WadiAi Logo"
            className="relative w-44 h-44 rounded-3xl object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Title */}
      <h1
        className={`relative z-10 mt-6 text-4xl font-bold gradient-text transition-all duration-700 ease-out delay-200 ${
          phase >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        WadiAi
      </h1>

      {/* Tagline */}
      <p
        className={`relative z-10 mt-2 text-sm text-muted-foreground transition-all duration-700 ease-out delay-300 ${
          phase >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        Next-Generation AI Assistant
      </p>

      {/* Feature badges */}
      <div
        className={`relative z-10 mt-8 flex flex-wrap justify-center gap-2 max-w-sm px-4 transition-all duration-700 ease-out ${
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
            className="px-3 py-1.5 text-xs rounded-full border border-border bg-card/60 backdrop-blur-sm text-foreground shadow-sm"
            style={{ transitionDelay: `${i * 100 + 100}ms` }}
          >
            {feature}
          </span>
        ))}
      </div>

      {/* Description */}
      <p
        className={`relative z-10 mt-6 text-xs text-center text-muted-foreground max-w-xs px-4 transition-all duration-700 ease-out ${
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ transitionDelay: "500ms" }}
      >
        Built different. Smarter context understanding, faster streaming, and beautifully crafted responses.
      </p>

      {/* Powered by */}
      <div
        className={`relative z-10 mt-auto mb-8 flex flex-col items-center transition-all duration-700 ease-out ${
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "600ms" }}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Powered by</span>
          <span className="font-semibold gradient-text">WadiAi</span>
          <span className="text-primary">×</span>
          <span className="font-semibold text-foreground">Xenonymous</span>
        </div>
        {/* Loading bar */}
        <div className="mt-4 w-40 h-0.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary"
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

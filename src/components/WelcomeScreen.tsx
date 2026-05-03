import { Code, Lightbulb, Pen, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import wadiLogo from "@/assets/wadi-ai-logo.png";

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  { icon: Code, label: "Write code", prompt: "Help me write a Python function to sort a list of objects by multiple properties" },
  { icon: Lightbulb, label: "Brainstorm ideas", prompt: "Give me 5 creative startup ideas in the sustainability space" },
  { icon: Pen, label: "Help me write", prompt: "Write a professional email to follow up after a job interview" },
  { icon: Zap, label: "Explain a concept", prompt: "Explain quantum computing in simple terms with analogies" },
];

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  // Earthquake → settle animation. Shake hard for ~1.6s, then "settle" for the
  // remainder of a 10s cycle, then repeat. Gives a playful broken→fixed feel.
  const [phase, setPhase] = useState<"quake" | "settle">("quake");
  useEffect(() => {
    let t1: number;
    let t2: number;
    const loop = () => {
      setPhase("quake");
      t1 = window.setTimeout(() => setPhase("settle"), 1600);
      t2 = window.setTimeout(loop, 10000);
    };
    loop();
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 animate-fade-in-up">
      <div className="mb-2">
        <img src={wadiLogo} alt="WadiAi Logo" className="w-20 h-20 rounded-2xl object-contain" />
      </div>
      <h2 className="text-3xl font-bold gradient-text mb-1">WadiAi</h2>
      
      <p className="text-muted-foreground text-sm mb-8">How can I help you today?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {suggestions.map((s, i) => (
          <button
            key={s.label}
            onClick={() => onSuggestionClick(s.prompt)}
            style={{ animationDelay: `${i * 0.08}s` }}
            className={`flex items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/30 text-left group transition-colors ${
              phase === "quake" ? "animate-quake" : "transition-transform duration-700"
            }`}
          >
            <div className="p-2 rounded-xl bg-muted text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <s.icon size={16} />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.prompt}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground/70">
        {phase === "quake" ? "🌋 Aftershock... hold on" : "✓ Steady"}
      </p>
    </div>
  );
};

export default WelcomeScreen;

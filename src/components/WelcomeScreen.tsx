import { Code, Lightbulb, Pen, Zap } from "lucide-react";
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
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 animate-fade-in-up">
      <div className="mb-2">
        <img src={wadiLogo} alt="WadiAi Logo" className="w-20 h-20 rounded-2xl object-contain" />
      </div>
      <h2 className="text-3xl font-bold gradient-text mb-1">WadiAi</h2>
      
      <p className="text-muted-foreground text-sm mb-8">How can I help you today?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => onSuggestionClick(s.prompt)}
            className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all text-left group"
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
    </div>
  );
};

export default WelcomeScreen;

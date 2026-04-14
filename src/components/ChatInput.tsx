import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="relative gradient-border rounded-2xl">
        <div className="flex items-end gap-2 bg-card rounded-2xl p-2">
          <div className="p-2 text-secondary">
            <Sparkles size={18} />
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask WadiAi anything..."
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-foreground placeholder:text-muted-foreground text-sm py-2 focus:outline-none max-h-40"
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-30 hover:opacity-90 transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2">
        WadiAi can make mistakes. Consider checking important information.
      </p>
    </div>
  );
};

export default ChatInput;

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Sparkles, Plus, Image as ImageIcon, X, Loader2, CheckCircle2, Mountain } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSend: (message: string, image?: string) => void;
  onGenerateImage?: (prompt: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, onGenerateImage, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if ((!trimmed && !attachedImage) || disabled) return;
    if (imageMode && trimmed && onGenerateImage) {
      onGenerateImage(trimmed);
      setValue("");
      setImageMode(false);
      return;
    }
    onSend(trimmed || "What's in this image?", attachedImage || undefined);
    setValue("");
    setAttachedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      setValue((prev) => prev + event.results[0][0].transcript);
    };
    recognition.start();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageLoading(true);
    setShowAttachMenu(false);
    const reader = new FileReader();
    reader.onload = () => {
      // Simulate brief loading for nice UX
      setTimeout(() => {
        setAttachedImage(reader.result as string);
        setImageLoading(false);
        toast({
          title: "✓ Image attached",
          description: "Ask anything about this image.",
        });
      }, 500);
    };
    reader.onerror = () => {
      setImageLoading(false);
      toast({ title: "Failed to read image", variant: "destructive" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = () => {
    setAttachedImage(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Loading ring while reading file */}
      {imageLoading && (
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card shadow-sm animate-fade-in-up">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Attaching image...</span>
        </div>
      )}

      {/* Attached image preview */}
      {attachedImage && !imageLoading && (
        <div className="mb-2 inline-block relative animate-scale-in">
          <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 shadow-md group">
            <img src={attachedImage} alt="Attached" className="max-h-32 max-w-48 object-cover rounded-xl" />
            <div className="absolute top-1 left-1 bg-primary/90 text-primary-foreground rounded-full p-0.5">
              <CheckCircle2 size={14} />
            </div>
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors" />
            <button
              onClick={removeImage}
              className="absolute top-1 right-1 p-1 rounded-full bg-foreground/70 text-background hover:bg-foreground/90 transition-all scale-0 group-hover:scale-100"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Image-create mode chip */}
      {imageMode && (
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-medium animate-scale-in">
          <Mountain size={14} className="animate-bounce-slow" />
          <span>Image Create mode • describe what to paint</span>
          <button onClick={() => setImageMode(false)} className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
            <X size={12} />
          </button>
        </div>
      )}

      <div className="relative gradient-border rounded-2xl">
        <div className="flex items-end gap-1 bg-card rounded-2xl p-2">
          {/* Plus button for attachments */}
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu((p) => !p)}
              disabled={disabled}
              className={`p-2 rounded-xl transition-all ${
                showAttachMenu
                  ? "bg-primary text-primary-foreground rotate-45"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title="Attach"
            >
              <Plus size={18} />
            </button>

            {/* Attach menu */}
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in-up z-10 min-w-[200px]">
                <button
                  onClick={() => { fileInputRef.current?.click(); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left whitespace-nowrap"
                >
                  <ImageIcon size={16} className="text-primary" />
                  <span>Attach Photo</span>
                </button>
                <button
                  onClick={() => {
                    setImageMode(true);
                    setShowAttachMenu(false);
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left whitespace-nowrap border-t border-border"
                >
                  <Mountain size={16} className="text-secondary" />
                  <span>Image Create</span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold">AI</span>
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className={`p-2 ${imageMode ? "text-primary" : "text-secondary"}`}>
            {imageMode ? <Mountain size={18} /> : <Sparkles size={18} />}
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={imageMode ? "Describe an image to create..." : "Ask WadiAi anything..."}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-foreground placeholder:text-muted-foreground text-sm py-2 focus:outline-none max-h-40"
          />
          <button
            onClick={handleVoice}
            disabled={disabled}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="Voice input"
          >
            <Mic size={16} />
          </button>
          <button
            onClick={handleSubmit}
            disabled={disabled || (!value.trim() && !attachedImage)}
            className={`p-2.5 rounded-xl text-primary-foreground disabled:opacity-30 hover:opacity-90 transition-all ${
              imageMode ? "bg-gradient-to-br from-primary via-secondary to-accent" : "bg-primary"
            }`}
          >
            {imageMode ? <Mountain size={16} /> : <Send size={16} />}
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
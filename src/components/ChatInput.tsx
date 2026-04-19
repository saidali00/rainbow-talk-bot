import { useState, useRef, useEffect } from "react";
import { Send, Mic, Plus, Image as ImageIcon, X, Loader2, CheckCircle2, Film } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ModelPicker, { ModelKey, MODELS } from "./ModelPicker";

const MAX_PHOTOS = 10;

interface ChatInputProps {
  onSend: (message: string, image?: string) => void;
  onGenerateImage?: (prompt: string, images?: string[]) => void;
  onGenerateVideo?: (prompt: string) => void;
  disabled?: boolean;
  model: ModelKey;
  onModelChange: (m: ModelKey) => void;
}

const ChatInput = ({ onSend, onGenerateImage, onGenerateVideo, disabled, model, onModelChange }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null); // for chat (Ruh/IlmAI vision)
  const [tasveerPhotos, setTasveerPhotos] = useState<string[]>([]); // for TasveerAI (max 10)
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tasveerInputRef = useRef<HTMLInputElement>(null);

  const isTasveer = model === "tasveerai";
  const isManzar = model === "manzarx";

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [value]);

  // Clear photos when leaving TasveerAI
  useEffect(() => {
    if (!isTasveer) setTasveerPhotos([]);
    if (isTasveer || isManzar) setAttachedImage(null);
  }, [model, isTasveer, isManzar]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (disabled) return;

    if (isTasveer && trimmed && onGenerateImage) {
      onGenerateImage(trimmed, tasveerPhotos.length ? tasveerPhotos : undefined);
      setValue("");
      setTasveerPhotos([]);
      return;
    }
    if (isManzar && trimmed && onGenerateVideo) {
      onGenerateVideo(trimmed);
      setValue("");
      return;
    }
    if (!trimmed && !attachedImage) return;
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

  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageLoading(true);
    setShowAttachMenu(false);
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        setAttachedImage(reader.result as string);
        setImageLoading(false);
        toast({ title: "✓ Image attached", description: "Ask anything about this image." });
      }, 400);
    };
    reader.onerror = () => {
      setImageLoading(false);
      toast({ title: "Failed to read image", variant: "destructive" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleTasveerFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - tasveerPhotos.length;
    if (remaining <= 0) {
      toast({ title: `Limit reached`, description: `Max ${MAX_PHOTOS} photos.`, variant: "destructive" });
      e.target.value = "";
      return;
    }
    const toRead = files.slice(0, remaining);
    if (files.length > remaining) {
      toast({ title: "Some photos skipped", description: `Only ${remaining} more allowed (max ${MAX_PHOTOS}).` });
    }
    Promise.all(
      toRead.map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(f);
          })
      )
    )
      .then((urls) => {
        setTasveerPhotos((prev) => [...prev, ...urls].slice(0, MAX_PHOTOS));
        toast({ title: `✓ ${urls.length} photo(s) added` });
      })
      .catch(() => toast({ title: "Failed to read photos", variant: "destructive" }));
    e.target.value = "";
  };

  const removeTasveerPhoto = (i: number) => setTasveerPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const m = MODELS.find((x) => x.key === model)!;
  const MIcon = m.icon;
  const placeholder = isTasveer
    ? tasveerPhotos.length
      ? `Describe edits for ${tasveerPhotos.length} photo(s)...`
      : "Describe an image (or attach photos to edit)..."
    : isManzar
    ? "Describe a 10s scene for ManzarX..."
    : model === "ilmai"
    ? "Ask IlmAI any study question..."
    : model === "ruh"
    ? "Ask Ruh anything (deep thinking)..."
    : "Ask WadiX anything — fast & friendly...";

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Tools picker + tagline */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <ModelPicker value={model} onChange={onModelChange} />
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          {model === "wadix" && "Fast • friendly • default"}
          {model === "ruh" && "Thinks deeply • streams answer"}
          {model === "ilmai" && "Study companion • clear explanations"}
          {model === "tasveerai" && "Nano Banana • image create or edit"}
          {model === "manzarx" && "Generates a 10s animated video"}
        </span>
      </div>

      {/* Chat-mode loading ring */}
      {imageLoading && !isTasveer && (
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card shadow-sm animate-fade-in-up">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Attaching image...</span>
        </div>
      )}

      {/* Chat-mode attached image preview */}
      {attachedImage && !isTasveer && !imageLoading && (
        <div className="mb-2 inline-block relative animate-scale-in">
          <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 shadow-md group">
            <img src={attachedImage} alt="Attached" className="max-h-32 max-w-48 object-cover rounded-xl" />
            <div className="absolute top-1 left-1 bg-primary/90 text-primary-foreground rounded-full p-0.5">
              <CheckCircle2 size={14} />
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute top-1 right-1 p-1 rounded-full bg-foreground/70 text-background hover:bg-foreground/90 transition-all"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* TasveerAI multi-photo strip */}
      {isTasveer && tasveerPhotos.length > 0 && (
        <div className="mb-2 flex items-center gap-2 flex-wrap animate-fade-in-up">
          {tasveerPhotos.map((src, i) => (
            <div key={i} className="relative group">
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                className="w-16 h-16 object-cover rounded-xl border-2 border-pink-400/40 shadow"
              />
              <button
                onClick={() => removeTasveerPhoto(i)}
                className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-foreground text-background opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-pink-500/15 text-pink-600 dark:text-pink-400">
            {tasveerPhotos.length}/{MAX_PHOTOS}
          </span>
        </div>
      )}

      <div className="relative gradient-border rounded-2xl">
        <div className="flex items-end gap-1 bg-card rounded-2xl p-2">
          {/* Plus button */}
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

            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in-up z-10 min-w-[220px]">
                {isTasveer ? (
                  <>
                    <button
                      onClick={() => {
                        tasveerInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left whitespace-nowrap"
                    >
                      <ImageIcon size={16} className="text-pink-500" />
                      <span>Add Photos</span>
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-600 dark:text-pink-400 font-bold">
                        max {MAX_PHOTOS}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setTasveerPhotos([]);
                        setShowAttachMenu(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left whitespace-nowrap border-t border-border"
                    >
                      <X size={16} className="text-muted-foreground" />
                      <span>None (text-only prompt)</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left whitespace-nowrap"
                  >
                    <ImageIcon size={16} className="text-primary" />
                    <span>Attach Photo</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChatFileSelect} className="hidden" />
          <input
            ref={tasveerInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleTasveerFiles}
            className="hidden"
          />

          <div className={`p-2 text-transparent bg-clip-text bg-gradient-to-br ${m.gradient}`}>
            <MIcon size={18} className="text-foreground/80" />
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
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
            disabled={disabled || (!value.trim() && !attachedImage && !(isTasveer && tasveerPhotos.length))}
            className={`p-2.5 rounded-xl text-white disabled:opacity-30 hover:opacity-90 transition-all bg-gradient-to-br ${m.gradient} shadow-md`}
            title={`Send to ${m.name}`}
          >
            {isTasveer ? <ImageIcon size={16} /> : isManzar ? <Film size={16} /> : <Send size={16} />}
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

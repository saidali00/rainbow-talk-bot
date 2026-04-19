import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bot, User, Copy, Check, Volume2, VolumeX, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TasveerLoader from "./TasveerLoader";
import VideoLoader from "./VideoLoader";
import VideoPlayer from "./VideoPlayer";
import RuhLoader from "./RuhLoader";
import IlmLoader from "./IlmLoader";
import WadiTypingLoader from "./WadiTypingLoader";
import { ModelKey } from "./ModelPicker";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  onRelatedClick?: (question: string) => void;
  image?: string;
  generatedImage?: string;
  generatingImage?: boolean;
  imagePrompt?: string;
  videoFrames?: string[];
  generatingVideo?: boolean;
  videoPrompt?: string;
  chatMode?: ModelKey;
}

const ChatMessage = ({ role, content, isStreaming, onRelatedClick, image, generatedImage, generatingImage, imagePrompt, videoFrames, generatingVideo, videoPrompt, chatMode }: ChatMessageProps) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const showThinkLoader = !isUser && isStreaming && !content && !generatingImage && !generatingVideo;

  // Parse related questions from content
  let mainContent = content;
  let relatedQuestions: string[] = [];

  if (!isUser && !isStreaming) {
    const relatedMatch = content.match(/---\s*\n\s*\*\*Related[^*]*\*\*\s*\n([\s\S]*?)$/i);
    if (relatedMatch) {
      mainContent = content.slice(0, relatedMatch.index).trim();
      relatedQuestions = relatedMatch[1]
        .split("\n")
        .map((l) => l.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      toast({ title: "Speech not supported", description: "Your browser doesn't support text-to-speech.", variant: "destructive" });
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();

    const cleanText = mainContent
      .replace(/```[\s\S]*?```/g, " code block ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[#*_~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    if (!cleanText) return;

    const chunks = cleanText.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [cleanText];
    let index = 0;
    const speakNext = () => {
      if (index >= chunks.length) {
        setSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.lang = "en-US";
      utterance.onend = () => {
        index++;
        speakNext();
      };
      utterance.onerror = () => {
        setSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    };
    setSpeaking(true);
    speakNext();
  };

  return (
    <div className={`flex gap-3 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className="max-w-[75%] space-y-2">
        {/* Attached image */}
        {image && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-sm animate-fade-in-up">
            <img src={image} alt="Attached" className="max-w-full max-h-60 object-cover rounded-2xl" />
          </div>
        )}

        {/* Generating image - colorful TasveerAI loader */}
        {generatingImage && <TasveerLoader prompt={imagePrompt || "Creating image..."} />}

        {/* Generated image result */}
        {generatedImage && !generatingImage && (
          <div className="relative group rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg animate-scale-in">
            <img src={generatedImage} alt={imagePrompt || "Generated"} className="max-w-full max-h-96 object-contain bg-muted" />
            <a
              href={generatedImage}
              download={`wadiai-${Date.now()}.png`}
              className="absolute top-2 right-2 p-2 rounded-xl bg-foreground/70 text-background opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground"
              title="Download"
            >
              <Download size={14} />
            </a>
          </div>
        )}

        {/* Generating video - ManzarX loader */}
        {generatingVideo && <VideoLoader prompt={videoPrompt || "Rendering video..."} />}

        {/* Generated video result */}
        {videoFrames && videoFrames.length > 0 && !generatingVideo && (
          <VideoPlayer frames={videoFrames} prompt={videoPrompt || "Video"} />
        )}

        {/* Unique thinking loader per chat model */}
        {showThinkLoader && chatMode === "ilmai" && <IlmLoader prompt={"Preparing your study answer..."} />}
        {showThinkLoader && chatMode === "ruh" && <RuhLoader />}
        {showThinkLoader && (chatMode === "wadix" || !chatMode) && <WadiTypingLoader />}

        {isUser ? (
          <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed bg-chat-user text-chat-user-foreground rounded-tr-md">
            <p>{content}</p>
          </div>
        ) : (
          <div className="text-sm leading-relaxed text-foreground">
            <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs">
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");
                    if (match) {
                      return (
                        <div className="relative group my-3 rounded-xl overflow-hidden border border-border shadow-sm">
                          <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border">
                            <span className="text-xs font-medium text-muted-foreground">{match[1]}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(codeString);
                                toast({ title: "Code copied!" });
                              }}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                              <Copy size={12} /> Copy
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: 0,
                              padding: "1rem",
                              fontSize: "0.8rem",
                            }}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {mainContent}
              </ReactMarkdown>
            </div>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-secondary rounded-full animate-pulse-glow ml-1 align-middle" />
            )}
          </div>
        )}

        {/* Action buttons */}
        {!isStreaming && content && (
          <div className="flex items-center gap-1 px-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Copy"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-lg transition-colors ${
                speaking
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title={speaking ? "Stop" : "Listen"}
            >
              {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        )}

        {/* Related questions */}
        {relatedQuestions.length > 0 && onRelatedClick && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-semibold text-muted-foreground px-1">Related</p>
            <div className="flex flex-wrap gap-1.5">
              {relatedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onRelatedClick(q)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-muted hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
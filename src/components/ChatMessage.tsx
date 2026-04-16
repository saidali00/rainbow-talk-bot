import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User, Copy, Check, Volume2, VolumeX } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  onRelatedClick?: (question: string) => void;
}

const ChatMessage = ({ role, content, isStreaming, onRelatedClick }: ChatMessageProps) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(content.replace(/[#*`_~]/g, ""));
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

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
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-chat-user text-chat-user-foreground rounded-tr-md"
              : "bg-chat-assistant-bg text-chat-assistant-foreground shadow-sm border border-border rounded-tl-md"
          }`}
        >
          {isUser ? (
            <p>{content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-sidebar-dark prose-pre:text-sidebar-dark-foreground">
              <ReactMarkdown>{mainContent}</ReactMarkdown>
            </div>
          )}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-secondary rounded-full animate-pulse-glow ml-1 align-middle" />
          )}
        </div>

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

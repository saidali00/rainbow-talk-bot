import { useState, useRef, useEffect, useCallback } from "react";
import ChatSidebar, { Conversation } from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import SplashScreen from "@/components/SplashScreen";

import { streamChat, ChatMessage as AIChatMessage } from "@/lib/openrouter";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>({});
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = activeConvId ? messagesByConv[activeConvId] || [] : [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, scrollToBottom]);

  const createConversation = (firstMessage?: string): string => {
    const id = crypto.randomUUID();
    const title = firstMessage
      ? firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "..." : "")
      : "New Chat";
    setConversations((prev) => [{ id, title, createdAt: new Date() }, ...prev]);
    setActiveConvId(id);
    return id;
  };

  const handleSend = async (text: string) => {
    let convId = activeConvId;
    if (!convId) {
      convId = createConversation(text);
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();

    // Build history for API before updating state
    const history: AIChatMessage[] = [
      ...(messagesByConv[convId!] || []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: text },
    ];

    // Add user message + empty assistant message in one update
    setMessagesByConv((prev) => ({
      ...prev,
      [convId!]: [
        ...(prev[convId!] || []),
        userMsg,
        { id: assistantId, role: "assistant", content: "" },
      ],
    }));

    setIsStreaming(true);
    let fullContent = "";

    await streamChat({
      messages: history,
      onDelta: (chunk) => {
        fullContent += chunk;
        const current = fullContent;
        setMessagesByConv((prev) => ({
          ...prev,
          [convId!]: prev[convId!].map((m) =>
            m.id === assistantId ? { ...m, content: current } : m
          ),
        }));
      },
      onDone: () => {
        setIsStreaming(false);
      },
      onError: (error) => {
        setIsStreaming(false);
        toast({ title: "Error", description: error, variant: "destructive" });
      },
    });
  };

  const handleNewChat = () => {
    setActiveConvId(null);
  };

  const handleDeleteConv = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setMessagesByConv((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (activeConvId === id) setActiveConvId(null);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelect={setActiveConvId}
        onNew={handleNewChat}
        onDelete={handleDeleteConv}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((p) => !p)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        

        {activeMessages.length === 0 ? (
          <>
            <WelcomeScreen onSuggestionClick={handleSend} />
            <div className="pb-6">
              <ChatInput onSend={handleSend} disabled={isStreaming} />
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {activeMessages.map((msg, i) => (
                  <ChatMessage
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    isStreaming={isStreaming && i === activeMessages.length - 1 && msg.role === "assistant"}
                    onRelatedClick={handleSend}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="pb-6 pt-2">
              <ChatInput onSend={handleSend} disabled={isStreaming} />
            </div>
          </>
        )}
      </main>
    </div>
    </>
  );
};

export default Index;

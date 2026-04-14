import { useState, useRef, useEffect, useCallback } from "react";
import ChatSidebar, { Conversation } from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const MOCK_RESPONSES = [
  "That's a great question! Let me think about this...\n\nHere's what I can tell you:\n\n**Key Points:**\n1. This is a demo response showcasing markdown rendering\n2. The actual AI integration can be added with Lovable Cloud\n3. The interface supports full markdown including `code blocks`\n\n```python\ndef hello():\n    print('Hello from NexusAI!')\n```\n\nWould you like me to elaborate on any of these points?",
  "I'd be happy to help with that! 🚀\n\nHere's my analysis:\n\n- **First**, let's consider the context\n- **Second**, we should evaluate the options\n- **Third**, I'll provide a recommendation\n\n> The best approach often depends on your specific use case.\n\nLet me know if you'd like to dive deeper into any aspect!",
  "Absolutely! Here's a comprehensive breakdown:\n\n### Overview\nThis is a fascinating topic with many dimensions.\n\n### Details\n| Aspect | Description |\n|--------|------------|\n| Speed | Very fast |\n| Quality | High |\n| Cost | Efficient |\n\n### Conclusion\nI recommend starting with the basics and building up from there. Feel free to ask follow-up questions!",
];

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const simulateStream = (convId: string, fullText: string) => {
    setIsStreaming(true);
    const assistantId = crypto.randomUUID();
    setMessagesByConv((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), { id: assistantId, role: "assistant", content: "" }],
    }));

    let i = 0;
    const interval = setInterval(() => {
      const chunkSize = Math.floor(Math.random() * 4) + 1;
      const chunk = fullText.slice(i, i + chunkSize);
      i += chunkSize;

      setMessagesByConv((prev) => ({
        ...prev,
        [convId]: prev[convId].map((m) =>
          m.id === assistantId ? { ...m, content: fullText.slice(0, i) } : m
        ),
      }));

      if (i >= fullText.length) {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 20);
  };

  const handleSend = (text: string) => {
    let convId = activeConvId;
    if (!convId) {
      convId = createConversation(text);
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessagesByConv((prev) => ({
      ...prev,
      [convId!]: [...(prev[convId!] || []), userMsg],
    }));

    const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    setTimeout(() => simulateStream(convId!, response), 600);
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
  );
};

export default Index;

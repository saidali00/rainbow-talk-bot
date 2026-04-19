import { useState, useRef, useEffect, useCallback } from "react";
import ChatSidebar, { Conversation } from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import SplashScreen from "@/components/SplashScreen";
import { ModelKey, DEFAULT_MODEL } from "@/components/ModelPicker";

import { streamChat, ChatMessage as AIChatMessage } from "@/lib/openrouter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  generatedImage?: string;
  generatingImage?: boolean;
  imagePrompt?: string;
  videoFrames?: string[];
  generatingVideo?: boolean;
  videoPrompt?: string;
  chatMode?: ModelKey;
}

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [model, setModel] = useState<ModelKey>(DEFAULT_MODEL);
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

  const handleSend = async (text: string, image?: string) => {
    let convId = activeConvId;
    if (!convId) {
      convId = createConversation(text);
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text, image };
    const assistantId = crypto.randomUUID();

    // Build history for API before updating state
    const history: AIChatMessage[] = [
      ...(messagesByConv[convId!] || []).map((m) => {
        if (m.role === "user" && m.image) {
          return {
            role: "user" as const,
            content: [
              { type: "text" as const, text: m.content },
              { type: "image_url" as const, image_url: { url: m.image } },
            ],
          };
        }
        return { role: m.role as "user" | "assistant", content: m.content };
      }),
      image
        ? {
            role: "user" as const,
            content: [
              { type: "text" as const, text },
              { type: "image_url" as const, image_url: { url: image } },
            ],
          }
        : { role: "user" as const, content: text },
    ];

    // Add user message + empty assistant message in one update
    setMessagesByConv((prev) => ({
      ...prev,
      [convId!]: [
        ...(prev[convId!] || []),
        userMsg,
        { id: assistantId, role: "assistant", content: "", chatMode: model },
      ],
    }));

    setIsStreaming(true);
    let fullContent = "";

    const chatMode: "wadix" | "ruh" | "ilmai" =
      model === "ilmai" ? "ilmai" : model === "ruh" ? "ruh" : "wadix";

    await streamChat({
      messages: history,
      mode: chatMode,
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

  const handleGenerateImage = async (prompt: string, images?: string[]) => {
    let convId = activeConvId;
    if (!convId) convId = createConversation(`🎨 ${prompt}`);

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: `🎨 Create: ${prompt}` };
    const assistantId = crypto.randomUUID();

    setMessagesByConv((prev) => ({
      ...prev,
      [convId!]: [
        ...(prev[convId!] || []),
        userMsg,
        { id: assistantId, role: "assistant", content: "", generatingImage: true, imagePrompt: prompt },
      ],
    }));

    setIsStreaming(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt, images: images || [] },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error("No image returned");

      setMessagesByConv((prev) => ({
        ...prev,
        [convId!]: prev[convId!].map((m) =>
          m.id === assistantId
            ? {
                ...m,
                generatingImage: false,
                generatedImage: data.imageUrl,
                content: data.text || `Here's your image: "${prompt}"`,
              }
            : m
        ),
      }));
      toast({ title: "✨ Image created!", description: "Your masterpiece is ready." });
    } catch (e: any) {
      setMessagesByConv((prev) => ({
        ...prev,
        [convId!]: prev[convId!].map((m) =>
          m.id === assistantId
            ? { ...m, generatingImage: false, content: `Sorry, I couldn't create that image. ${e?.message || ""}` }
            : m
        ),
      }));
      toast({ title: "Image generation failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsStreaming(false);
      // Auto-revert to default fast model
      setModel(DEFAULT_MODEL);
    }
  };

  const handleGenerateVideo = async (prompt: string) => {
    let convId = activeConvId;
    if (!convId) convId = createConversation(`🎬 ${prompt}`);

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: `🎬 Video: ${prompt}` };
    const assistantId = crypto.randomUUID();

    setMessagesByConv((prev) => ({
      ...prev,
      [convId!]: [
        ...(prev[convId!] || []),
        userMsg,
        { id: assistantId, role: "assistant", content: "", generatingVideo: true, videoPrompt: prompt },
      ],
    }));

    setIsStreaming(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-video", { body: { prompt } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.frames?.length) throw new Error("No video frames returned");

      setMessagesByConv((prev) => ({
        ...prev,
        [convId!]: prev[convId!].map((m) =>
          m.id === assistantId
            ? { ...m, generatingVideo: false, videoFrames: data.frames, content: `Here's your 10s video: "${prompt}"` }
            : m
        ),
      }));
      toast({ title: "🎬 Video ready!", description: "ManzarX rendered your scene." });
    } catch (e: any) {
      setMessagesByConv((prev) => ({
        ...prev,
        [convId!]: prev[convId!].map((m) =>
          m.id === assistantId
            ? { ...m, generatingVideo: false, content: `Sorry, video generation failed. ${e?.message || ""}` }
            : m
        ),
      }));
      toast({ title: "Video generation failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsStreaming(false);
      setModel(DEFAULT_MODEL);
    }
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
              <ChatInput onSend={handleSend} onGenerateImage={handleGenerateImage} onGenerateVideo={handleGenerateVideo} disabled={isStreaming} model={model} onModelChange={setModel} />
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
                    image={msg.image}
                    generatedImage={msg.generatedImage}
                    generatingImage={msg.generatingImage}
                    imagePrompt={msg.imagePrompt}
                    videoFrames={msg.videoFrames}
                    generatingVideo={msg.generatingVideo}
                    videoPrompt={msg.videoPrompt}
                    chatMode={msg.chatMode}
                    isStreaming={isStreaming && i === activeMessages.length - 1 && msg.role === "assistant" && !msg.generatingImage && !msg.generatedImage && !msg.generatingVideo && !msg.videoFrames}
                    onRelatedClick={handleSend}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="pb-6 pt-2">
              <ChatInput onSend={handleSend} onGenerateImage={handleGenerateImage} onGenerateVideo={handleGenerateVideo} disabled={isStreaming} model={model} onModelChange={setModel} />
            </div>
          </>
        )}
      </main>
    </div>
    </>
  );
};

export default Index;

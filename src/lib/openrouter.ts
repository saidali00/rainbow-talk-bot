// Streams chat from our edge function which proxies Lovable AI Gateway
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type ChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string | ChatContentPart[];
};

export async function streamChat({
  messages,
  mode,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMessage[];
  mode?: "wadix" | "ruh" | "ilmai";
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, mode: mode || "wadix" }),
    });

    if (!response.ok) {
      let errMsg = `Error ${response.status}`;
      try {
        const data = await response.json();
        if (data?.error) errMsg = data.error;
      } catch {}
      if (response.status === 429) errMsg = "Rate limit reached. Try again shortly.";
      if (response.status === 402) errMsg = "AI credits exhausted. Please add credits in Settings.";
      onError(errMsg);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError("No response stream");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : "Unknown error");
  }
}

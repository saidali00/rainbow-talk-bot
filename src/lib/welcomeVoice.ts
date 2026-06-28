import { supabase } from "@/integrations/supabase/client";

const WELCOME_TEXT =
  "Welcome to WadiAi. Your next generation AI companion. Built different, smarter, and faster. Let's create something extraordinary together.";

let cachedUrl: string | null = null;
let played = false;

async function fetchWelcomeAudio(): Promise<string | null> {
  if (cachedUrl) return cachedUrl;
  try {
    const { data, error } = await supabase.functions.invoke("tts", {
      body: {
        text: WELCOME_TEXT,
        voice: "onyx",
        instructions:
          "Speak in a deep, warm, cinematic male voice. Calm, confident, and welcoming with a slow, inspiring pace.",
      },
    });
    if (error) throw error;
    if (!data?.audioContent) return null;
    cachedUrl = `data:audio/mpeg;base64,${data.audioContent}`;
    return cachedUrl;
  } catch {
    return null;
  }
}

/**
 * Plays the welcome greeting whenever WadiAi opens. Attempts autoplay first;
 * if the browser blocks it, falls back to playing on the user's first
 * interaction (click / touch / keypress).
 */
export async function playWelcomeVoice() {
  if (played) return;
  const url = await fetchWelcomeAudio();
  if (!url) return;

  const audio = new Audio(url);
  audio.volume = 1;

  const tryPlay = async () => {
    if (played) return true;
    try {
      await audio.play();
      played = true;
      return true;
    } catch {
      return false;
    }
  };

  const ok = await tryPlay();
  if (ok) return;

  const onInteract = async () => {
    const done = await tryPlay();
    if (done) {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
    }
  };
  window.addEventListener("pointerdown", onInteract);
  window.addEventListener("keydown", onInteract);
  window.addEventListener("touchstart", onInteract);
}
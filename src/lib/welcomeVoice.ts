import { supabase } from "@/integrations/supabase/client";

const WELCOME_TEXT =
  "Welcome to WadiAi. Your next generation AI companion. Built different, smarter, and faster. Let's create something extraordinary together.";

// Female Urdu promo that invites users to try Koshur (Kashmiri) mode.
const KOSHUR_PROMO_TEXT =
  "السلام علیکم! کیا آپ نے وادی اے آئی کا کشمیری موڈ آزمایا؟ آپ کسی بھی زبان میں سوال پوچھیں، اور جواب خوبصورت کشمیری زبان میں ملے گا۔ ابھی کشمیری موڈ استعمال کریں اور فرق محسوس کریں!";

let cachedUrl: string | null = null;
let played = false;
let cachedPromoUrl: string | null = null;
let promoPlayed = false;

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

async function fetchPromoAudio(): Promise<string | null> {
  if (cachedPromoUrl) return cachedPromoUrl;
  try {
    const { data, error } = await supabase.functions.invoke("tts", {
      body: {
        text: KOSHUR_PROMO_TEXT,
        voice: "shimmer",
        instructions:
          "Speak in a warm, graceful, feminine Urdu voice. Friendly and inviting, with a gentle, elegant pace and natural Urdu pronunciation.",
      },
    });
    if (error) throw error;
    if (!data?.audioContent) return null;
    cachedPromoUrl = `data:audio/mpeg;base64,${data.audioContent}`;
    return cachedPromoUrl;
  } catch {
    return null;
  }
}

async function playKoshurPromo() {
  if (promoPlayed) return;
  const url = await fetchPromoAudio();
  if (!url) return;
  const audio = new Audio(url);
  audio.volume = 1;
  try {
    await audio.play();
    promoPlayed = true;
  } catch {
    // Autoplay blocked — play on next user interaction.
    const onInteract = async () => {
      if (promoPlayed) return;
      try {
        await audio.play();
        promoPlayed = true;
        window.removeEventListener("pointerdown", onInteract);
        window.removeEventListener("keydown", onInteract);
        window.removeEventListener("touchstart", onInteract);
      } catch {}
    };
    window.addEventListener("pointerdown", onInteract);
    window.addEventListener("keydown", onInteract);
    window.addEventListener("touchstart", onInteract);
  }
}

// After the welcome voice finishes, wait 5 seconds, then play the Urdu promo.
function scheduleKoshurPromo(afterMs: number) {
  setTimeout(() => {
    playKoshurPromo();
  }, afterMs);
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

  // When the welcome greeting ends, wait 5s then play the Urdu Koshur promo.
  audio.addEventListener("ended", () => scheduleKoshurPromo(5000), { once: true });

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
export type ThemeId =
  | "default"
  | "mixed"
  | "designed"
  | "animated"
  | "horror"
  | "nature"
  | "ghosted"
  | "ocean";

export interface ThemeDef {
  id: ThemeId;
  label: string;
  emoji: string;
  description: string;
  // applied as inline style on <html>
  vars: Record<string, string>;
  // dark mode toggle
  dark: boolean;
  // body background overlay
  bodyBg?: string;
  // sound recipe
  sound: {
    type: OscillatorType;
    notes: number[]; // freqs
    duration: number; // per note seconds
    gain?: number;
    detune?: number;
  };
}

export const THEMES: ThemeDef[] = [
  {
    id: "default",
    label: "Default",
    emoji: "✨",
    description: "Original Wadi",
    dark: false,
    vars: {},
    sound: { type: "sine", notes: [523.25, 659.25, 783.99], duration: 0.12, gain: 0.08 },
  },
  {
    id: "mixed",
    label: "Aurora Mix",
    emoji: "🌈",
    description: "Vibrant gradient blend",
    dark: true,
    vars: {
      "--background": "260 40% 8%",
      "--foreground": "300 30% 95%",
      "--card": "270 35% 12%",
      "--primary": "320 90% 65%",
      "--secondary": "180 80% 55%",
      "--accent": "45 100% 60%",
      "--gradient-start": "320 90% 65%",
      "--gradient-mid": "180 80% 55%",
      "--gradient-end": "45 100% 60%",
      "--muted": "270 25% 18%",
      "--border": "270 25% 22%",
    },
    bodyBg: "radial-gradient(ellipse at top left, hsl(320 90% 25% / 0.4), transparent 60%), radial-gradient(ellipse at bottom right, hsl(180 80% 25% / 0.4), transparent 60%), hsl(260 40% 8%)",
    sound: { type: "triangle", notes: [392, 523.25, 659.25, 880], duration: 0.1, gain: 0.07 },
  },
  {
    id: "designed",
    label: "Studio Mono",
    emoji: "🎨",
    description: "Minimal designer monochrome",
    dark: false,
    vars: {
      "--background": "30 20% 96%",
      "--foreground": "220 15% 12%",
      "--card": "0 0% 100%",
      "--primary": "20 90% 55%",
      "--secondary": "220 15% 25%",
      "--accent": "350 80% 55%",
      "--gradient-start": "20 90% 55%",
      "--gradient-mid": "350 80% 55%",
      "--gradient-end": "220 15% 25%",
      "--border": "30 15% 86%",
      "--muted": "30 15% 90%",
    },
    sound: { type: "sine", notes: [440, 554.37, 659.25], duration: 0.14, gain: 0.06 },
  },
  {
    id: "animated",
    label: "Neon Pulse",
    emoji: "⚡",
    description: "Electric animated neon",
    dark: true,
    vars: {
      "--background": "240 50% 6%",
      "--foreground": "180 100% 90%",
      "--card": "240 45% 10%",
      "--primary": "180 100% 50%",
      "--secondary": "300 100% 60%",
      "--accent": "60 100% 55%",
      "--gradient-start": "180 100% 50%",
      "--gradient-mid": "300 100% 60%",
      "--gradient-end": "60 100% 55%",
      "--border": "240 40% 18%",
      "--muted": "240 40% 14%",
    },
    bodyBg: "linear-gradient(135deg, hsl(240 50% 6%), hsl(260 50% 8%))",
    sound: { type: "square", notes: [261.63, 523.25, 1046.5], duration: 0.08, gain: 0.04 },
  },
  {
    id: "horror",
    label: "Horror",
    emoji: "🩸",
    description: "Blood night terror",
    dark: true,
    vars: {
      "--background": "0 30% 4%",
      "--foreground": "0 30% 88%",
      "--card": "0 35% 8%",
      "--primary": "0 85% 45%",
      "--secondary": "0 0% 15%",
      "--accent": "15 90% 50%",
      "--gradient-start": "0 85% 45%",
      "--gradient-mid": "0 60% 25%",
      "--gradient-end": "15 90% 50%",
      "--border": "0 30% 15%",
      "--muted": "0 20% 12%",
    },
    bodyBg: "radial-gradient(ellipse at center, hsl(0 60% 8%), hsl(0 30% 3%))",
    sound: { type: "sawtooth", notes: [110, 98, 87, 82], duration: 0.25, gain: 0.05, detune: -20 },
  },
  {
    id: "nature",
    label: "Forest",
    emoji: "🌿",
    description: "Calm green woodland",
    dark: false,
    vars: {
      "--background": "90 30% 95%",
      "--foreground": "120 30% 12%",
      "--card": "90 25% 99%",
      "--primary": "140 60% 35%",
      "--secondary": "30 50% 45%",
      "--accent": "50 80% 50%",
      "--gradient-start": "140 60% 35%",
      "--gradient-mid": "90 50% 45%",
      "--gradient-end": "50 80% 50%",
      "--border": "100 20% 85%",
      "--muted": "100 20% 90%",
    },
    bodyBg: "linear-gradient(180deg, hsl(90 30% 95%), hsl(140 30% 92%))",
    sound: { type: "sine", notes: [659.25, 783.99, 987.77, 1318.51], duration: 0.13, gain: 0.06 },
  },
  {
    id: "ghosted",
    label: "Ghosted",
    emoji: "👻",
    description: "Pale haunted glass",
    dark: true,
    vars: {
      "--background": "220 15% 14%",
      "--foreground": "200 30% 92%",
      "--card": "220 15% 18%",
      "--primary": "200 50% 70%",
      "--secondary": "240 20% 50%",
      "--accent": "180 40% 65%",
      "--gradient-start": "200 50% 70%",
      "--gradient-mid": "240 30% 60%",
      "--gradient-end": "180 40% 65%",
      "--border": "220 15% 25%",
      "--muted": "220 15% 22%",
    },
    bodyBg: "radial-gradient(ellipse at top, hsl(220 25% 22% / 0.8), hsl(220 15% 12%))",
    sound: { type: "sine", notes: [220, 277.18, 329.63, 220], duration: 0.3, gain: 0.04, detune: 15 },
  },
  {
    id: "ocean",
    label: "Ocean Deep",
    emoji: "🌊",
    description: "Deep sea blues",
    dark: true,
    vars: {
      "--background": "210 60% 8%",
      "--foreground": "190 40% 92%",
      "--card": "210 55% 12%",
      "--primary": "190 90% 50%",
      "--secondary": "220 70% 55%",
      "--accent": "160 80% 50%",
      "--gradient-start": "190 90% 50%",
      "--gradient-mid": "220 70% 55%",
      "--gradient-end": "160 80% 50%",
      "--border": "210 40% 20%",
      "--muted": "210 40% 16%",
    },
    bodyBg: "linear-gradient(180deg, hsl(210 60% 10%), hsl(220 65% 6%))",
    sound: { type: "sine", notes: [196, 261.63, 329.63, 392], duration: 0.18, gain: 0.06 },
  },
];

let audioCtx: AudioContext | null = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

export function playThemeSound(theme: ThemeDef) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  const { type, notes, duration, gain = 0.06, detune = 0 } = theme.sound;
  const now = ctx.currentTime;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const start = now + i * duration;
    const end = start + duration;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(g).connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.05);
  });
}

const STORAGE_KEY = "wadi-theme";

export function applyTheme(id: ThemeId) {
  const theme = THEMES.find((t) => t.id === id) || THEMES[0];
  const root = document.documentElement;
  // Reset previous custom vars by removing inline style first
  root.removeAttribute("style");
  // Apply vars
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.classList.toggle("dark", theme.dark);
  document.body.style.background = theme.bodyBg || "";
  root.dataset.theme = theme.id;
  try { localStorage.setItem(STORAGE_KEY, id); } catch {}
}

export function getStoredTheme(): ThemeId {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (v && THEMES.some((t) => t.id === v)) return v;
  } catch {}
  return "default";
}

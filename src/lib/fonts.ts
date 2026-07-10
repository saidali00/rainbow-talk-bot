export interface FontDef {
  id: string;
  label: string;
  sample: string;
  family: string; // CSS font-family stack
  urdu?: boolean;
}

export const FONTS: FontDef[] = [
  { id: "default", label: "Default", sample: "The quick brown fox", family: "" },
  { id: "nastaliq", label: "Urdu Nastaliq", sample: "اردو خوبصورت زبان ہے", family: "'Noto Nastaliq Urdu', serif", urdu: true },
  { id: "gulzar", label: "Gulzar (Urdu)", sample: "دل کی بات لبوں پر", family: "'Gulzar', serif", urdu: true },
  { id: "amiri", label: "Amiri", sample: "بسم اللہ · Elegant", family: "'Amiri', serif", urdu: true },
  { id: "arefruqaa", label: "Aref Ruqaa", sample: "خطاطی · Calligraphy", family: "'Aref Ruqaa', serif", urdu: true },
  { id: "lateef", label: "Lateef", sample: "سادہ اور صاف", family: "'Lateef', serif", urdu: true },
  { id: "playfair", label: "Playfair Classy", sample: "Elegant & Classy", family: "'Playfair Display', serif" },
  { id: "cormorant", label: "Cormorant", sample: "Refined Serif", family: "'Cormorant Garamond', serif" },
  { id: "cinzel", label: "Cinzel Royal", sample: "ROYAL STYLE", family: "'Cinzel', serif" },
  { id: "dancing", label: "Dancing Script", sample: "Beautiful Script", family: "'Dancing Script', cursive" },
  { id: "greatvibes", label: "Great Vibes", sample: "Graceful Vibes", family: "'Great Vibes', cursive" },
  { id: "pacifico", label: "Pacifico", sample: "Playful & Fun", family: "'Pacifico', cursive" },
  { id: "lobster", label: "Lobster", sample: "Bold Retro", family: "'Lobster', cursive" },
  { id: "poppins", label: "Poppins Modern", sample: "Clean Modern", family: "'Poppins', sans-serif" },
  { id: "merriweather", label: "Merriweather", sample: "Readable Serif", family: "'Merriweather', serif" },
];

const STORAGE_KEY = "wadi-answer-font";

export function applyFont(id: string) {
  const font = FONTS.find((f) => f.id === id) || FONTS[0];
  // Set on body so theme changes (which reset <html> inline styles) don't clear it.
  document.body.style.setProperty("--answer-font", font.family || "inherit");
  document.body.dataset.answerFont = font.id;
  document.body.dataset.answerUrdu = font.urdu ? "true" : "false";
  try { localStorage.setItem(STORAGE_KEY, id); } catch {}
}

export function getStoredFont(): string {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && FONTS.some((f) => f.id === v)) return v;
  } catch {}
  return "default";
}
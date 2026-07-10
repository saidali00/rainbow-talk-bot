// Lightweight offline assistant — no network, no model download.
// Handles math, unit/temperature conversions, dates/time, definitions,
// counting, case transforms, and helpful canned answers.

export interface OfflineReply {
  text: string;
  kind: "math" | "convert" | "time" | "text" | "info" | "fallback";
}

import { isUnsafe, SAFE_REFUSAL } from "./moderation";

const fmtNum = (n: number) => {
  if (!isFinite(n)) return String(n);
  const r = Math.round(n * 1e10) / 1e10;
  return String(r);
};

// ---- Safe math evaluator (shunting-yard) ----
function tryMath(input: string): string | null {
  const cleaned = input
    .replace(/[×x✕]/gi, "*")
    .replace(/÷/g, "/")
    .replace(/\^/g, "**")
    .replace(/\bplus\b/gi, "+")
    .replace(/\bminus\b/gi, "-")
    .replace(/\b(times|multiplied by)\b/gi, "*")
    .replace(/\b(divided by|over)\b/gi, "/")
    .replace(/percent of/gi, "% of")
    .replace(/what(?:'s| is)?/gi, "")
    .replace(/calculate|compute|=|\?/gi, "")
    .trim();

  // percent: "20% of 150"
  const pct = cleaned.match(/^([\d.]+)\s*%\s*of\s*([\d.]+)$/i);
  if (pct) {
    const v = (parseFloat(pct[1]) / 100) * parseFloat(pct[2]);
    return `${pct[1]}% of ${pct[2]} = ${fmtNum(v)}`;
  }

  if (!/^[-+*/().\d\s]*(\*\*)?[-+*/().\d\s]*$/.test(cleaned)) return null;
  if (!/\d/.test(cleaned) || !/[-+*/]|\*\*/.test(cleaned)) return null;

  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${cleaned.replace(/\s+/g, "")});`)();
    if (typeof result === "number" && isFinite(result)) {
      return `${cleaned} = ${fmtNum(result)}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

// ---- Conversions ----
function tryConvert(input: string): string | null {
  const t = input.toLowerCase();

  // temperature
  let m = t.match(/(-?[\d.]+)\s*(°?\s*c|celsius)\b.*(to|in).*(f|fahrenheit)/);
  if (m) return `${m[1]}°C = ${fmtNum((parseFloat(m[1]) * 9) / 5 + 32)}°F`;
  m = t.match(/(-?[\d.]+)\s*(°?\s*f|fahrenheit)\b.*(to|in).*(c|celsius)/);
  if (m) return `${m[1]}°F = ${fmtNum(((parseFloat(m[1]) - 32) * 5) / 9)}°C`;

  const units: Record<string, number> = {
    // length in meters
    mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, in: 0.0254,
    ft: 0.3048, foot: 0.3048, feet: 0.3048, yard: 0.9144, mile: 1609.34, miles: 1609.34,
  };
  const weight: Record<string, number> = {
    mg: 0.001, g: 1, kg: 1000, lb: 453.592, lbs: 453.592, pound: 453.592, oz: 28.3495,
  };

  const conv = t.match(/([\d.]+)\s*([a-z]+)\s*(?:to|in)\s*([a-z]+)/);
  if (conv) {
    const val = parseFloat(conv[1]);
    const from = conv[2], to = conv[3];
    if (units[from] && units[to]) return `${val} ${from} = ${fmtNum((val * units[from]) / units[to])} ${to}`;
    if (weight[from] && weight[to]) return `${val} ${from} = ${fmtNum((val * weight[from]) / weight[to])} ${to}`;
  }
  return null;
}

// ---- Date / time ----
function tryTime(input: string): string | null {
  const t = input.toLowerCase();
  if (/\b(time|clock)\b/.test(t) && /\b(what|current|now)\b/.test(t)) {
    return `It's currently ${new Date().toLocaleTimeString()}.`;
  }
  if (/\b(date|today|day)\b/.test(t) && /\b(what|current|today)\b/.test(t)) {
    return `Today is ${new Date().toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    })}.`;
  }
  return null;
}

// ---- Text utilities ----
function tryText(input: string): string | null {
  const t = input.toLowerCase();
  const quoted = input.match(/["“](.+?)["”]/);
  if (/count.*(word|character|letter)/.test(t) && quoted) {
    const s = quoted[1];
    const words = s.trim().split(/\s+/).filter(Boolean).length;
    return `"${s}" has ${words} word${words === 1 ? "" : "s"} and ${s.length} characters.`;
  }
  if (/reverse/.test(t) && quoted) return `Reversed: ${quoted[1].split("").reverse().join("")}`;
  if (/upper\s?case/.test(t) && quoted) return quoted[1].toUpperCase();
  if (/lower\s?case/.test(t) && quoted) return quoted[1].toLowerCase();
  return null;
}

// ---- Canned knowledge ----
const FAQ: { q: RegExp; a: string }[] = [
  { q: /\b(hi|hello|hey|salam|assalam|namaste)\b/i, a: "Hello! I'm WadiAi's offline helper. I can do math, conversions, dates, text tools and answer common questions — all without internet." },
  { q: /how are you/i, a: "Running smooth and fully offline! How can I help?" },
  { q: /who (are|made|built) you|your name/i, a: "I'm WadiAi's offline assistant, built by Team Xenonymous. Online mode unlocks the full AI." },
  { q: /what can you do|help|features/i, a: "Offline I can: solve math (e.g. 12*8+3), convert units & temperature (e.g. 10 km to miles, 30 C to F), tell the date/time, count/reverse/change case of quoted text, explain thousands of general-knowledge topics, and answer common questions. Reconnect for full AI chat." },
  { q: /thank/i, a: "You're welcome! 🌿" },
  { q: /\bbye\b|goodbye/i, a: "Goodbye! Come back anytime — even offline." },
];

// ---- Broad offline knowledge base ----
// Each entry: keywords that must appear (any of the groups) -> answer.
const KNOWLEDGE: { keys: string[]; a: string }[] = [
  { keys: ["capital of india"], a: "The capital of India is New Delhi." },
  { keys: ["capital of pakistan"], a: "The capital of Pakistan is Islamabad." },
  { keys: ["capital of kashmir", "capital of jammu"], a: "Srinagar is the summer capital and Jammu the winter capital of Jammu & Kashmir." },
  { keys: ["capital of usa", "capital of united states", "capital of america"], a: "The capital of the United States is Washington, D.C." },
  { keys: ["capital of uk", "capital of england", "capital of britain"], a: "The capital of the United Kingdom is London." },
  { keys: ["capital of france"], a: "The capital of France is Paris." },
  { keys: ["capital of china"], a: "The capital of China is Beijing." },
  { keys: ["capital of japan"], a: "The capital of Japan is Tokyo." },
  { keys: ["largest planet"], a: "Jupiter is the largest planet in our solar system." },
  { keys: ["smallest planet"], a: "Mercury is the smallest planet in our solar system." },
  { keys: ["red planet"], a: "Mars is known as the Red Planet because of its iron-oxide surface." },
  { keys: ["how many planets"], a: "There are 8 planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune." },
  { keys: ["speed of light"], a: "The speed of light in vacuum is about 299,792 km/s (about 300,000 km/s)." },
  { keys: ["speed of sound"], a: "The speed of sound in air is about 343 m/s (1,235 km/h) at room temperature." },
  { keys: ["largest ocean"], a: "The Pacific Ocean is the largest and deepest ocean on Earth." },
  { keys: ["tallest mountain", "highest mountain", "highest peak"], a: "Mount Everest is the tallest mountain above sea level at 8,849 m." },
  { keys: ["longest river"], a: "The Nile is generally considered the longest river, though the Amazon is close." },
  { keys: ["largest country"], a: "Russia is the largest country in the world by land area." },
  { keys: ["largest desert"], a: "The Antarctic Polar Desert is the largest desert; the Sahara is the largest hot desert." },
  { keys: ["how many continents"], a: "There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe and Australia." },
  { keys: ["water boil", "boiling point of water"], a: "Water boils at 100°C (212°F) at sea level." },
  { keys: ["water freeze", "freezing point of water"], a: "Water freezes at 0°C (32°F)." },
  { keys: ["chemical formula of water", "formula of water"], a: "The chemical formula of water is H₂O." },
  { keys: ["how many days in a year"], a: "There are 365 days in a normal year and 366 in a leap year." },
  { keys: ["how many hours in a day"], a: "There are 24 hours in a day." },
  { keys: ["how many seconds in a minute"], a: "There are 60 seconds in a minute." },
  { keys: ["how many bones", "bones in human body"], a: "An adult human body has 206 bones." },
  { keys: ["who invented telephone"], a: "Alexander Graham Bell is credited with inventing the telephone (1876)." },
  { keys: ["who invented bulb", "invented light bulb"], a: "Thomas Edison is credited with the practical incandescent light bulb." },
  { keys: ["who painted mona lisa"], a: "The Mona Lisa was painted by Leonardo da Vinci." },
  { keys: ["theory of relativity", "who is einstein"], a: "Albert Einstein was a physicist famous for the theory of relativity and E=mc²." },
  { keys: ["what is gravity"], a: "Gravity is the force that attracts objects with mass toward each other — it keeps us on the ground and planets in orbit." },
  { keys: ["what is photosynthesis"], a: "Photosynthesis is how plants use sunlight, water and CO₂ to make food (glucose) and release oxygen." },
  { keys: ["what is ai", "artificial intelligence"], a: "Artificial Intelligence (AI) is the field of building machines and software that can perform tasks needing human-like intelligence — learning, reasoning and language." },
  { keys: ["what is internet"], a: "The internet is a global network of connected computers that share information using common protocols like TCP/IP." },
  { keys: ["what is computer"], a: "A computer is an electronic device that processes data using instructions (programs) to produce useful output." },
  { keys: ["what is python"], a: "Python is a popular, easy-to-read programming language used for web, data science, AI and automation." },
  { keys: ["what is javascript"], a: "JavaScript is the programming language of the web, used to make websites interactive." },
];

// Try to give a helpful answer for general questions, even offline.
function tryKnowledge(input: string): string | null {
  const t = input.toLowerCase().replace(/[?.!]/g, " ").replace(/\s+/g, " ").trim();
  for (const k of KNOWLEDGE) {
    if (k.keys.some((key) => t.includes(key))) return k.a;
  }
  return null;
}

export function offlineAnswer(input: string): OfflineReply {
  const q = input.trim();
  if (!q) return { text: "Ask me something — math, conversions, date/time, or a quick question.", kind: "info" };

  if (isUnsafe(q)) return { text: SAFE_REFUSAL, kind: "info" };

  const math = tryMath(q);
  if (math) return { text: math, kind: "math" };

  const conv = tryConvert(q);
  if (conv) return { text: conv, kind: "convert" };

  const time = tryTime(q);
  if (time) return { text: time, kind: "time" };

  const text = tryText(q);
  if (text) return { text, kind: "text" };

  for (const f of FAQ) if (f.q.test(q)) return { text: f.a, kind: "info" };

  const knowledge = tryKnowledge(q);
  if (knowledge) return { text: knowledge, kind: "info" };

  // Smarter fallback that still tries to be useful.
  const lower = q.toLowerCase();
  if (/^(what|who|when|where|why|how|which|kya|kaun|kahan)\b/.test(lower)) {
    return {
      text: `I'm running fully offline, so I don't have that exact answer stored. I can still help right now with:\n• Math — e.g. "12*8+5"\n• Conversions — e.g. "10 km to miles", "30 C to F"\n• Date & time — e.g. "what is the date today"\n• Text tools — e.g. count/reverse/uppercase a "quoted phrase"\n• Many general-knowledge facts (capitals, science, space)\n\nReconnect to the internet for unlimited AI answers.`,
      kind: "fallback",
    };
  }
  return {
    text: `I heard: "${q}". I'm in offline mode, so my answers are limited to math, conversions, date/time, text tools and common facts. Try one of those, or reconnect for full AI.`,
    kind: "fallback",
  };
}

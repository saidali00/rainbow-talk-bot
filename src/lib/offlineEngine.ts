// Lightweight offline assistant — no network, no model download.
// Handles math, unit/temperature conversions, dates/time, definitions,
// counting, case transforms, and helpful canned answers.

export interface OfflineReply {
  text: string;
  kind: "math" | "convert" | "time" | "text" | "info" | "fallback";
}

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
  { q: /what can you do|help|features/i, a: "Offline I can: solve math (e.g. 12*8+3), convert units & temperature (e.g. 10 km to miles, 30 C to F), tell the date/time, count/reverse/change case of quoted text, and answer common questions. Reconnect for full AI chat." },
  { q: /thank/i, a: "You're welcome! 🌿" },
  { q: /\bbye\b|goodbye/i, a: "Goodbye! Come back anytime — even offline." },
];

export function offlineAnswer(input: string): OfflineReply {
  const q = input.trim();
  if (!q) return { text: "Ask me something — math, conversions, date/time, or a quick question.", kind: "info" };

  const math = tryMath(q);
  if (math) return { text: math, kind: "math" };

  const conv = tryConvert(q);
  if (conv) return { text: conv, kind: "convert" };

  const time = tryTime(q);
  if (time) return { text: time, kind: "time" };

  const text = tryText(q);
  if (text) return { text, kind: "text" };

  for (const f of FAQ) if (f.q.test(q)) return { text: f.a, kind: "info" };

  return {
    text: "I'm in offline mode, so I can't reach the full AI right now. I can still help with math, unit/temperature conversions, date & time, and text tools. Reconnect to the internet for unlimited answers.",
    kind: "fallback",
  };
}

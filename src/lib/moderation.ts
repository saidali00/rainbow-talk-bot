// Lightweight content safety filter for WadiAi.
// Blocks requests about violence, nudity/sexual content, self-harm, drugs,
// weapons and other harmful topics — and returns a warm, on-brand message.

const BLOCKLIST: RegExp[] = [
  // sexual / nudity
  /\b(nude|nudity|naked|nsfw|porn|porno|pornography|xxx|sex|sexual|sexy|erotic|erotica|boobs|breast|nipple|vagina|penis|dick|pussy|orgasm|masturbat|blowjob|fetish|hentai|onlyfans|escort|prostitut|rape|molest)\b/i,
  // violence / gore
  /\b(kill|killing|murder|behead|gore|torture|massacre|slaughter|stab|shoot(ing)?|gun\s*down|assassinat|terroris|bomb\s*making|make\s*a\s*bomb|explosive)\b/i,
  // self-harm
  /\b(suicide|self[-\s]?harm|kill myself|cut myself|end my life)\b/i,
  // weapons / drugs / illegal
  /\b(how to make (a )?(bomb|gun|weapon|explosive)|buy (drugs|cocaine|heroin|meth)|cocaine|heroin|meth(amphetamine)?|make meth|child ?porn|cp)\b/i,
  // hate
  /\b(genocide|ethnic cleansing)\b/i,
];

export function isUnsafe(input: string): boolean {
  const t = (input || "").toLowerCase();
  return BLOCKLIST.some((re) => re.test(t));
}

// Warm, attractive branded refusal shown instead of any harmful answer.
export const SAFE_REFUSAL =
  "🌿 WadiAi is built to spread knowledge, kindness and positivity.\n\n" +
  "I can't help with that kind of request — but I'd love to help you create something beautiful instead. ✨\n\n" +
  "Ask me about learning, science, ideas, coding, creativity, poetry, or anything good — let's build something meaningful together. 💚";

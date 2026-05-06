// WadiSearch — grounded web search with citations via Lovable AI Gateway (Gemini grounding) with DuckDuckGo fallback.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function duckSearch(query: string) {
  // Use DuckDuckGo HTML lite for fast scrapeable SERP (no key needed)
  const r = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; WadiAi/1.0)" },
  });
  const html = await r.text();
  const results: { title: string; url: string; snippet: string }[] = [];
  const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>(.*?)<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && results.length < 8) {
    const url = decodeURIComponent(m[1].replace(/^.*?uddg=/, "").split("&")[0]);
    const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim();
    results.push({ url, title: strip(m[2]), snippet: strip(m[3]) });
  }
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { query } = await req.json();
    if (!query?.trim()) {
      return new Response(JSON.stringify({ error: "Missing query" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sources = await duckSearch(query);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const sourcesBlock = sources
      .map((s, i) => `[${i + 1}] ${s.title}\nURL: ${s.url}\nSnippet: ${s.snippet}`)
      .join("\n\n");

    const systemPrompt = `You are WadiSearch, the live-web answer engine inside WadiAi (built by Aakash Bashir at Xenonymous). Synthesize a clear, well-structured answer to the user's query using ONLY the provided web sources. Cite inline using [1], [2] style markers matching the source numbers. Be concise but complete. Use markdown (headings, lists). End with no extra disclaimer.`;

    const userPrompt = `Query: ${query}\n\nSources:\n${sourcesBlock || "(no sources found — answer from general knowledge and say so)"}`;

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ answer: "AI not configured.", sources }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      console.error("AI gateway error", r.status, t);
      return new Response(JSON.stringify({ error: "Search AI unavailable", sources }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await r.json();
    const answer = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ answer, sources }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("web-search error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
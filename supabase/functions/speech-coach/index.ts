// Speaking Coach — analyzes a transcript and returns structured feedback
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are an expert multilingual speaking coach. The user just spoke in their chosen language. Analyze the transcript and return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "confidence": <0-100 integer>,
  "clarity": <0-100 integer>,
  "fluency": <0-100 integer>,
  "overall": <0-100 integer>,
  "summary": "<one short encouraging sentence in the user's language>",
  "mistakes": [{ "issue": "<short>", "correction": "<short>" }],
  "tips": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"]
}
Score lower for very short, repetitive, or filler-heavy speech. Reply in the same language as the transcript when possible. Keep arrays under 4 items.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcript, language } = await req.json();
    if (!transcript || typeof transcript !== "string") {
      return new Response(JSON.stringify({ error: "transcript required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    const userMsg = `Language: ${language || "auto"}\nTranscript:\n"""${transcript}"""`;
    const messages = [
      { role: "system", content: SYSTEM },
      { role: "user", content: userMsg },
    ];

    let raw = "";

    if (LOVABLE_API_KEY) {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          response_format: { type: "json_object" },
        }),
      });
      if (r.ok) {
        const j = await r.json();
        raw = j?.choices?.[0]?.message?.content || "";
      } else {
        console.warn("Lovable AI failed", r.status, await r.text().catch(() => ""));
      }
    }

    if (!raw && OPENROUTER_API_KEY) {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://wadiai.lovable.app",
          "X-Title": "WadiAi Coach",
        },
        body: JSON.stringify({
          model: "google/gemma-3-27b-it:free",
          messages,
          max_tokens: 800,
        }),
      });
      if (r.ok) {
        const j = await r.json();
        raw = j?.choices?.[0]?.message?.content || "";
      }
    }

    if (!raw) {
      return new Response(JSON.stringify({ error: "AI unavailable, try again shortly." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // strip code fences if any
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { summary: cleaned };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("speech-coach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
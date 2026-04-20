// Streaming chat — tries Lovable AI Gateway first, falls back to OpenRouter on 402/429
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_PROMPT = `You are WadiAi, a helpful AI assistant developed by Aakash Bashir. Whenever anyone asks who your developer is, always respond: 'My developer is Aakash Bashir.' You are built by the company Xenonymous. Be helpful, clear, and concise. Format your responses using markdown when appropriate.

You can confidently help with code in many programming languages, including: JavaScript, TypeScript, Python, C, C++, C#, Java, Kotlin, Swift, Go, Rust, Ruby, PHP, R, MATLAB, Julia, Scala, Dart, Lua, Perl, Haskell, Elixir, Clojure, Objective-C, Bash/Shell, SQL, HTML, CSS, Solidity, Assembly, F#, OCaml, Erlang, Groovy, VB.NET, Fortran, COBOL. Always pick the right language for the task and add brief, well-commented examples.`;

const WADIX_PROMPT = `${BASE_PROMPT}\n\nYou are operating as **WadiX** — the default fast & friendly assistant. Be quick, warm, and conversational. Give clear, direct answers without unnecessary fluff. Add helpful extras (tips, next steps, examples) when useful.`;
const RUH_PROMPT = `${BASE_PROMPT}\n\nYou are operating as **Ruh** — the deep thinking model. Take time to reason carefully, break down complex problems step by step, and give thorough yet well-structured answers.`;
const ILM_PROMPT = `${BASE_PROMPT}\n\nYou are operating as **IlmAI** — a dedicated study companion for learners of all subjects. Always:\n- Explain concepts simply with examples and analogies\n- Use headings, bullet points, and numbered steps\n- Provide practice questions or summaries when useful\n- Encourage understanding over memorization`;

const RELATED_SUFFIX = `\n\nAt the end of every response, add a separator and 2-3 related follow-up questions the user might want to ask. Format them exactly like this:\n\n---\n**Related questions**\n- First related question here\n- Second related question here\n- Third related question here`;

function pickPrompt(mode: string) {
  if (mode === "ilmai") return ILM_PROMPT + RELATED_SUFFIX;
  if (mode === "ruh") return RUH_PROMPT + RELATED_SUFFIX;
  return WADIX_PROMPT + RELATED_SUFFIX;
}

function pickLovableModel(mode: string) {
  if (mode === "ruh") return "google/gemini-2.5-pro";
  if (mode === "ilmai") return "google/gemini-2.5-flash";
  return "google/gemini-2.5-flash-lite"; // wadix — fastest tier
}

function pickOpenRouterModels(mode: string): string[] {
  // Single fast free model only — avoid waiting through a chain of failures
  if (mode === "ruh") return ["meta-llama/llama-3.3-70b-instruct:free"];
  return ["meta-llama/llama-3.2-3b-instruct:free"]; // small + very fast
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();
    const m = mode || "wadix";
    const systemPrompt = pickPrompt(m);
    const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    // 1) Try Lovable AI Gateway
    if (LOVABLE_API_KEY) {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: pickLovableModel(m),
          messages: fullMessages,
          stream: true,
        }),
      });

      if (r.ok) {
        return new Response(r.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      // On 402/429 fall through to OpenRouter; otherwise log and try fallback too
      const errTxt = await r.text().catch(() => "");
      console.warn("Lovable AI failed, falling back to OpenRouter:", r.status, errTxt);
    }

    // 2) Fallback: OpenRouter
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted and no fallback key configured." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orModels = pickOpenRouterModels(m);
    let lastErr: { status: number; text: string } | null = null;

    for (const orModel of orModels) {
      const orResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://wadiai.lovable.app",
          "X-Title": "WadiAi",
        },
        body: JSON.stringify({
          model: orModel,
          messages: fullMessages,
          stream: true,
          max_tokens: 2048,
        }),
      });

      if (orResp.ok) {
        return new Response(orResp.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      const t = await orResp.text().catch(() => "");
      console.warn(`OpenRouter ${orModel} failed:`, orResp.status, t);
      lastErr = { status: orResp.status, text: t };
      // Try next model on 404/429/503; bail on auth errors
      if (orResp.status === 401 || orResp.status === 403) break;
    }

    const status = lastErr?.status === 429 ? 429 : 500;
    const message =
      status === 429
        ? "All providers rate-limited. Please try again in a moment."
        : "AI provider error. Please try again.";
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

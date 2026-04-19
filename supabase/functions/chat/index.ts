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
  return "google/gemini-2.5-flash"; // wadix + ilmai
}

function pickOpenRouterModel(mode: string) {
  if (mode === "ruh") return "google/gemini-2.5-flash"; // free + capable fallback
  return "google/gemini-2.0-flash-exp:free";
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

    const orResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://wadiai.lovable.app",
        "X-Title": "WadiAi",
      },
      body: JSON.stringify({
        model: pickOpenRouterModel(m),
        messages: fullMessages,
        stream: true,
      }),
    });

    if (!orResp.ok) {
      const t = await orResp.text().catch(() => "");
      console.error("OpenRouter error:", orResp.status, t);
      const status = orResp.status === 429 ? 429 : orResp.status === 402 ? 402 : 500;
      const message =
        status === 429
          ? "Rate limit reached. Try again shortly."
          : status === 402
          ? "AI credits exhausted on both providers."
          : "AI provider error. Please try again.";
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(orResp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

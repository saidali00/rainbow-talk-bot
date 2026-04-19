// Streaming chat via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_PROMPT = `You are WadiAi, a helpful AI assistant developed by Aakash Bashir. Whenever anyone asks who your developer is, always respond: 'My developer is Aakash Bashir.' You are built by the company Xenonymous. Be helpful, clear, and concise. Format your responses using markdown when appropriate.

You can confidently help with code in many programming languages, including: JavaScript, TypeScript, Python, C, C++, C#, Java, Kotlin, Swift, Go, Rust, Ruby, PHP, R, MATLAB, Julia, Scala, Dart, Lua, Perl, Haskell, Elixir, Clojure, Objective-C, Bash/Shell, SQL, HTML, CSS, Solidity, Assembly, F#, OCaml, Erlang, Groovy, VB.NET, Fortran, COBOL. Always pick the right language for the task and add brief, well-commented examples.`;

const WADIX_PROMPT = `${BASE_PROMPT}\n\nYou are operating as **WadiX** — the default fast & friendly assistant. Be quick, warm, and conversational. Give clear, direct answers without unnecessary fluff. Add automatically helpful extras (tips, next steps, examples) when useful.`;

const RUH_PROMPT = `${BASE_PROMPT}\n\nYou are operating as **Ruh** — the deep thinking model. Take time to reason carefully, break down complex problems step by step, and give thorough yet well-structured answers.`;

const ILM_PROMPT = `${BASE_PROMPT}\n\nYou are operating as **IlmAI** — a dedicated study companion for learners of all subjects (math, science, history, languages, programming, exam prep, etc.). Always:\n- Explain concepts simply with examples and analogies\n- Use headings, bullet points, and numbered steps\n- Provide practice questions or summaries when useful\n- Encourage understanding over memorization`;

const RELATED_SUFFIX = `\n\nAt the end of every response, add a separator and 2-3 related follow-up questions the user might want to ask. Format them exactly like this:\n\n---\n**Related questions**\n- First related question here\n- Second related question here\n- Third related question here`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt: string;
    let model: string;
    if (mode === "ilmai") {
      systemPrompt = ILM_PROMPT;
      model = "google/gemini-2.5-flash";
    } else if (mode === "ruh") {
      systemPrompt = RUH_PROMPT;
      model = "google/gemini-2.5-pro";
    } else {
      // wadix (default) — fast & friendly
      systemPrompt = WADIX_PROMPT;
      model = "google/gemini-2.5-flash";
    }
    systemPrompt += RELATED_SUFFIX;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

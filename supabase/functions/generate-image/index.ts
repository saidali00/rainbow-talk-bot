// Image generation/editing via Lovable AI (Nano Banana)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, images } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    // Build content: text + optional images (max 10)
    const imgs: string[] = Array.isArray(images) ? images.slice(0, 10) : [];
    const userContent: any[] = [{ type: "text", text: prompt }];
    for (const url of imgs) {
      if (typeof url === "string" && url.length > 0) {
        userContent.push({ type: "image_url", image_url: { url } });
      }
    }

    // 1) Try Lovable AI (Nano Banana)
    let imageUrl: string | undefined;
    let text = "";
    let lovableStatus = 0;

    if (LOVABLE_API_KEY) {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: imgs.length > 0 ? userContent : prompt }],
          modalities: ["image", "text"],
        }),
      });
      lovableStatus = resp.status;

      if (resp.ok) {
        const data = await resp.json();
        imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        text = data.choices?.[0]?.message?.content || "";
      } else {
        const t = await resp.text().catch(() => "");
        console.warn("Lovable image gen failed, will try OpenRouter:", resp.status, t);
      }
    }

    // 2) Fallback: OpenRouter free image model (Gemini 2.5 Flash Image Preview)
    if (!imageUrl && OPENROUTER_API_KEY) {
      const orResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://wadiai.lovable.app",
          "X-Title": "WadiAi",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview:free",
          messages: [{ role: "user", content: imgs.length > 0 ? userContent : prompt }],
          modalities: ["image", "text"],
        }),
      });

      if (orResp.ok) {
        const data = await orResp.json();
        imageUrl =
          data.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
          data.choices?.[0]?.message?.images?.[0]?.url;
        text = text || data.choices?.[0]?.message?.content || "";
      } else {
        const t = await orResp.text().catch(() => "");
        console.error("OpenRouter image gen failed:", orResp.status, t);
      }
    }

    if (!imageUrl) {
      const status = lovableStatus === 429 ? 429 : 500;
      const message =
        status === 429
          ? "Rate limit reached. Try again shortly."
          : "Image generation failed on all providers. Please try again.";
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageUrl, text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

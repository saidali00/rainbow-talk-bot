// ManzarX video generation - generates a sequence of frames and returns as animated result
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, style = "real" } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const styleHints: Record<string, string> = {
      real: "photorealistic real human cinematic 4k film still",
      "3d": "pixar-style 3d animation render, vibrant lighting",
      "2d": "2d animated cartoon style, hand-drawn flat colors",
      animation: "stylized anime animation frame, expressive",
    };
    const styleHint = styleHints[style] || styleHints.real;

    // Generate 4 keyframes for a 10-second video sequence
    const frameCount = 4;
    const frames: string[] = [];

    for (let i = 0; i < frameCount; i++) {
      const framePrompt = `${prompt}. ${styleHint}. Cinematic frame ${i + 1} of ${frameCount}, slight camera movement and subject motion progression, video keyframe, 16:9 aspect ratio.`;
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: framePrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (resp.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await resp.text();
        console.error("Frame gen error:", resp.status, t);
        return new Response(JSON.stringify({ error: "Video generation failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await resp.json();
      const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (url) frames.push(url);
    }

    if (frames.length === 0) {
      return new Response(JSON.stringify({ error: "No frames generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ frames, duration: 10, style }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-video error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

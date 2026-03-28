import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language, difficulty } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const damageMap: Record<string, number> = { easy: 15, medium: 20, hard: 30 };
    const damage = damageMap[difficulty] || 20;

    const systemPrompt = `You are a coding challenge generator for a robot battle game. Generate a unique fill-in-the-blank coding challenge.

Rules:
- Language: ${language}
- Difficulty: ${difficulty}
- The challenge must have EXACTLY ONE blank represented by "___" in the code template
- The answer must be a single word, symbol, or short expression (max 3 words)
- Make challenges diverse: cover different topics like loops, functions, data structures, algorithms, conditionals, string manipulation, classes, error handling, etc.
- For easy: basic syntax, variable declarations, simple operations
- For medium: loops, functions, conditionals, common patterns
- For hard: advanced concepts, algorithms, design patterns, complex expressions
- NEVER repeat the same challenge pattern
- Make it educational and fun

You MUST respond using the generate_challenge tool.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate a unique ${difficulty} ${language} coding challenge. Make it different from common textbook examples. Be creative!`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_challenge",
                description: "Return a coding challenge with a fill-in-the-blank template",
                parameters: {
                  type: "object",
                  properties: {
                    prompt: {
                      type: "string",
                      description: "Short description of what the code should do (under 60 chars)",
                    },
                    codeTemplate: {
                      type: "string",
                      description: "Code snippet with exactly one ___ blank to fill in",
                    },
                    answer: {
                      type: "string",
                      description: "The correct answer to fill in the blank (single word or short expression)",
                    },
                    hint: {
                      type: "string",
                      description: "A helpful one-line hint (under 50 chars)",
                    },
                  },
                  required: ["prompt", "codeTemplate", "answer", "hint"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_challenge" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const challenge = JSON.parse(toolCall.function.arguments);
    challenge.damage = damage;
    challenge.id = `ai-${Date.now()}`;
    challenge.language = language;
    challenge.difficulty = difficulty;

    return new Response(JSON.stringify(challenge), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-challenge error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

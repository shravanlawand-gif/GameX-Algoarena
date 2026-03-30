// @ts-ignore: Deno is not recognized by standard Vite TS
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Allowlists to prevent prompt injection and invalid values
const ALLOWED_DIFFICULTIES = ["easy", "medium", "hard"] as const;
const ALLOWED_LANGUAGES = [
  "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
  "kotlin", "swift", "ruby", "php", "scala", "dart", "r",
] as const;

type Difficulty = typeof ALLOWED_DIFFICULTIES[number];
type Language = typeof ALLOWED_LANGUAGES[number];

const damageMap: Record<Difficulty, number> = {
  easy: 15,
  medium: 20,
  hard: 30,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- 1. Parse & validate input ---
    let body: Record<string, unknown> = {};
    try {
      const parsed = await req.json();
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        body = parsed;
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const language = (typeof body.language === "string" ? body.language.toLowerCase() : "") as Language;
    const difficulty = (typeof body.difficulty === "string" ? body.difficulty.toLowerCase() : "") as Difficulty;

    if (!ALLOWED_DIFFICULTIES.includes(difficulty as Difficulty)) {
      return new Response(
        JSON.stringify({ error: `Invalid difficulty. Must be one of: ${ALLOWED_DIFFICULTIES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!ALLOWED_LANGUAGES.includes(language as Language)) {
      return new Response(
        JSON.stringify({ error: `Invalid language. Must be one of: ${ALLOWED_LANGUAGES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 2. API key check ---
    const GEMINI_API_KEY = "AIzaSyBuOZt384pRQupIieF4rwXPMERrGHbuUZM";

    const damage = damageMap[difficulty];

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

Respond ONLY with a valid JSON object with these exact fields:
{
  "prompt": "Short description of what the code should do (under 60 chars)",
  "codeTemplate": "Code snippet with exactly one ___ blank to fill in",
  "answer": "The correct answer to fill in the blank (single word or short expression)",
  "hint": "A helpful one-line hint (under 50 chars)"
}
No extra text, no markdown, no explanation. Just the JSON object.`;

    // --- 3. Call Gemini native endpoint ---
    const model = "gemini-2.0-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Generate a unique ${difficulty} ${language} coding challenge. Make it different from common textbook examples. Be creative!\n\n${systemPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 512,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    // --- 4. Handle API errors ---
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted or API key invalid." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `Gemini API error: ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 5. Parse Gemini response ---
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error("Empty response from Gemini:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Empty response from AI" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 6. Safely parse the AI JSON output ---
    let challenge: Record<string, unknown>;
    try {
      // Strip markdown code fences if model wraps output in them
      const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      challenge = JSON.parse(cleaned);
      if (!challenge || typeof challenge !== "object" || Array.isArray(challenge)) {
        throw new Error("Parsed content is not a JSON object");
      }
    } catch (parseErr) {
      console.error("Failed to parse AI JSON output:", rawText, parseErr);
      return new Response(
        JSON.stringify({ error: "AI returned malformed JSON. Please retry." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 7. Validate required fields ---
    const required = ["prompt", "codeTemplate", "answer", "hint"];
    for (const field of required) {
      if (!challenge[field] || typeof challenge[field] !== "string") {
        console.error(`Missing or invalid field: ${field}`, challenge);
        return new Response(
          JSON.stringify({ error: `AI response missing field: ${field}` }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // --- 8. Build and return final challenge ---
    const result = {
      ...challenge,
      damage,
      id: `ai-${Date.now()}`,
      language,
      difficulty,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Unhandled generate-challenge error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
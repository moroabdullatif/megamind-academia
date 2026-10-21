import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemma-3-27b-it";

const providerSchema = z.enum(["auto", "gemini", "openrouter"]).default("auto");
export type AiProvider = z.infer<typeof providerSchema>;

async function callGemini(prompt: string, schema?: object): Promise<string> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new Error("Gemini is not configured.");
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: schema
        ? { responseMimeType: "application/json", responseSchema: schema }
        : undefined,
    }),
  });
  if (!res.ok) {
    console.error("Gemini error", res.status, await res.text());
    throw new Error(res.status === 429 ? "AI is busy, try again in a moment." : "AI request failed.");
  }
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text) throw new Error("AI returned no answer.");
  return text;
}

async function callOpenRouter(prompt: string, wantJson: boolean): Promise<string> {
  const key = process.env["OPENROUTER_API_KEY"];
  if (!key) throw new Error("OpenRouter is not configured.");
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://megamind-quest.lovable.app",
      "X-Title": "MegaMind",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "user",
          content: wantJson
            ? `${prompt}\n\nRespond ONLY with a JSON array of objects with keys "term", "hint", "definition". No markdown, no extra text.`
            : prompt,
        },
      ],
    }),
  });
  if (!res.ok) {
    console.error("OpenRouter error", res.status, await res.text());
    throw new Error(res.status === 429 ? "AI is busy, try again in a moment." : "AI request failed.");
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("AI returned no answer.");
  return text;
}

async function callAi(provider: AiProvider, prompt: string, schema?: object): Promise<string> {
  if (provider === "gemini") return callGemini(prompt, schema);
  if (provider === "openrouter") return callOpenRouter(prompt, !!schema);
  try {
    return await callGemini(prompt, schema);
  } catch (e) {
    console.warn("Gemini failed, falling back to OpenRouter", e);
    return callOpenRouter(prompt, !!schema);
  }
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  return JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned);
}

const termSchema = z.object({ term: z.string(), hint: z.string(), definition: z.string() });

export const generateTerms = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        major: z.string().max(40),
        level: z.number().int().min(1).max(999),
        count: z.number().int().min(3).max(10),
        provider: providerSchema,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const text = await callAi(
      data.provider,
      `Create ${data.count} distinct academic vocabulary terms for a university student majoring in ${data.major}. Difficulty: level ${data.level} (higher = harder). Each term must be ONE word, letters A-Z only, 4 to 10 letters. Give a short hint (max 4 words, must not contain the term) and a one-sentence definition (must not contain the term).`,
      {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: { term: { type: "STRING" }, hint: { type: "STRING" }, definition: { type: "STRING" } },
          required: ["term", "hint", "definition"],
        },
      },
    );
    const parsed = z.array(termSchema).parse(extractJson(text));
    const seen = new Set<string>();
    const terms = parsed
      .map((t) => ({ ...t, term: t.term.toUpperCase().replace(/[^A-Z]/g, "") }))
      .filter((t) => t.term.length >= 3 && t.term.length <= 10 && !seen.has(t.term) && seen.add(t.term));
    if (terms.length < 3) throw new Error("AI returned too few terms.");
    return terms;
  });

export const smartHint = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        term: z.string().max(20),
        definition: z.string().max(400),
        major: z.string().max(40),
        provider: providerSchema,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const text = await callAi(
      data.provider,
      `A ${data.major} student is trying to guess the term "${data.term}" (definition: "${data.definition}"). Give ONE friendly, helpful clue in under 25 words that nudges them toward it — an example, analogy, or related idea. Never say the term or any word containing it.`,
    );
    const re = new RegExp(data.term, "gi");
    return { hint: text.trim().replace(re, "★★★") };
  });

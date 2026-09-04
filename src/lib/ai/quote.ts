import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const QuoteSchema = z.object({
  summary: z.string(),
  scope: z.array(
    z.object({
      phase: z.string(),
      deliverables: z.array(z.string()),
      estimateNote: z.string(),
    }),
  ),
  timeline: z.string(),
  priceRange: z.string(),
  assumptions: z.array(z.string()),
});

export type QuoteScope = z.infer<typeof QuoteSchema>["scope"];

export type QuoteResult =
  | {
      ok: true;
      summary: string;
      scope: QuoteScope;
      timeline: string;
      priceRange: string;
      assumptions: string[];
      raw: string;
    }
  | { ok: false; error: string; raw?: string };

const SYSTEM_PROMPT = `You are a senior full-stack engineer at a software agency, preparing a precise, detailed quotation for a prospective client request. You have deep experience across frontend, backend, infrastructure, and project scoping.

Given the client's request, produce an itemized quotation. Be concrete and realistic — break work into phases, name real deliverables, and give honest timeline and price estimates in USD ranges. Call out assumptions or risks that could change the estimate.

Respond with ONLY a single JSON object, no markdown fences, no prose before or after, matching exactly this shape:
{
  "summary": "string — 2-4 sentence overview of the approach",
  "scope": [
    { "phase": "string", "deliverables": ["string", ...], "estimateNote": "string — effort/complexity note for this phase" }
  ],
  "timeline": "string — overall estimated timeline, e.g. '4-6 weeks'",
  "priceRange": "string — e.g. '$3,500 - $6,000'",
  "assumptions": ["string", ...]
}`;

function buildUserPrompt(input: { title: string; description: string; contextLabel?: string }) {
  const parts = [`Request title: ${input.title}`, `Request details: ${input.description}`];
  if (input.contextLabel) {
    parts.push(`This request references an existing catalog item: ${input.contextLabel}`);
  }
  return parts.join("\n\n");
}

export async function generateQuotation(input: {
  title: string;
  description: string;
  contextLabel?: string;
}): Promise<QuoteResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "AI quotation service is not configured." };
  }

  const client = new Anthropic({ apiKey });

  let raw: string;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input) }],
    });
    const textBlock = message.content.find((block) => block.type === "text");
    raw = textBlock && "text" in textBlock ? textBlock.text : "";
  } catch {
    return { ok: false, error: "Failed to reach the AI quotation service. Please try again." };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { ok: false, error: "The AI response could not be parsed. Please try again.", raw };
  }

  const parsed = QuoteSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return { ok: false, error: "The AI response did not match the expected format.", raw };
  }

  return {
    ok: true,
    summary: parsed.data.summary,
    scope: parsed.data.scope,
    timeline: parsed.data.timeline,
    priceRange: parsed.data.priceRange,
    assumptions: parsed.data.assumptions,
    raw,
  };
}

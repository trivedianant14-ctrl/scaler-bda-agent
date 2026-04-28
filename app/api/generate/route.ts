import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import scalerKb from "@/src/lib/scaler-kb.json";
import { extractJSON } from "@/src/lib/parse-json";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are creating a personalized post-call document for a prospective Scaler lead. This document will be sent as a PDF on WhatsApp after their call with a BDA. Its job is to build enough trust that the lead takes the entrance test.

You have:
- The lead's profile
- Their open questions from the call
- Scaler's knowledge base (real facts only)

First, classify the lead's persona:
- SKEPTICAL_SWITCHER: Credentialed, ROI-focused, compares alternatives. Tone: peer-to-peer, data-forward, no fluff. Show them numbers.
- SENIOR_VALIDATOR: Experienced, wants non-trivial value, hates generic. Tone: technical depth, instructor credibility, no hand-holding.
- ANXIOUS_ASPIRER: Financial fear, family pressure, imposter risk. Tone: warm, reassuring, step-by-step. EMI math, alumni stories from similar backgrounds.

Then generate the PDF content as JSON with this structure:
{
  "persona": "SKEPTICAL_SWITCHER" | "SENIOR_VALIDATOR" | "ANXIOUS_ASPIRER",
  "headline": "A one-line personalized headline for the document",
  "greeting": "A 2-line personalized opening that references something specific from their call",
  "sections": [
    {
      "title": "Section title addressing their specific question",
      "content": "2-4 paragraphs answering their question with real Scaler facts from the KB. Be specific. No generic marketing.",
      "evidence": ["Bullet point evidence items - alumni data, curriculum modules, salary stats"],
      "source_note": "Where this data comes from - e.g. 'B2K Analytics audit, same agency as IIM-A' or 'Scaler Academy curriculum page'"
    }
  ],
  "cta": {
    "headline": "Personalized call-to-action headline",
    "body": "1-2 lines nudging them toward the entrance test, framed for their persona",
    "test_framing": "How to frame the entrance test for this persona - e.g. for anxious aspirer: 'it determines your batch and scholarship, not whether you get in'"
  },
  "whatsapp_message": "A short 2-3 line WhatsApp covering message to send with the PDF. Personalized, not generic."
}

Rules:
- Every claim must come from the Scaler KB provided. If a claim is not in the KB, say 'our team can share specifics on this' instead of fabricating.
- Each section must address a SPECIFIC question the lead asked, not generic program info.
- The document tone must match the persona. Rohan's PDF should not read like Meera's.
- Keep total content to 2-3 pages worth when rendered.

Return ONLY valid JSON. No markdown formatting, no code fences, no preamble text.`;

export type PdfSection = {
  title: string;
  content: string;
  evidence: string[];
  source_note: string;
};

export type GeneratedPdf = {
  persona: "SKEPTICAL_SWITCHER" | "SENIOR_VALIDATOR" | "ANXIOUS_ASPIRER";
  headline: string;
  greeting: string;
  sections: PdfSection[];
  cta: {
    headline: string;
    body: string;
    test_framing: string;
  };
  whatsapp_message: string;
};

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { name, role, company, yoe, intent, linkedinContext, questions } = body;

    const userContent = `Lead Profile:
- Name: ${name || "Not provided"}
- Current Role: ${role || "Not provided"}
- Company: ${company || "Not provided"}
- Years of Experience: ${yoe ?? "Not provided"}
- Intent / Goal: ${intent || "Not provided"}
- LinkedIn Context: ${linkedinContext || "Not provided"}

Open Questions from Call:
${JSON.stringify(questions ?? [], null, 2)}

Scaler Knowledge Base:
${JSON.stringify(scalerKb, null, 2)}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const raw = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let pdf: GeneratedPdf;
    try {
      pdf = extractJSON(raw) as GeneratedPdf;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to parse Claude response";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ pdf, usage: message.usage });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

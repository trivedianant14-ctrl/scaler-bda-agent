import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const MAX_LENGTH = 1500;

// Split a long message at paragraph / section boundaries, never exceeding maxLength per chunk.
function splitAtBoundaries(message: string, maxLength: number): string[] {
  const parts = message.split(/(?:---|(?:\n\n+))/);
  const chunks: string[] = [];
  let current = "";

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const candidate = current ? `${current}\n\n${trimmed}` : trimmed;

    if (candidate.length <= maxLength) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxLength) {
        // Single paragraph too long: split at word boundary
        let rest = trimmed;
        while (rest.length > maxLength) {
          const slice = rest.slice(0, maxLength);
          const cut = slice.lastIndexOf(" ") > 0 ? slice.lastIndexOf(" ") : maxLength;
          chunks.push(rest.slice(0, cut).trim());
          rest = rest.slice(cut).trim();
        }
        current = rest;
      } else {
        current = trimmed;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks.length ? chunks : [message.slice(0, maxLength)];
}

async function sendWhatsAppMessages(
  client: ReturnType<typeof twilio>,
  from: string,
  to: string,
  message: string,
  pdfUrl?: string
): Promise<void> {
  if (message.length <= MAX_LENGTH) {
    await client.messages.create({
      from,
      to,
      body: message,
      ...(pdfUrl ? { mediaUrl: [pdfUrl] } : {}),
    });
    return;
  }

  const chunks = splitAtBoundaries(message, MAX_LENGTH);
  for (let i = 0; i < chunks.length; i++) {
    const isLast = i === chunks.length - 1;
    await client.messages.create({
      from,
      to,
      body: chunks[i],
      ...(isLast && pdfUrl ? { mediaUrl: [pdfUrl] } : {}),
    });
    if (!isLast) await new Promise((r) => setTimeout(r, 500));
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return NextResponse.json({ error: "Twilio credentials not configured" }, { status: 500 });
  }
  if (!process.env.TWILIO_WHATSAPP_FROM) {
    return NextResponse.json({ error: "TWILIO_WHATSAPP_FROM not configured" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { message, to, pdfUrl } = body as { message: string; to: string; pdfUrl?: string };

    if (!message || !to) {
      return NextResponse.json({ error: "message and to are required" }, { status: 400 });
    }

    // Normalize to whatsapp:+<digits> — strip existing prefix and whitespace, then rebuild
    const bare = to.trim().replace(/\s/g, "").replace(/^whatsapp:/i, "");
    const toFormatted = bare.startsWith("+") ? `whatsapp:${bare}` : `whatsapp:+${bare}`;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const from = process.env.TWILIO_WHATSAPP_FROM;

    // PDF covering message: keep as one message with attachment — truncate if oversized
    // Nudge: split into sequential messages at paragraph boundaries
    const messageToSend =
      pdfUrl && message.length > MAX_LENGTH
        ? message.split(/\n\n+/)[0].slice(0, MAX_LENGTH - 35) + "... see attached PDF for details"
        : message;

    await sendWhatsAppMessages(client, from, toFormatted, messageToSend, pdfUrl);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/whatsapp]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export function extractJSON(text: string): unknown {
  let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const firstBracket = cleaned.search(/[\[{]/);
  const lastBracket = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
  if (firstBracket !== -1 && lastBracket !== -1) {
    try {
      return JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
    } catch {}
  }

  throw new Error(`Failed to parse JSON from Claude response: ${cleaned.slice(0, 200)}`);
}

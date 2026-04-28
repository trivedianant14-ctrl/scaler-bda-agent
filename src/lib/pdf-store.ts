import { randomUUID } from "crypto";

// In-memory store. Works in a single-process environment (dev, single-instance server).
// In multi-instance serverless deployments, replace with Redis or object storage.
type Entry = { buffer: Buffer; expiresAt: number };
const store = new Map<string, Entry>();
const TTL_MS = 60 * 60 * 1000; // 1 hour

export function storePdf(buffer: Buffer): string {
  const id = randomUUID();
  store.set(id, { buffer, expiresAt: Date.now() + TTL_MS });
  // Evict expired entries on each write
  for (const [key, entry] of store.entries()) {
    if (Date.now() > entry.expiresAt) store.delete(key);
  }
  return id;
}

export function getPdf(id: string): Buffer | null {
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(id);
    return null;
  }
  return entry.buffer;
}

# Scaler BDA Agent

AI agent that sends a personalised pre-call nudge to a BDA and a post-call PDF to the lead via WhatsApp.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/health` | GET | Liveness check |
| `/api/nudge` | POST | Generate BDA pre-call nudge from lead profile |
| `/api/transcribe` | POST | Audio → transcript via Whisper |
| `/api/extract` | POST | Transcript → open questions |
| `/api/generate` | POST | Persona + questions → PDF buffer |
| `/api/whatsapp` | POST | Send message or media via Twilio |

---

## What you built

<!-- Fill in after implementation -->

## One failure

<!-- A thing that didn't work, what you tried, how you resolved it (or didn't) -->

## Scale plan

<!-- How you'd take this from a take-home to production -->

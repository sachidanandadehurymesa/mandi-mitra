# Mandi Mitra — Your AI Farming Companion

Mandi Mitra helps small onion farmers in the Nashik–Lasalgaon belt (Maharashtra)
decide which mandi (market) to sell at, by ranking nearby mandis on **expected
net earnings** — sale value minus transport cost minus mandi charges — instead
of just the headline price.

This is a working MVP. Everything runs end-to-end on a clearly-labeled demo
dataset; the architecture is built so real data sources (Agmarknet, Supabase,
Claude, WhatsApp) can be plugged in later without rewriting the app.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables
are required to try every feature, including the admin dashboard (see below).

Other commands:

```bash
npm run test    # calculation-engine unit tests (vitest)
npm run lint    # eslint
npm run build   # production build
```

## What's real vs. demo

| Area | Status |
|---|---|
| Calculation engine (`src/lib/calc/engine.ts`) | **Real.** Deterministic, unit-tested, used by every page — never an LLM. |
| Mandi/village/price/charges/transport data | **Demo dataset** (`src/lib/data/*`), clearly badged "DEMO" in the UI. |
| Market data provider (`src/lib/market/provider.ts`) | Architecture is real; the Agmarknet/data.gov.in integration is a documented stub that always falls back to demo data. |
| AI assistant (`src/lib/ai/assistant.ts`) | Rule-based Marathi/Hindi/English parser works today; the Claude-backed version is a documented stub (never performs financial math). |
| WhatsApp service (`src/lib/whatsapp/service.ts`) | Reusable parse → calculate → format → send pipeline exists; there is no webhook route and no message is ever actually sent. |
| Admin auth (`src/lib/auth/admin-session.ts`) | Works today (signed session cookie), but is a single shared password, not per-user accounts — replace with Supabase Auth before a real pilot. |
| Database (`supabase/migrations`, `supabase/seed.sql`) | Schema + RLS policies + seed data written, **not applied anywhere** — no Supabase project is connected in this environment. |

## Admin dashboard

Visit `/admin`. If `ADMIN_PASSWORD` is not set, the login screen shows a demo
fallback password (`mandi-mitra-admin`) so you can sign in immediately. Edits
in the admin UI update only your current browser session (nothing is
persisted) until Supabase is connected.

## Environment variables

All optional — copy `.env.example` to `.env.local` and fill in what you have.
See that file for the full list and what each one unlocks (Agmarknet,
Claude/Anthropic, WhatsApp, Supabase, admin password).

## Project structure

```
src/
  app/                    Routes: landing, dashboard, compare, compare/results,
                          insights, admin, api/compare, api/admin/*
  components/             UI components, grouped by feature + shadcn-style ui/ primitives
  lib/
    calc/                 Deterministic calculation engine + tests
    data/                 Demo dataset (villages, mandis, prices, distances, charges, transport rates, feedback)
    market/               Market data provider abstraction (demo + Agmarknet stub)
    ai/                   AI assistant interface (rule-based mock + Claude stub)
    whatsapp/             WhatsApp-ready service pipeline (not connected)
    services/             Orchestrates data + calc engine for the API routes
    auth/                 Demo admin session auth
    i18n/                 English/Marathi translations + locale store
    validation/           Zod schemas
  types/                  Shared domain types
supabase/
  migrations/             Intended production schema (not applied)
  seed.sql                Demo seed data matching src/lib/data
```

## Known limitations (be upfront about these in any demo)

- All mandi/village distances and prices are illustrative, not surveyed or
  live — every figure in the UI is badged DEMO, LIVE, CACHED, or STALE
  accordingly.
- The admin dashboard does not persist changes across reloads; it needs a
  connected Supabase project (schema is ready in `supabase/`).
- The AI assistant and WhatsApp integrations are architecture + working mocks,
  not live integrations — do not demo them as "connected to Claude" or
  "connected to WhatsApp."
- The in-memory rate limiter on `/api/compare` and `/api/admin/login` is
  per server instance; replace with a shared store before a multi-instance
  production deployment.

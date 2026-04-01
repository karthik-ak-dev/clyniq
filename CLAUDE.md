# ClinicPilot — Project Guide

## What This Is
AI-powered clinic management SaaS for Tier 2/3 Indian doctors. Appointment booking, patient records, AI pre-visit summaries — all in one.

See `MVP_PLAN.md` for full product spec, DB schema, API routes, and feature details.

## Tech Stack
- **Framework:** Next.js 16 (App Router, `src/` directory)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Database:** Neon PostgreSQL (serverless) via Drizzle ORM
- **Auth:** Firebase Auth (Phone OTP)
- **Payments:** Razorpay (patient deposits + doctor subscriptions)
- **AI:** OpenAI GPT-4o-mini (questionnaire summaries)
- **File Storage:** Cloudflare R2
- **Hosting:** Vercel

## Project Structure
```
src/
├── app/
│   ├── api/                    # API route handlers
│   │   ├── auth/               # send-otp, verify-otp
│   │   ├── doctor/             # onboard, profile, schedule, fees, [slug], stats
│   │   ├── appointments/       # slots, book, today, [id]/status
│   │   ├── patients/           # search, [id], list
│   │   ├── visits/             # create, [id]
│   │   ├── documents/          # upload, patient/[id], [id]
│   │   └── subscription/       # status, create, webhook, cancel
│   ├── (public)/[slug]/        # Doctor's public booking page (SSR)
│   ├── (auth)/                 # Login, onboarding screens
│   ├── (dashboard)/            # Doctor dashboard, patients, visits, settings, billing
│   ├── layout.tsx
│   ├── page.tsx                # Marketing landing page
│   └── globals.css
├── components/
│   ├── ui/                     # Reusable UI primitives (Button, Input, Modal, etc.)
│   ├── booking/                # Patient-facing booking flow components
│   ├── dashboard/              # Doctor dashboard components
│   └── forms/                  # Form components (onboarding, visit record, etc.)
├── lib/
│   ├── db/                     # Drizzle schema + db client
│   │   ├── schema.ts           # All table definitions
│   │   └── index.ts            # DB connection export
│   ├── auth/                   # Firebase auth helpers (client + admin)
│   ├── payments/               # Razorpay helpers
│   ├── ai/                     # OpenAI summary generation
│   ├── storage/                # R2 upload helpers
│   └── validators/             # Zod schemas for API validation
├── drizzle/                    # Generated migration SQL files
└── __tests__/                  # Test files
    ├── api/
    ├── components/
    └── integration/
```

## File Ownership Rules (for Agent Teams)

When working in a team, each teammate MUST only edit files they own. Do NOT touch files owned by another teammate without explicit coordination.

### Backend Developer owns:
- `src/app/api/**/*` — All API route handlers
- `src/lib/db/**/*` — Database schema and client
- `src/lib/auth/**/*` — Firebase auth server helpers
- `src/lib/payments/**/*` — Razorpay integration
- `src/lib/ai/**/*` — OpenAI integration
- `src/lib/storage/**/*` — R2 upload logic
- `src/lib/validators/**/*` — Zod validation schemas

### Frontend Developer owns:
- `src/app/(public)/**/*` — Public doctor pages
- `src/app/(auth)/**/*` — Auth screens (login, onboarding)
- `src/app/(dashboard)/**/*` — Dashboard pages
- `src/app/page.tsx` — Landing page
- `src/app/layout.tsx` — Root layout
- `src/app/globals.css` — Global styles
- `src/components/**/*` — All UI components

### QA Engineer owns:
- `__tests__/**/*` — All test files

### Shared files (coordinate before editing):
- `package.json` — Ask lead before adding deps
- `src/lib/db/schema.ts` — Backend owns, but Frontend reads types from it
- `.env.example` — Backend owns

## Code Patterns

### API Routes
All API routes use Next.js Route Handlers. Return consistent JSON:
```typescript
// Success
return Response.json({ success: true, data: { ... } });

// Error
return Response.json({ success: false, error: "message" }, { status: 400 });
```

### Database
Use Drizzle ORM for all queries. Import from `@/lib/db`:
```typescript
import { db, doctors, patients } from "@/lib/db";
import { eq } from "drizzle-orm";
```

### Money
All monetary amounts stored in **paise** (integer). Display conversion: `amount / 100`.

### Phone Numbers
Store with country code: `+91XXXXXXXXXX` (15 char max).

### Slug Generation
From doctor name: lowercase, replace spaces with hyphens, remove special chars. e.g., "Dr. Rajesh Sharma" → "dr-rajesh-sharma". Append number if duplicate.

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npm run db:generate` — Generate Drizzle migrations
- `npm run db:push` — Push schema to DB (dev)
- `npm run db:migrate` — Run migrations (prod)
- `npm run db:studio` — Open Drizzle Studio (DB browser)

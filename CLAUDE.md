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
│   ├── api/                    # API route handlers (20 endpoints)
│   │   ├── auth/               # send-otp, verify-otp
│   │   ├── doctor/             # onboard, profile, schedule, fees, [slug], stats
│   │   ├── appointments/       # slots, book, today, [id]/status, questionnaire
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
│   ├── ui/                     # Reusable primitives (Button, Input, Modal, Card, Badge, etc.)
│   ├── booking/                # Patient booking flow (SlotPicker, PatientForm, PaymentStep, etc.)
│   ├── dashboard/              # Doctor dashboard (AppointmentCard, Sidebar, StatsCard, etc.)
│   └── forms/                  # Forms (LoginForm, OnboardingForm, VisitRecordForm, etc.)
├── lib/
│   ├── db/
│   │   ├── schema.ts           # Drizzle table definitions (9 tables)
│   │   ├── types.ts            # TypeScript types inferred from schema + enums
│   │   ├── index.ts            # DB connection + re-exports
│   │   └── queries/            # DB operations (the "repo" layer)
│   │       ├── doctors.ts
│   │       ├── patients.ts
│   │       ├── appointments.ts
│   │       ├── visits.ts
│   │       ├── subscriptions.ts
│   │       ├── questionnaires.ts
│   │       ├── documents.ts
│   │       └── index.ts
│   ├── auth/
│   │   ├── firebase-client.ts  # Client-side: sendOtp, verifyOtp (browser only)
│   │   ├── firebase-admin.ts   # Server-side: verifyIdToken (API routes only)
│   │   └── middleware.ts       # getAuthenticatedDoctor(req) → Doctor
│   ├── payments/
│   │   └── razorpay.ts         # createOrder, createSubscription, verifyWebhook
│   ├── ai/
│   │   └── summarize.ts        # generateSummary(questionnaire) → string
│   ├── storage/
│   │   └── r2.ts               # uploadFile, deleteFile (Cloudflare R2)
│   └── validators/             # Zod schemas for API input validation
│       ├── doctor.ts
│       ├── appointment.ts
│       ├── visit.ts
│       └── index.ts
├── drizzle/                    # Generated migration SQL files
└── __tests__/                  # Test files
    ├── api/
    ├── components/
    └── integration/
```

## Type System (3 layers, zero duplication)

### Layer 1: Schema → Types (compile-time)
Types auto-inferred from Drizzle schema. Never define types manually.
```typescript
import type { Doctor, NewDoctor, Appointment } from "@/lib/db/types";
```

### Layer 2: Validators (runtime)
Zod schemas validate API input at the boundary.
```typescript
import { onboardDoctorSchema } from "@/lib/validators";
const data = onboardDoctorSchema.parse(body); // throws on invalid input
```

### Layer 3: Database (constraints)
Schema enforces unique constraints, foreign keys, not-null at DB level.

## Data Flow Pattern
```
Request → Validator (Zod) → Query (Drizzle) → Response
```
- API routes are thin controllers — validate, call query, return response
- All DB logic lives in `lib/db/queries/*.ts`
- Validators in `lib/validators/*.ts`
- Shared types in `lib/db/types.ts`

## Code Patterns

### API Routes
All routes return consistent JSON:
```typescript
// Success
return Response.json({ success: true, data: { ... } });
// Error
return Response.json({ success: false, error: "message" }, { status: 400 });
```

### Database Queries
Import from queries layer, not raw Drizzle in routes:
```typescript
import { doctorQueries } from "@/lib/db/queries";
const doctor = await doctorQueries.findBySlug(slug);
```

### Constants
- **Money:** paise (integer). ₹300 = 30000. Display: `amount / 100`
- **Phone:** `+91XXXXXXXXXX` format
- **Slug:** lowercase, hyphens, no special chars. "Dr. Rajesh Sharma" → "dr-rajesh-sharma"
- **Enums:** Use const objects from `lib/db/types.ts` (APPOINTMENT_STATUS, GENDER, etc.)

## Agent Teams — File Ownership
See `.claude/agents/backend-dev.md`, `.claude/agents/frontend-dev.md`, `.claude/agents/qa-engineer.md` for teammate-specific instructions and file ownership boundaries.

**Quick reference:**
- **Backend Dev** → `src/app/api/**`, `src/lib/**`
- **Frontend Dev** → `src/app/(public|auth|dashboard)/**`, `src/components/**`
- **QA Engineer** → `__tests__/**`
- **Shared** → `package.json`, `schema.ts` (coordinate before editing)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npm run db:generate` — Generate Drizzle migrations
- `npm run db:push` — Push schema to DB (dev)
- `npm run db:migrate` — Run migrations (prod)
- `npm run db:studio` — Open Drizzle Studio (DB browser)

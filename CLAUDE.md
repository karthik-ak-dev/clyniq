# Clyniq — Patient Compliance Tracker

## What This Is

A doctor-controlled compliance tracking SaaS for chronic conditions (Diabetes & Obesity). Doctors add patients, assign tracking templates, and get intelligent compliance summaries. Patients check in daily via a magic link — no login, no friction.

**Core Value:** _"Help doctors understand what patients actually do between visits."_

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, `src/` dir) | Fullstack, already set up |
| Language | TypeScript (strict) | Type safety |
| Database | Neon PostgreSQL (serverless) | Already configured |
| ORM | Drizzle ORM | Already in use, lighter than Prisma |
| Validation | Zod | Runtime input validation |
| Auth (Doctor) | NextAuth.js (email/password + OAuth) | Replaces Firebase — simpler for email-based auth |
| Auth (Patient) | Magic Link (no login) | Token-based URL, zero friction |
| Styling | Tailwind CSS v4 + shadcn/ui | Already configured + component library |
| Animations | Framer Motion (optional) | Micro-interactions, subtle motion |
| Notifications | Twilio WhatsApp API | Daily reminders (feature-flagged) |
| Hosting | Vercel | Serverless, cron jobs |
| DNS | Cloudflare | Edge caching |

### Key Dependencies to Add/Change

```
# REMOVE (from old ClinicPilot)
firebase, firebase-admin        # Replaced by NextAuth
razorpay                        # No payments in MVP
openai                          # No AI summaries in MVP
@aws-sdk/client-s3              # No file storage in MVP
uuid                            # Use crypto.randomUUID()

# ADD
next-auth                       # Doctor authentication
bcryptjs                        # Password hashing
@types/bcryptjs                 # Types
twilio                          # WhatsApp reminders (Phase 3)
framer-motion                   # Animations (optional)
```

### Keep From Existing

```
@neondatabase/serverless        # DB driver
drizzle-orm, drizzle-zod        # ORM + schema validation
drizzle-kit                     # Migrations CLI
zod                             # Validation
tailwindcss, @tailwindcss/postcss
next, react, react-dom
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts    # NextAuth handler
│   │   ├── patients/
│   │   │   ├── route.ts                  # POST: create patient, GET: list patients
│   │   │   ├── [id]/route.ts             # GET: patient detail
│   │   │   └── search/route.ts           # GET: search patients
│   │   ├── templates/
│   │   │   ├── route.ts                  # GET: list templates by condition
│   │   │   └── assign/route.ts           # POST: assign template to patient + set enabled questions
│   │   ├── checkin/
│   │   │   └── route.ts                  # POST: submit daily check-in (patient)
│   │   ├── compliance/
│   │   │   ├── [patientId]/route.ts      # GET: compliance score + trend + insights
│   │   │   └── summary/route.ts          # GET: all patients compliance overview
│   │   └── reminders/
│   │       └── send/route.ts             # POST: trigger WhatsApp (cron)
│   ├── (auth)/
│   │   ├── layout.tsx                    # Centered card layout
│   │   └── login/page.tsx                # Doctor login
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Sidebar + header
│   │   ├── dashboard/page.tsx            # Patient list with compliance overview
│   │   ├── patients/
│   │   │   ├── add/page.tsx              # Add patient form
│   │   │   └── [id]/page.tsx             # Patient detail (THE key screen)
│   │   └── settings/page.tsx             # Doctor profile settings
│   ├── p/
│   │   └── [token]/
│   │       └── page.tsx                  # Patient magic link entry + check-in
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Landing / marketing (or redirect to dashboard)
│   └── globals.css
├── components/
│   ├── ui/                               # shadcn/ui primitives (Button, Card, Input, Badge, etc.)
│   ├── dashboard/
│   │   ├── patient-card.tsx              # Card: name, compliance %, trend, last updated
│   │   ├── compliance-summary.tsx        # Meds/Diet/Activity breakdown
│   │   ├── trend-indicator.tsx           # Improving / Stable / Worsening
│   │   ├── insights-panel.tsx            # "Missed meds 3 times this week"
│   │   ├── activity-timeline.tsx         # Last 7 days visual timeline
│   │   ├── sidebar.tsx                   # Navigation sidebar
│   │   └── header.tsx                    # Top bar
│   ├── checkin/
│   │   ├── checkin-flow.tsx              # Patient daily check-in orchestrator (renders dynamic questions)
│   │   ├── question-renderer.tsx         # Renders a question by type (yes_no, number, text, scale)
│   │   ├── yes-no-button.tsx             # Large tap-friendly Yes/No
│   │   ├── number-input.tsx              # Number input with optional unit label
│   │   └── checkin-confirmation.tsx      # "Great job 👍"
│   └── forms/
│       ├── login-form.tsx                # Doctor login
│       ├── add-patient-form.tsx          # Name + phone + condition + question toggles
│       └── template-selector.tsx         # Condition selector → shows default template questions with toggles
├── lib/
│   ├── db/
│   │   ├── schema.ts                     # Drizzle table definitions (7 tables)
│   │   ├── types.ts                      # Inferred types + enums
│   │   ├── index.ts                      # DB connection + re-exports
│   │   └── queries/
│   │       ├── doctors.ts                # Doctor CRUD
│   │       ├── patients.ts               # Patient CRUD + search
│   │       ├── templates.ts              # Template CRUD + defaults
│   │       ├── checkins.ts               # Check-in CRUD + aggregations
│   │       ├── compliance.ts             # Score calculation, trends, insights
│   │       ├── reminders.ts              # Reminder config queries
│   │       └── index.ts                  # Barrel export
│   ├── auth/
│   │   ├── config.ts                     # NextAuth configuration
│   │   └── middleware.ts                 # getAuthenticatedDoctor(req) → Doctor
│   ├── compliance/
│   │   └── engine.ts                     # Score calc, trend detection, flag generation
│   ├── notifications/
│   │   └── whatsapp.ts                   # Twilio WhatsApp send (feature-flagged)
│   └── validators/
│       ├── patient.ts                    # createPatientSchema, etc.
│       ├── checkin.ts                    # checkinSchema
│       └── index.ts                      # Barrel export
└── middleware.ts                          # NextAuth route protection
```

---

## Database Schema (7 Tables)

### doctors
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, `crypto.randomUUID()` |
| name | VARCHAR(255) | |
| email | VARCHAR(255) | UNIQUE, used for login |
| password_hash | TEXT | bcrypt |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now() |

### patients
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(255) | |
| phone | VARCHAR(15) | |
| created_at | TIMESTAMP | default now() |

### tracking_templates (default question sets per condition)
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| condition | ENUM | `diabetes`, `obesity` |
| name | VARCHAR(255) | e.g., "Diabetes Default Template" |
| questions | JSONB | Array of question definitions (see below) |
| is_default | BOOLEAN | true for system defaults |
| created_at | TIMESTAMP | default now() |

**questions JSONB structure:**
```json
[
  { "key": "took_meds", "label": "Did you take your medicine today?", "type": "yes_no", "order": 1 },
  { "key": "followed_diet", "label": "Did you follow your diet today?", "type": "yes_no", "order": 2 },
  { "key": "did_activity", "label": "Did you exercise today?", "type": "yes_no", "order": 3 },
  { "key": "blood_sugar", "label": "What was your fasting blood sugar?", "type": "number", "unit": "mg/dL", "order": 4 },
  { "key": "weight", "label": "Enter your weight", "type": "number", "unit": "kg", "order": 5 }
]
```

**Question types:** `yes_no` | `number` | `text` | `scale` (1-10)

**Default templates (shipped with app):**

Diabetes:
```json
[
  { "key": "took_meds", "label": "Did you take your medicine today?", "type": "yes_no", "order": 1 },
  { "key": "followed_diet", "label": "Did you follow your diet today?", "type": "yes_no", "order": 2 },
  { "key": "did_activity", "label": "Did you exercise today?", "type": "yes_no", "order": 3 },
  { "key": "blood_sugar", "label": "What was your fasting blood sugar?", "type": "number", "unit": "mg/dL", "order": 4 },
  { "key": "weight", "label": "Enter your weight", "type": "number", "unit": "kg", "order": 5 }
]
```

Obesity:
```json
[
  { "key": "followed_diet", "label": "Did you follow your diet today?", "type": "yes_no", "order": 1 },
  { "key": "did_activity", "label": "Did you exercise today?", "type": "yes_no", "order": 2 },
  { "key": "water_intake", "label": "Did you drink enough water today?", "type": "yes_no", "order": 3 },
  { "key": "weight", "label": "Enter your weight", "type": "number", "unit": "kg", "order": 4 }
]
```

### doctor_patients (join table — a doctor's relationship to a patient)
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| doctor_id | UUID | FK → doctors |
| patient_id | UUID | FK → patients |
| condition | ENUM | `diabetes`, `obesity` |
| template_id | UUID | FK → tracking_templates |
| enabled_questions | JSONB | Array of question keys enabled for this patient, e.g., `["took_meds", "followed_diet", "did_activity"]` |
| magic_token | VARCHAR(64) | UNIQUE, for patient magic link |
| created_at | TIMESTAMP | default now() |
| | | UNIQUE(doctor_id, patient_id) |

**Flow:** Doctor selects condition → default template auto-assigned → all questions enabled by default → doctor can toggle individual questions on/off per patient.

### check_ins
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| doctor_patient_id | UUID | FK → doctor_patients |
| date | DATE | The check-in date |
| responses | JSONB | `{ "took_meds": true, "followed_diet": false, "blood_sugar": 120, "weight": 72.5 }` |
| created_at | TIMESTAMP | default now() |
| | | UNIQUE(doctor_patient_id, date) |

**responses** stores key-value pairs matching the question keys. Only enabled questions appear.

### reminder_configs
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| doctor_patient_id | UUID | FK → doctor_patients |
| reminder_time | TIME | e.g., "09:00" |
| enabled | BOOLEAN | default true |
| last_sent_at | TIMESTAMP | nullable |

### sessions (managed by NextAuth)
NextAuth will manage its own session/account tables via the Drizzle adapter.

---

## API Routes

### Doctor APIs (auth required)

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/patients` | Create patient + doctor_patient link + generate magic token |
| GET | `/api/patients` | List all doctor's patients with latest compliance |
| GET | `/api/patients/[id]` | Patient detail: compliance score, trend, insights, timeline |
| GET | `/api/patients/search?q=` | Search by name or phone |
| GET | `/api/templates?condition=` | List templates for a condition (returns questions) |
| POST | `/api/templates/assign` | Assign template to patient + set enabled questions |
| GET | `/api/compliance/[patientId]` | Full compliance data for one patient |
| GET | `/api/compliance/summary` | Overview of all patients' compliance |

### Patient APIs (token-based, no auth)

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/p/[token]` | Fetch patient context (name, doctor name, template) |
| POST | `/api/checkin` | Submit daily check-in (dynamic responses based on enabled questions) |

### System APIs

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/reminders/send` | Cron-triggered: send WhatsApp reminders |

---

## Compliance Engine (`lib/compliance/engine.ts`)

Works generically over any set of enabled questions — not hardcoded to specific keys.

### Score Calculation
```
For each yes_no question in enabled_questions:
  question_score = days_answered_yes / total_days (last 7 days)

overall_compliance = average of all yes_no question scores * 100

Number/text/scale questions are tracked but don't factor into compliance %.
```

### Trend Detection
```
Compare last 7 days avg vs previous 7 days avg:
  - Improving: current > previous + threshold
  - Worsening: current < previous - threshold
  - Stable: within threshold
```

### Flags / Insights (auto-generated, dynamic)
```
For each yes_no question:
  - If missed >= 3 times in last 7 days → "Missed {question.label} 3 times this week"
  - If no check-in for 3+ days → "No check-in for {n} days"
  - If a question's compliance is dropping vs previous week → "{question.label} compliance dropping"
```

---

## Design System

### Philosophy
- Minimal but expressive
- High whitespace, large typography
- Soft gradients, not clinical dashboards
- "Modern AI SaaS" feel — friendly + human

### Visual Identity
- **Primary:** Indigo / Blue gradient
- **Background:** Soft neutral (off-white)
- **Positive:** Green
- **Alert:** Red / Amber
- **Corners:** `rounded-2xl`
- **Shadows:** Soft, elevated cards
- **Glass:** Light glassmorphism (subtle)

### Typography
- Headings: Bold, large (`text-2xl`+ / `font-bold`)
- Body: Clean, readable (`text-base` / `text-gray-600`)
- Avoid dense text — whitespace is content

### Patient UI Principle
**"Tap, don't think"**
- Large buttons, minimal text
- Yes/No are the primary interactions
- Mobile-first, works on any phone

---

## Code Principles

### Zero Duplication, Single Responsibility
- **No duplicate modules or functions** solving the same problem. Before writing anything, check what already exists.
- **Understand existing patterns first.** Read neighbouring files to match style, naming, structure, and conventions already in use.
- **One canonical place for each concern.** E.g., compliance logic lives only in `lib/compliance/engine.ts`, not scattered across API routes or components.
- **Reuse over recreation.** If a helper, component, or utility already exists, use it. Don't create a second version.
- **Clean, readable code.** Consistent formatting, meaningful names, minimal nesting. Code should read like it was written by one person.

---

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
All DB logic lives in `lib/db/queries/*.ts`. Never raw Drizzle in API routes:
```typescript
import { patientQueries } from "@/lib/db/queries";
const patient = await patientQueries.findByDoctorId(doctorId);
```

### Type System (3 layers, zero duplication)
1. **Schema → Types** (compile-time): Auto-inferred from Drizzle schema
2. **Validators** (runtime): Zod schemas validate API input at boundary
3. **Database** (constraints): Schema enforces unique, FK, not-null at DB level

```typescript
// Types — always infer, never define manually
import type { Doctor, CheckIn, DoctorPatient } from "@/lib/db/types";

// Validation — at API boundary only
import { createPatientSchema } from "@/lib/validators";
const data = createPatientSchema.parse(body);
```

### Data Flow
```
Request → Validator (Zod) → Query (Drizzle) → Response
```

### Constants
- **Phone:** `+91XXXXXXXXXX` format
- **Magic Token:** 64-char random string (`crypto.randomBytes(32).toString('hex')`)
- **Dates:** ISO 8601 (`YYYY-MM-DD`)
- **Enums:** Const objects in `lib/db/types.ts`

---

## Feature Flags

```env
WHATSAPP_ENABLED=false    # Set true when Twilio is configured
```

---

## Environment Variables

```env
# Database
DATABASE_URL=              # Neon connection string

# Auth
NEXTAUTH_SECRET=           # Random secret for NextAuth
NEXTAUTH_URL=              # App URL (http://localhost:3000 in dev)

# WhatsApp (Phase 3)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=      # e.g., whatsapp:+14155238886
WHATSAPP_ENABLED=false
```

---

## Build Phases

### Phase 1 — Core (auth + patient CRUD + check-in)
- NextAuth setup (email/password)
- Doctor login page
- Dashboard page (patient list — empty state first)
- Add Patient page (name, phone, condition)
- Magic token generation
- Patient check-in page (`/p/[token]`)
- Check-in submission API
- Basic patient card on dashboard

### Phase 2 — Intelligence (compliance engine + patient detail)
- Compliance score calculation
- Trend detection (7-day rolling)
- Patient Detail page (THE most important screen):
  - Compliance summary (meds/diet/activity breakdown)
  - Trend indicator
  - Insights panel
  - Activity timeline (last 7 days)
- Dashboard patient cards show compliance % + trend

### Phase 3 — Notifications (WhatsApp reminders)
- Twilio WhatsApp integration
- Reminder config per patient
- Vercel Cron job to trigger daily
- Feature-flagged (`WHATSAPP_ENABLED`)

---

## What NOT to Build (MVP)

- File uploads / document storage
- Complex analytics / charts
- Multi-doctor patient sharing
- AI diagnosis or medical advice
- Payment / subscription system
- Patient login / accounts
- Email notifications (WhatsApp only)
- Admin panel

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to DB (dev)
npm run db:migrate   # Run migrations (prod)
npm run db:studio    # Open Drizzle Studio
```

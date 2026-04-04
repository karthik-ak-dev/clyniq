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
{ "key": "took_meds", "label": "Did you take your medicine today?", "type": "yes_no", "order": 1 }
{ "key": "followed_diet", "label": "How was your diet today?", "type": "choice", "options": ["Perfect","Good","Okay","Poor"], "order": 2 }
{ "key": "symptoms", "label": "Any symptoms today?", "type": "multi_choice", "options": ["Dizziness","Fatigue","None"], "order": 3 }
{ "key": "blood_sugar", "label": "What was your fasting blood sugar?", "type": "number", "unit": "mg/dL", "order": 4 }
```

**Question types:**

| Type | Response value | UI component | Scored? |
|---|---|---|---|
| `yes_no` | `boolean` | Yes/No toggle buttons | Yes — `true` = compliant |
| `choice` | `string` | Single-select option pills | Yes — top half of options = compliant |
| `multi_choice` | `string[]` | Multi-select checkboxes | No — tracked only |
| `number` | `number` | Numeric input with unit | No — tracked only |
| `text` | `string` | Free-form text input | No — tracked only |
| `scale` | `number` (1-10) | Slider/rating | No — tracked only |

Fields: `key`, `label`, `type` (required), `unit` (number types), `options` (choice/multi_choice), `order`

**Default templates (shipped with app, doctor toggles per patient):**

Diabetes (12 questions):
1. Did you take your medicine today? (`yes_no`)
2. Did you take your insulin? (`yes_no`)
3. How was your diet today? (`choice`: Perfect/Good/Okay/Poor)
4. Did you exercise today? (`yes_no`)
5. Did you drink enough water today? (`yes_no`)
6. What was your fasting blood sugar? (`number`, mg/dL)
7. What's your current weight? (`number`, kg)
8. How was your sleep last night? (`choice`: Great/Good/Okay/Poor/Awful)
9. How are you feeling today? (`choice`: Great/Good/Okay/Bad/Awful)
10. Any symptoms today? (`multi_choice`: Dizziness/Fatigue/Blurred Vision/Numbness/Excessive Thirst/None)
11. Did you consume alcohol today? (`yes_no`)
12. Did you check your feet today? (`yes_no`)

Obesity (10 questions):
1. How was your diet today? (`choice`: Perfect/Good/Okay/Poor)
2. Did you exercise today? (`yes_no`)
3. Did you drink enough water today? (`yes_no`)
4. Did you control your meal portions? (`yes_no`)
5. Did you avoid unhealthy snacking? (`yes_no`)
6. What's your current weight? (`number`, kg)
7. How many steps did you walk today? (`number`, steps)
8. How was your sleep last night? (`choice`: Great/Good/Okay/Poor/Awful)
9. How are you feeling today? (`choice`: Great/Good/Okay/Bad/Awful)
10. Did you eat due to stress or emotions? (`yes_no`)

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

### Reference
All UI must match the design references in `design/ref_1.jpeg`, `design/ref_2.jpeg`, `design/ref_3.jpeg`. Never deviate from these — compare pixel-by-pixel before shipping.

### Philosophy
- Minimal but expressive — no clutter, no wasted space
- Warm, friendly, soft — NOT clinical or corporate
- Every screen must fit in one viewport — **no scrolling** on patient pages
- Mobile-first for patient pages, desktop shows "use mobile" message

### Font
**Nunito** (Google Fonts) — rounded terminals, warm/friendly character.
- Loaded via `next/font/google` in `src/app/layout.tsx`
- Weights loaded: 400, 500, 600, 700, 800 + italic
- This is the ONLY font — used for headings, body, buttons, everything

### Typography Hierarchy (defined in `src/app/globals.css`)
Three levels, used consistently across ALL patient-facing pages:

| Level | Class | Size | Weight | Color | Usage |
|---|---|---|---|---|---|
| **Heading** | `.text-heading` | 2.75rem | 800 | `white` | Page titles ("Hi Ravi 👋") |
| **Secondary** | `.text-secondary` | 1.35rem | 600 | `white` | Context text ("Dr. Sharma is helping you stay on track.") |
| **Tertiary** | `.text-tertiary` | 1.15rem | 500 | `rgba(255,255,255,0.85)` | Subtitles ("Let's do a quick check-in today.") |

**Rules:**
- Always use these three classes — never inline font styles on patient pages
- All text is white on gradient backgrounds — no dark text
- Patient API returns first name only (not full name) for greetings

### Color Palette
- **Background:** Purple-lavender to pink-peach gradient (via background images in `public/images/`)
- **CTA gradient:** Pink-to-purple (`#e879f9` → `#c084fc` → `#a855f7` → `#8b5cf6`)
- **CTA 3D base:** Darker purple (`#9333ea` → `#7c3aed` → `#6d28d9`)
- **Text on gradient:** White (headings), white 85% opacity (tertiary)
- **Positive:** Green (for compliance badges)
- **Alert:** Red / Amber (for low compliance)

### Background Images (`public/images/`)
| File | Screen |
|---|---|
| `bg_mobile_home.jpeg` | Mobile: landing, greeting |
| `bg_desktop_home.jpeg` | Desktop: landing |
| `bg_mobile_questionare.jpeg` | Mobile: check-in question screens |
| `bg_mobile_summary.jpeg` | Mobile: completion/summary screen |

Applied via CSS `background-image` on `PageShell` component (not `<Image>`). Responsive switching via Tailwind `md:` breakpoint.

### CTA Button (defined in `src/app/globals.css`)
3D embossed pill button — two-layer construction:

```html
<div class="btn-cta-wrapper">
  <button class="btn-cta-face">Start Check-In →</button>
</div>
```

- **`.btn-cta-wrapper`** — darker purple gradient, `padding-bottom: 6px` creates the 3D bottom edge
- **`.btn-cta-face`** — lighter pink-purple gradient, the clickable surface
- Full-width within its container, centered
- `border-radius: 9999px` (full pill)
- Font: 1.2rem, weight 700, white
- Shadow: `0 4px 14px rgba(109,40,217,0.4)` for floating depth
- Active state: `scale(0.97)` for tactile press feedback

### Layout Rules (Patient Pages)
- **Viewport-locked:** `h-dvh overflow-hidden` — NO scrolling
- **Background:** Full-bleed cover image via `PageShell` component
- **Content position:** Upper portion (`pt-[28vh]`), centered horizontally
- **Button position:** Bottom of viewport, full-width with `px-8` side padding
- **Spacer:** `flex-1` div between content and button fills remaining space
- **Device detection:** `useDeviceType()` hook from `src/hooks/use-device-type.ts` — central, reusable

### Asset Placeholders
For illustration slots (3D characters, icons) where assets aren't ready yet:
```tsx
import { AssetPlaceholder } from "@/components/ui/asset-placeholder";
<AssetPlaceholder width={200} height={200} />           // invisible until asset ready
<AssetPlaceholder src="/images/hero.png" alt="Hero" />   // renders when src is set
```
Component: `src/components/ui/asset-placeholder.tsx`. Returns `null` when no `src` — zero visual footprint. When asset is added, just set the `src` prop, no other code change.

### Patient UI Principle
**"Tap, don't think"**
- Large buttons, minimal text
- Yes/No are the primary interactions
- Mobile-first, works on any phone
- Every screen fits in one viewport — no scrolling
- First name only in greetings

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

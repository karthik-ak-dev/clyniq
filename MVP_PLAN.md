# ClinicPilot — MVP Plan

## Product Overview

**One-line pitch:** AI-powered clinic management for Tier 2/3 Indian doctors. Appointment booking, patient records, AI summaries — all in one.

**Target user:** Private doctors and small clinics in Tier 2 & Tier 3 Indian towns doing OPD consultations.

**Problem:** 95% of small-town doctors use paper registers, WhatsApp, and memory to manage patients. Existing software (Practo Ray, ClinaNG) is too complex, too expensive, and built for urban multi-doctor clinics.

**Solution:** A dead-simple SaaS where doctors get a public booking page, patients book and fill health info inline, AI summarizes it for the doctor, and doctors maintain digital patient records — all in under 30 seconds per patient.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js (App Router) | Frontend + API routes |
| Hosting | Vercel | Serverless deployment |
| Database | Neon (PostgreSQL, serverless) | All structured data |
| File Storage | Cloudflare R2 | Photos, reports, scans |
| DNS / CDN | Cloudflare | Domain management, edge caching |
| Auth | Firebase Auth (Phone OTP) | Doctor + patient verification via SMS |
| Payments (Patient deposit) | Razorpay (Payment Gateway) | One-time deposit during booking |
| Payments (Doctor subscription) | Razorpay (Subscriptions API) | ₹499/mo auto-recurring |
| AI | OpenAI GPT-4o-mini | Pre-visit questionnaire summarization |

---

## Pricing Model

| | Details |
|---|---|
| **Free Trial** | 30 days, all features, no card required |
| **Pro Plan** | ₹499/month (auto-recurring via Razorpay Subscriptions) |
| **What's included** | Everything — landing page, bookings, patient records, AI summaries |

---

## Database Schema (Neon PostgreSQL)

### Table: `doctors`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| phone | VARCHAR(15) | Unique, used for login |
| name | VARCHAR(255) | |
| photo_url | TEXT | R2 file URL |
| specialization | VARCHAR(255) | e.g., "General Medicine" |
| qualifications | VARCHAR(500) | e.g., "MBBS, MD" |
| experience_years | INTEGER | |
| clinic_name | VARCHAR(255) | |
| clinic_address | TEXT | |
| clinic_phone | VARCHAR(15) | |
| consultation_fee | INTEGER | In paise (e.g., 30000 = ₹300) |
| deposit_amount | INTEGER | In paise (e.g., 5000 = ₹50) |
| slug | VARCHAR(255) | Unique, for public URL (e.g., "dr-rajesh-sharma") |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Table: `doctor_schedules`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| doctor_id | UUID | FK → doctors |
| day_of_week | INTEGER | 0=Sun, 1=Mon, ..., 6=Sat |
| start_time | TIME | e.g., "10:00" |
| end_time | TIME | e.g., "13:00" |
| slot_duration_mins | INTEGER | 15, 20, or 30 |
| is_active | BOOLEAN | Doctor can toggle days off |

Note: A doctor can have multiple rows per day (morning + evening sessions).

### Table: `subscriptions`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| doctor_id | UUID | FK → doctors |
| status | VARCHAR(20) | "trial", "active", "expired", "cancelled" |
| trial_ends_at | TIMESTAMP | 30 days from signup |
| razorpay_subscription_id | VARCHAR(255) | Razorpay subscription reference |
| current_period_start | TIMESTAMP | |
| current_period_end | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Table: `patients`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| doctor_id | UUID | FK → doctors |
| name | VARCHAR(255) | |
| phone | VARCHAR(15) | |
| age | INTEGER | |
| gender | VARCHAR(10) | "male", "female", "other" |
| blood_group | VARCHAR(5) | Optional |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

Unique constraint: (doctor_id, phone) — same patient phone per doctor is unique.

### Table: `appointments`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| doctor_id | UUID | FK → doctors |
| patient_id | UUID | FK → patients |
| date | DATE | Appointment date |
| time | TIME | Appointment time |
| status | VARCHAR(20) | "booked", "completed", "cancelled", "no_show" |
| deposit_amount | INTEGER | In paise |
| deposit_paid | BOOLEAN | |
| razorpay_payment_id | VARCHAR(255) | Payment reference |
| created_at | TIMESTAMP | |

Unique constraint: (doctor_id, date, time) — one appointment per slot.

### Table: `questionnaires`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| appointment_id | UUID | FK → appointments |
| patient_id | UUID | FK → patients |
| chief_complaint | TEXT | "Headache for 3 days" |
| duration | VARCHAR(50) | "few_days", "a_week", "more_than_week", "ongoing" |
| severity | INTEGER | 1-10 |
| existing_conditions | TEXT[] | Array: ["diabetes", "hypertension"] |
| current_medications | TEXT | Free text |
| allergies | TEXT | Free text |
| previous_surgeries | TEXT | Free text |
| additional_notes | TEXT | Optional free text |
| ai_summary | TEXT | AI-generated summary for doctor |
| filled_at | TIMESTAMP | |

### Table: `visits`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| doctor_id | UUID | FK → doctors |
| patient_id | UUID | FK → patients |
| appointment_id | UUID | FK → appointments (nullable, for walk-ins) |
| date | DATE | Visit date |
| chief_complaint | TEXT | |
| diagnosis | TEXT | |
| vitals_bp | VARCHAR(20) | e.g., "130/80" |
| vitals_temp | VARCHAR(10) | e.g., "99.2" |
| vitals_weight | VARCHAR(10) | e.g., "72" |
| vitals_pulse | VARCHAR(10) | e.g., "78" |
| investigations | TEXT | "CBC, Lipid Profile" |
| notes | TEXT | Doctor's notes |
| follow_up_date | DATE | Nullable |
| created_at | TIMESTAMP | |

### Table: `prescriptions`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| visit_id | UUID | FK → visits |
| medicine_name | VARCHAR(255) | "Amlodipine" |
| dosage | VARCHAR(100) | "10mg" |
| frequency | VARCHAR(50) | "OD", "BD", "TID", "SOS" |
| duration | VARCHAR(50) | "5 days", "1 month", "Continued" |
| instructions | TEXT | "After food", "Before bed" |
| sort_order | INTEGER | Display order |

### Table: `documents`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| patient_id | UUID | FK → patients |
| visit_id | UUID | FK → visits (nullable) |
| doctor_id | UUID | FK → doctors |
| file_url | TEXT | R2 URL |
| file_name | VARCHAR(255) | Original filename |
| file_type | VARCHAR(50) | "report", "scan", "other" |
| notes | TEXT | Optional description |
| uploaded_at | TIMESTAMP | |

---

## Feature List — MVP

### Module 1: Marketing Website

**Page:** Landing page at `yourproduct.in`

| Element | Details |
|---|---|
| Hero section | Tagline + "Start Free Trial" CTA |
| Features section | 4-5 feature highlights with icons |
| Pricing section | Free 30 days → ₹499/mo |
| Demo section | Link to a sample doctor page |
| Footer | Contact email, WhatsApp number |

---

### Module 2: Doctor Auth + Onboarding

**Screens:**
1. Login/Signup (Phone + OTP via Firebase)
2. Onboarding form (multi-step or single page)

| Step | Fields |
|---|---|
| Personal | Name, photo upload, specialization, qualifications, experience |
| Clinic | Clinic name, address, phone |
| Consultation | Fee amount, deposit amount |
| Schedule | Day-wise working hours + slot duration |

**Logic:**
- New doctor → auto-create subscription with `status: "trial"` and `trial_ends_at: now + 30 days`
- Auto-generate slug from name (e.g., "dr-rajesh-sharma")
- Redirect to dashboard after onboarding

---

### Module 3: Doctor's Public Landing Page

**URL:** `yourproduct.in/dr-rajesh-sharma`

**Displays:**
- Doctor photo, name, qualifications, specialization, experience
- Clinic name, address, phone
- Consultation fee
- Date picker → available slots for selected date
- "Book Appointment" button

**Logic:**
- Fetch doctor profile by slug
- Calculate available slots: (schedule for that day) minus (already booked appointments)
- Server-side rendered for SEO (so doctor's page ranks on Google)

---

### Module 4: Appointment Booking + Payment + Questionnaire (Single Flow)

**One continuous flow on the doctor's public page — patient never leaves:**

```
Step 1: Select date + slot
             ↓
Step 2: Enter details (name, phone, age, gender)
             ↓
Step 3: OTP verification for phone
             ↓
Step 4: Razorpay payment (deposit)
             ↓
Step 5: Payment success → questionnaire appears on SAME screen
        "Booking confirmed! Please fill a quick health form
         so the doctor is prepared for your visit."

        - Chief complaint (text)
        - Duration (dropdown: today / few days / a week / more / ongoing)
        - Severity (1-10 slider)
        - Existing conditions (checkboxes: Diabetes, BP, Heart, Thyroid, Asthma, None, Other)
        - Current medications (text)
        - Allergies (text)
        - Previous surgeries (text)

        [Submit] or [Skip]
             ↓
Step 6: Final confirmation screen
        "Done! Your appointment with Dr. Sharma
         is confirmed for 2 Apr, 10:30 AM.
         Clinic: MG Road, Salem
         Fee: ₹300 (₹50 paid, ₹250 at clinic)"
```

**Logic:**
- Check slot is still available before payment (prevent double booking)
- Create patient record if phone doesn't exist for this doctor
- Process Razorpay payment
- On payment success → create appointment with `status: "booked"`
- Show questionnaire inline (same page, no redirect, no separate link)
- Questionnaire is optional — patient can skip
- On questionnaire submit → call OpenAI GPT-4o-mini to generate AI summary
- Save both raw answers and AI summary to `questionnaires` table

**AI Summary Prompt:**
```
You are a medical assistant. Summarize this patient intake form
for a doctor. Be concise and highlight:
1. Chief complaint with duration and severity
2. Relevant medical history
3. Current medications
4. Allergies (highlight drug allergies prominently)
5. Any red flags or drug interaction warnings

Patient data:
{questionnaire_data}
```

---

### Module 5: Doctor Dashboard

**Screen:** Home screen after doctor login

**Displays:**
- Today's date
- Appointment count for today
- List of today's appointments:
  - Time
  - Patient name
  - Complaint (from questionnaire if filled)
  - Badge: "Pre-visit filled" or "Not filled"
- Search bar (search patients by name or phone)
- Quick stats: total patients count

**Logic:**
- Fetch appointments for doctor_id where date = today, ordered by time
- Join with questionnaire data to show fill status and complaint
- Search: `WHERE (name ILIKE '%query%' OR phone LIKE '%query%') AND doctor_id = ?`

---

### Module 6: Patient Profile + Visit History

**Screen:** Tapped from dashboard or search result

**Displays:**
- Patient name, phone, age, gender
- AI pre-visit summary (for today's appointment, if filled)
- Visit history (newest first):
  - Date
  - Complaint
  - Diagnosis
  - Key prescription items
- Documents section (uploaded reports/scans)
- "Add Today's Visit" button

**Logic:**
- Fetch patient by ID
- Fetch all visits for patient, ordered by date DESC
- Fetch questionnaire for today's appointment (if exists)
- Fetch documents for patient

---

### Module 7: Add Visit Record

**Screen:** Form to record today's consultation

**Fields:**
- Complaint (text, pre-filled from questionnaire if available)
- Diagnosis (text)
- Vitals: BP, Temperature, Weight, Pulse (all optional)
- Prescription table (repeatable rows):
  - Medicine name
  - Dosage
  - Frequency (dropdown: OD/BD/TID/QID/SOS)
  - Duration
  - Instructions
  - [+ Add another medicine]
- Investigations ordered (text)
- Notes (text)
- Follow-up date (date picker)
- Attach document (camera/file upload → R2)

**Logic:**
- Create visit record in `visits` table
- Create prescription rows in `prescriptions` table linked to visit
- Upload document to R2 if attached, save reference in `documents` table
- Update appointment status to "completed"

---

### Module 8: Doctor Settings

**Screen:** Settings/profile management

**Sections:**
- Edit profile (name, photo, qualifications, specialization)
- Edit clinic details (name, address, phone)
- Edit schedule (working hours per day, slot duration)
- Edit fees (consultation fee, deposit amount)
- Subscription status:
  - If trial: "Trial ends in X days" + "Subscribe Now" button
  - If active: "Next billing: [date]" + "Cancel Subscription"
  - If expired: "Your subscription has expired" + "Resubscribe"

---

### Module 9: Subscription & Billing

**Logic:**

Trial management:
- On signup: `status = "trial"`, `trial_ends_at = now + 30 days`
- On every authenticated request: middleware checks if trial expired
- If expired and no active subscription → redirect to "Subscribe" screen
- Expired state = read-only (doctor can view existing data but cannot add new records or accept new bookings)

Subscription:
- "Subscribe Now" → create Razorpay subscription (plan: ₹499/mo)
- Razorpay checkout opens → doctor pays via UPI/card
- On success webhook from Razorpay → update `status = "active"`, set period dates
- Razorpay handles monthly auto-debit and payment retries
- On payment failure → Razorpay retries → if fails after retries → `status = "expired"`
- Doctor can cancel → `status = "cancelled"` → remains active until current period ends

---

## Screens Summary

| # | Screen | User |
|---|---|---|
| 1 | Marketing landing page | Public |
| 2 | Doctor login (phone OTP) | Doctor |
| 3 | Doctor onboarding form | Doctor |
| 4 | Doctor's public landing page | Patient / Public |
| 5 | Booking + payment + questionnaire (single flow) | Patient |
| 6 | Booking confirmation | Patient |
| 7 | Doctor dashboard (today's appointments + search) | Doctor |
| 8 | Patient profile + visit history | Doctor |
| 9 | Add visit record form | Doctor |
| 10 | Doctor settings | Doctor |
| 11 | Subscribe / billing screen | Doctor |

**Total: 11 screens**

---

## API Routes (Next.js API Routes)

### Auth
- `POST /api/auth/send-otp` — Send OTP to phone via Firebase
- `POST /api/auth/verify-otp` — Verify OTP, return session

### Doctor
- `POST /api/doctor/onboard` — Save doctor profile + schedule + create trial subscription
- `GET /api/doctor/profile` — Get logged-in doctor's profile
- `PUT /api/doctor/profile` — Update profile
- `PUT /api/doctor/schedule` — Update working hours
- `PUT /api/doctor/fees` — Update consultation fee and deposit amount
- `GET /api/doctor/[slug]` — Public: get doctor page data (SSR)
- `GET /api/doctor/stats` — Dashboard quick stats

### Appointments
- `GET /api/appointments/slots?doctor_id=&date=` — Public: get available slots for a date
- `POST /api/appointments/book` — Public: book appointment + create patient + process payment + save questionnaire + generate AI summary (single API call)
- `GET /api/appointments/today` — Doctor: today's appointments with questionnaire status
- `PUT /api/appointments/[id]/status` — Doctor: update status (completed / cancelled / no_show)

### Patients
- `GET /api/patients/search?q=` — Doctor: search by name or phone
- `GET /api/patients/[id]` — Doctor: patient profile + visit history + documents + latest questionnaire
- `GET /api/patients` — Doctor: list all patients (paginated)

### Visits
- `POST /api/visits` — Doctor: create visit record + prescriptions
- `GET /api/visits/[id]` — Doctor: get visit details with prescriptions

### Documents
- `POST /api/documents/upload` — Upload file to R2, link to patient and/or visit
- `GET /api/documents/patient/[patient_id]` — All documents for a patient
- `DELETE /api/documents/[id]` — Delete a document

### Subscription
- `GET /api/subscription/status` — Current subscription status (trial/active/expired)
- `POST /api/subscription/create` — Create Razorpay subscription, return checkout URL
- `POST /api/subscription/webhook` — Razorpay webhook handler (payment success/failure)
- `POST /api/subscription/cancel` — Cancel subscription

**Total: 20 API routes**

---

## Build Timeline

| Day | Module | What to build |
|---|---|---|
| **1** | Setup | Next.js project, Neon DB setup, run schema migrations, R2 bucket, Firebase project, Vercel deploy, Cloudflare DNS |
| **2** | Module 1 | Marketing landing page |
| **3** | Module 2 | Doctor auth (phone OTP login/signup via Firebase) |
| **4** | Module 2 | Doctor onboarding form (profile + clinic + schedule + fees) |
| **5** | Module 3 | Doctor's public landing page (dynamic route, SSR) |
| **6** | Module 3 | Slot availability logic (schedule minus booked appointments = available) |
| **7** | Module 4 | Patient booking flow — step 1-3 (select slot + enter details + OTP) |
| **8** | Module 4 | Patient booking flow — step 4 (Razorpay deposit payment integration) |
| **9** | Module 4 | Patient booking flow — step 5-6 (inline questionnaire + AI summary + confirmation) |
| **10** | Module 5 | Doctor dashboard (today's appointments list + questionnaire status badges) |
| **11** | Module 5 | Patient search (by name and phone) |
| **12** | Module 6 | Patient profile page (info + AI summary + visit history + documents) |
| **13** | Module 7 | Add visit record form (complaint, diagnosis, Rx rows, vitals, notes, follow-up) |
| **14** | Module 7 | Document/report upload to R2 (attached to visit or patient) |
| **15** | Module 8 | Doctor settings page (edit profile, clinic, schedule, fees) |
| **16** | Module 9 | Subscription & billing (Razorpay subscriptions + trial logic + webhook handler) |
| **17** | — | Testing + bug fixes + deploy to production + test with your wife |

**Total: 17 working days (~3.5 weeks)**

---

## NOT in MVP (Phase 2 — build only after first 20 paying doctors)

| Feature | Why deferred |
|---|---|
| Prescription PDF generation | Doctors hand-write prescriptions for patients as they do today. Digital record is for doctor's reference. |
| WhatsApp notifications (booking, reminders) | Requires WhatsApp Business API setup. Not needed for core value. |
| Voice-to-record (speak → structured notes) | Adds complexity, test if doctors want it first |
| Drug interaction alerts | Need a drug database, complex to build |
| Smart prescription suggestions | Need usage data first |
| Auto follow-up reminders to patients | Phase 2 — needs WhatsApp Business API |
| Multi-doctor clinic support | Single doctor first, clinic mode later |
| Patient login / patient portal | Patients don't need an account in MVP |
| Regional language UI (Tamil, Hindi, Telugu) | English first, add languages based on demand |
| Revenue/analytics dashboard for doctor | Nice-to-have, not essential for launch |
| Reviews / ratings on doctor page | Not essential for MVP |
| Walk-in patient flow (no appointment) | Doctor can manually add a visit record without an appointment |
| Teleconsultation / video call | Different product, keep focus |
| Coupon codes / discount plans | Not needed yet |
| GST invoicing | Not needed yet |
| Mobile app (React Native) | PWA is sufficient for MVP |

---

## Success Metrics

| Metric | Target (Month 1-3) |
|---|---|
| Doctors signed up (free trial) | 20-30 |
| Doctors converted to paid | 10-15 |
| Patients booked via platform | 500+ |
| Pre-visit questionnaires filled | 40%+ of bookings |
| Doctor daily active usage | 70%+ of paid doctors |
| MRR | ₹5,000-7,500 |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Doctors don't want to pay ₹499/mo | Test pricing. Could start at ₹299/mo. Value prop = "saves you 1 hour daily". |
| Patients skip the questionnaire | Make it optional (skip button). Keep form short (2 mins max). Questionnaire appears right after payment when patient is most engaged. |
| Doctors find it hard to use | Test with your wife first. Keep UI dead simple. Phone-first design. |
| Razorpay UPI auto-debit fails | Razorpay handles retries automatically. Manually follow up with doctor if subscription lapses. |
| Competitor builds same thing | Your advantage = local sales through your wife's network. Doctor-to-doctor trust > features. |
| Data privacy / medical records concern | Use encrypted DB connections (SSL), HTTPS everywhere, add privacy policy. Not handling insurance/claims so regulatory burden is low. |

---

## Monthly Running Costs

### 0-20 doctors (~₹80/mo):

| Service | Cost |
|---|---|
| Vercel | ₹0 (free tier) |
| Neon | ₹0 (free tier — 190 compute hrs, 0.5GB) |
| Cloudflare R2 | ₹0 (free tier — 10GB) |
| Cloudflare DNS | ₹0 (free) |
| Firebase Auth | ₹0 (10K SMS/mo free) |
| OpenAI GPT-4o-mini | ~₹40 |
| Domain (.in) | ~₹40/mo |
| **Total** | **~₹80/mo** |

### 50 doctors (~₹1,200/mo):

| Service | Cost |
|---|---|
| Vercel | ₹500 |
| Neon | ₹0-300 (near free tier limit) |
| Cloudflare R2 | ₹0 (within 10GB free) |
| Firebase Auth | ₹0 |
| OpenAI | ₹350 |
| Domain | ₹40 |
| **Total** | **~₹1,200/mo** |
| **Revenue** | **₹24,950/mo** |

### 200 doctors (~₹4,600/mo):

| Service | Cost |
|---|---|
| Vercel Pro | ₹1,600 |
| Neon Launch plan | ₹1,500 |
| Cloudflare R2 | ₹50 |
| Firebase Auth | ₹0 |
| OpenAI | ₹1,400 |
| Domain | ₹40 |
| **Total** | **~₹4,600/mo** |
| **Revenue** | **₹99,800/mo** |

### 500 doctors (~₹9,800/mo):

| Service | Cost |
|---|---|
| Vercel Pro | ₹1,600 |
| Neon Scale plan | ₹3,500 |
| Cloudflare R2 | ₹175 |
| Firebase Auth | ₹1,000 |
| OpenAI | ₹3,500 |
| Domain | ₹40 |
| **Total** | **~₹9,800/mo** |
| **Revenue** | **₹2,49,500/mo** |

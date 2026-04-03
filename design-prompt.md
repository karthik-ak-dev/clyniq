# ClinicPilot — UI/UX Design Prompt

## Product
AI-powered clinic management SaaS for private doctors in small-town India (Tier 2/3 cities). Doctors use this to manage appointments, patient records, and consultations. Patients use a public booking page to book and fill a health questionnaire.

## Design Philosophy
- **Premium but simple** — Think Linear, Notion, or Cal.com. Clean, modern, confidence-inspiring. NOT cluttered like Practo or ClinaNG.
- **Mobile-first** — 80% of doctors will use this on their phone between patients. Every screen must work beautifully on a 6-inch screen.
- **Minimal cognitive load** — Doctors have 30 seconds per patient. Zero learning curve. Everything obvious at a glance.
- **Trust-building** — Patients see the public booking page first. It should feel like a premium clinic, not a government hospital website.

## Visual Direction
- **Color palette:** A calm, medical-professional palette. Primary: deep blue or teal (trust, professionalism). Accent: warm green (health, growth). Background: soft off-white/light gray. Avoid harsh whites. Subtle gradients allowed.
- **Typography:** Clean sans-serif. Inter or similar. Large readable text — doctors are 35-55 years old, often using phones in dim clinic lighting.
- **Spacing:** Generous whitespace. No cramming. Let elements breathe.
- **Cards & containers:** Soft rounded corners (12-16px), subtle shadows, slight border. Glass-morphism subtle, not overdone.
- **Animations:** Smooth micro-interactions. Page transitions, button hover states, loading skeletons, slide-in modals. Nothing jarring — everything should feel fluid and polished.
- **Icons:** Lucide or similar clean line icons. Consistent stroke width.

## Screens to Design (11 total)

### Screen 1: Marketing Landing Page
URL: `clinicpilot.in`
- Hero: Bold tagline ("Your clinic, simplified."), subtitle explaining the product, "Start Free Trial" CTA button
- Features section: 4-5 cards with icons — Appointment Booking, Patient Records, AI Summaries, Digital Prescriptions, Public Booking Page
- Pricing: Simple card — Free 30 days → ₹499/month. "Everything included."
- Social proof placeholder: "Trusted by 50+ doctors across Tamil Nadu"
- Footer: Contact email, WhatsApp, simple links
- **Vibe:** Premium SaaS landing page. Think Linear.app or Cal.com. Not a hospital website.

### Screen 2: Doctor Login
- Centered card on clean background
- Phone number input with +91 prefix
- "Send OTP" primary button
- After OTP sent: 6-digit OTP input with auto-focus between digits
- "Verify" button
- Resend OTP timer (30s countdown)
- Logo at top of card
- **Vibe:** Clean, fast, trustworthy. Like PhonePe or Google login.

### Screen 3: Doctor Onboarding (Multi-step)
- Progress bar/stepper at top showing 4 steps
- Step 1 — Personal: Name, photo upload (circular preview), specialization dropdown, qualifications, years of experience
- Step 2 — Clinic: Clinic name, address (textarea), clinic phone
- Step 3 — Fees: Consultation fee (₹ input), deposit amount (₹ input), with helper text
- Step 4 — Schedule: 7-day grid. Each day: toggle on/off, start time, end time, slot duration (15/20/30 min). Support morning + evening sessions.
- Back/Next buttons at bottom
- **Vibe:** Smooth multi-step wizard. Like Stripe onboarding or Calendly setup.

### Screen 4: Doctor's Public Booking Page
URL: `clinicpilot.in/dr-rajesh-sharma`
- Doctor photo (large, circular), name, qualifications, specialization, experience years
- Clinic card: name, address, phone, Google Maps link
- Consultation fee displayed prominently: "₹300 per consultation"
- Date picker (calendar widget — current week + next 2 weeks)
- Available time slots as pill/chip buttons in a grid (e.g., "10:00 AM", "10:30 AM")
- Selected slot highlighted
- "Book Appointment — Pay ₹50 deposit" CTA button
- **Vibe:** Cal.com booking page. Clean, professional, builds patient trust.

### Screen 5: Booking Flow (Single page, stepped)
All steps on same page — no page navigation, smooth transitions:
- Step 1: Date + slot selection (from screen 4)
- Step 2: Patient details — name, phone, age, gender
- Step 3: OTP verification (inline, not a new page)
- Step 4: Razorpay payment (opens Razorpay checkout overlay)
- Step 5: Post-payment questionnaire — chief complaint, duration dropdown, severity slider (1-10), existing conditions checkboxes (Diabetes, BP, Heart, Thyroid, Asthma, None, Other), medications, allergies, surgeries. "Submit" and "Skip" buttons.
- Step 6: Confirmation — green checkmark animation, appointment details, fee breakdown ("₹50 paid, ₹250 at clinic")
- **Vibe:** Smooth single-page flow. Like ordering on Swiggy — step by step, never lost.

### Screen 6: Doctor Dashboard
- Header: "Good morning, Dr. Sharma" + date
- Quick stats row: 2-3 cards (Today's appointments count, Total patients, Pre-visit forms filled)
- Search bar: "Search patients by name or phone..." with dropdown results
- Today's appointments list:
  - Each card: Time (bold), patient name, chief complaint preview, badge ("Pre-visit filled" green / "Not filled" gray)
  - Status indicator: booked (blue), completed (green), cancelled (red)
  - Tap → goes to patient profile
- Empty state: illustration + "No appointments today"
- **Vibe:** Clean dashboard like Notion or Linear. Information-dense but not cluttered.

### Screen 7: Patient Profile
- Patient header: name, phone, age, gender, blood group
- AI Summary card (highlighted, distinct background): Pre-visit AI summary with sections for complaint, history, medications, allergies, red flags
- "Add Today's Visit" prominent button
- Visit history: timeline/list of past visits (newest first). Each: date, complaint, diagnosis, key prescriptions
- Documents section: grid of uploaded reports/scans with thumbnails
- **Vibe:** Medical record that feels modern. Clean sections, scannable.

### Screen 8: Add Visit Record
- Form with clear sections separated by subtle dividers:
  - Complaint (pre-filled from questionnaire if available)
  - Diagnosis text field
  - Vitals row: BP, Temp, Weight, Pulse — compact horizontal layout
  - Prescription table: rows with medicine name, dosage, frequency (OD/BD/TID dropdown), duration, instructions. "Add medicine" button.
  - Investigations text
  - Notes text
  - Follow-up date picker
  - Upload document button
- Save button (sticky at bottom on mobile)
- **Vibe:** Digital form that's faster than writing on paper. Tab-friendly, fast input.

### Screen 9: Doctor Settings
- Sectioned page with expandable/collapsible cards:
  - Profile (photo, name, qualifications, specialization, experience)
  - Clinic Details (name, address, phone)
  - Schedule (day-wise grid, same as onboarding step 4)
  - Fees (consultation fee, deposit)
- Edit button per section → inline editing → Save
- **Vibe:** Clean settings page like Stripe Dashboard settings.

### Screen 10: Billing / Subscription
- Current plan card:
  - Trial: "Free Trial — 12 days remaining" with progress bar + "Subscribe Now" button
  - Active: "Pro Plan — ₹499/month" + next billing date + "Cancel" link
  - Expired: "Subscription Expired" warning + "Resubscribe" button
- Plan details: what's included (bullet list)
- **Vibe:** Simple, clear billing page. Like any modern SaaS billing screen.

### Screen 11: Dashboard Sidebar / Navigation
- Logo at top
- Nav items with icons: Dashboard, Patients, Settings, Billing
- Active item highlighted
- Doctor name + avatar at bottom
- Collapses to bottom tab bar on mobile (Dashboard, Patients, Settings, More)
- **Vibe:** Clean sidebar like Linear or Notion. Minimal, functional.

## Responsive Behavior
- **Mobile (< 640px):** Bottom tab navigation, full-width cards, stacked layouts, large touch targets (min 44px)
- **Tablet (640-1024px):** Compact sidebar, 2-column grids where appropriate
- **Desktop (> 1024px):** Full sidebar, spacious layouts, side-by-side panels

## Interaction Details
- **Loading states:** Skeleton screens (not spinners) for data-heavy screens
- **Empty states:** Friendly illustration + helpful text + CTA
- **Error states:** Inline red text under fields, toast notifications for API errors
- **Success states:** Green toast/notification, subtle checkmark animations
- **Transitions:** Smooth fade/slide between steps, 200-300ms duration
- **Hover:** Subtle lift/shadow on cards, color shift on buttons

## What This Is NOT
- NOT a government/hospital portal — no blue-gray boring UI
- NOT Practo — no information overload, no tiny text, no 50 buttons on one screen
- NOT a template — should feel custom-built and premium
- NOT over-designed — substance over decoration. Every element earns its place.

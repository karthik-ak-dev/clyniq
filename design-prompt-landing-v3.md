# ClinicPilot Landing Page — V3 Design Prompt

## CRITICAL CONTEXT
The previous two attempts looked like generic AI-generated SaaS templates. I need something that looks HAND-CRAFTED by a top design agency. Think a $50,000 custom website, not a $0 template. Every section must have a unique layout — NO repeating card grids, NO generic icon+title+description blocks.

## The Problem With Previous Designs
- Every section uses the same "heading + subheading + 3 cards" pattern. Boring.
- Stock dashboard screenshots that look fake
- Generic gradient hero that every AI tool generates
- Feature sections are just icon + title + paragraph repeated 3-4 times
- No visual storytelling, no personality, no memorable moments
- Looks like it was built in 10 minutes. Doctors won't trust it with their practice.

## What Makes a Landing Page Premium
Look at these specific design patterns (study them carefully):
- **Apple product pages** — massive product shots, theatrical reveals on scroll, text that appears word-by-word
- **Stripe.com** — the code/product previews are interactive and animated, not static screenshots
- **Arc browser site** — unique section shapes, asymmetric layouts, personality in every corner
- **Raycast.com** — dark theme, glowing elements, product screenshots that feel alive
- **Superlist.com** — bold typography mixing weights and sizes dramatically

## Design Rules (FOLLOW STRICTLY)

### Rule 1: No Two Sections Should Have the Same Layout
Each of the 8-10 sections must have a visually DIFFERENT structure. Mix these:
- Full-bleed image/video with overlaid text
- Asymmetric two-column (60/40 or 70/30, NOT 50/50)
- Horizontal scrolling carousel
- Bento grid (mixed size cards like Apple's feature grids)
- Sticky scroll section (content changes while scrolling, sidebar stays fixed)
- Full-screen takeover section
- Diagonal or curved section dividers (not straight horizontal lines)

### Rule 2: Show the Real Product, Not Descriptions
Every feature mention must have a REAL, detailed UI mockup — not an icon and paragraph. Show:
- Actual appointment cards with real Indian names (Dr. Priya Krishnan, Rajesh Kumar, Lakshmi Devi)
- Real prescription data (Amlodipine 5mg OD, Metformin 500mg BD)
- Real vitals (BP: 130/80, Temp: 98.6°F)
- Real AI summary text
- Real booking page with Tamil Nadu clinic addresses

### Rule 3: Typography Must Be Dramatic
- Hero headline: 80-120px, variable font weight animation or gradient fill
- Section headlines: 48-64px, mix of bold and light weights in same line (e.g., "Smart booking." in bold + "Zero effort." in light)
- NO headline should be smaller than 36px
- Use letter-spacing: -0.03em on headlines for that premium compressed feel
- Body text: 18-20px, generous line-height (1.6-1.8)

### Rule 4: Dark Mode Dominant
- Primary background: near-black (#09090B) or very dark navy (#0C1222)
- Cards/containers: slightly lighter (#141414 or #1A1A2E) with subtle border (#222)
- Primary accent: vibrant teal/cyan (#06B6D4 or #14B8A6) — use sparingly for CTAs and highlights
- Secondary accent: soft purple (#8B5CF6) or warm amber (#F59E0B) for variety
- Text: white (#F8FAFC) for headlines, muted (#94A3B8) for body
- Glowing effects: teal glow behind CTAs, subtle radial gradients on section backgrounds
- WHY DARK: it's premium (Apple, Linear, Raycast all use dark). Light mode feels like a hospital form.

### Rule 5: Micro-interactions Everywhere
Describe animation behavior for EACH element:
- Buttons: scale up 1.02 on hover + glow spread increases
- Cards: subtle tilt/parallax on mouse move (3D perspective)
- Section transitions: elements stagger-animate in (first headline, then subtext, then visual — 100ms delays)
- Numbers: count up from 0 when scrolled into view
- Product mockups: slight floating animation (translateY oscillating ±8px)
- Scroll indicator: pulsing chevron at bottom of hero

## EXACT SECTIONS (in order)

### 1. HERO — Full Viewport, Cinematic
- Background: dark with animated mesh gradient (teal + purple + dark blue blobs slowly morphing) — like https://whatamesh.vercel.app/
- Top nav: transparent, logo left, minimal links (Features, Pricing, Login), "Get Started" pill button with glow
- Center content:
  - Small pill badge: "AI-Powered Clinic Management" with subtle border animation
  - Headline (massive, 80-100px): "Run your clinic like it's 2025" — with gradient text fill (teal to white)
  - Subheadline (20px, muted): "Appointments. Records. Prescriptions. AI summaries. One app. Under ₹500/month."
  - Two buttons: "Start Free Trial" (filled teal, glow) + "Watch Demo" (ghost/outline)
  - Small trust text: "Free 30 days · No credit card · 2 minute setup"
- Below: large 3D-perspective product mockup of the dashboard, floating with shadow, slightly rotated. NOT flat. Use browser-frame or phone-frame mockup.
- Scroll indicator: animated chevron

### 2. SOCIAL PROOF BAR — Minimal, Credible
- Slim horizontal section, slightly lighter than hero
- "Trusted by doctors across Tamil Nadu" in small muted text
- Instead of logos: show city names with subtle pin icons: "Salem · Trichy · Madurai · Coimbatore · Erode · Vellore"
- Or: "50+ doctors · 2,000+ appointments booked · 4.9/5 rating"
- Keep it ONE line, understated. Trust comes from understatement, not shouting.

### 3. PROBLEM SECTION — Emotional Hook
- Two-column asymmetric layout (40% text left, 60% visual right)
- Headline: "Still running your clinic on paper and WhatsApp?"
- Three pain points as short lines with red/orange X icons:
  - "Patient called — you can't find their last prescription"
  - "Double-booked because you forgot to update the register"  
  - "Spent 20 minutes writing what could take 20 seconds"
- Right side: stylized dark illustration or photo collage of messy paper registers, WhatsApp chats, handwritten prescriptions — made to look chaotic and old. Desaturated, slightly blurred.
- Subtle diagonal divider into next section

### 4. PRODUCT SHOWCASE — Bento Grid (Main Feature Section)
- Headline: "Everything your clinic needs. Nothing it doesn't."
- **Bento grid layout** (like Apple's iPhone feature page): mixed-size cards
  - LARGE card (spans 2 columns): "Smart Booking Page" — shows full mockup of the public booking page with real doctor details, slot grid, patient form. Animated: slots filling in one by one.
  - MEDIUM card: "AI Summaries" — shows the AI summary card with actual medical text. Glowing AI icon. "Powered by AI" badge.
  - MEDIUM card: "Digital Records" — shows patient timeline with 3 visit entries, expandable
  - SMALL card: "One-tap Prescriptions" — shows prescription table UI
  - SMALL card: "Razorpay Payments" — shows deposit payment confirmation
  - SMALL card: "Works on Phone" — phone mockup showing mobile dashboard
- Each card has dark background, subtle border, inner glow on hover
- Product mockups inside cards should be DETAILED — not wireframes, full-fidelity UI

### 5. FEATURE DEEP-DIVE — Sticky Scroll
- Left side: sticky panel that stays fixed while right side scrolls
- Sticky left shows a phone/laptop mockup that CHANGES its screen content as user scrolls
- Right side: 3-4 feature blocks that trigger the left side to update:
  - Block 1: "Patients book online" → left shows booking page
  - Block 2: "AI prepares you" → left shows AI summary
  - Block 3: "You focus on care" → left shows visit record form
  - Block 4: "Everything saved forever" → left shows patient history
- Each block: headline + 2-3 sentence description + small detail list
- Active block highlighted, others dimmed

### 6. IMPACT NUMBERS — Full-Width Dark Strip
- Dark background with subtle grid/dot pattern
- Four numbers in a row, large (64-80px), with labels below:
  - "30s" — "Average time to record a visit"
  - "1 hr" — "Saved per day vs paper"  
  - "₹499" — "Per month. Less than one patient's fee."
  - "2 min" — "Setup time. Seriously."
- Numbers animate: count-up from 0 when scrolled into view
- Subtle teal glow behind each number

### 7. TESTIMONIALS — Not Cards, Make It Real
- Large section, dark background
- One testimonial at a time, LARGE format (not tiny cards):
  - Huge quotation mark graphic (teal, semi-transparent)
  - Quote in large text (28-32px, italic or light weight)
  - Doctor photo (circular, 80px), name, specialization, city
  - Example: "I used to carry 3 registers to my clinic every day. Now I carry my phone. My patients think I upgraded to a corporate hospital." — Dr. Priya K, General Physician, Salem
- Navigation: dots or arrows to cycle between 3 testimonials
- Or: horizontal scroll carousel

### 8. PRICING — Single Plan, Maximum Clarity
- Headline: "One plan. Everything included."
- Single large pricing card, centered, with subtle glow border:
  - "Launch Price" badge (teal)
  - "₹499" large + "/month" small
  - Comparison line: "That's ₹16/day — less than a cup of chai"
  - Feature list (8-10 items) with animated checkmarks:
    - Unlimited appointments
    - Unlimited patient records
    - AI pre-visit summaries
    - Public booking page
    - Razorpay payment collection
    - Digital prescriptions
    - Document storage
    - Phone + email support
  - "Start 30-Day Free Trial" CTA (large, full-width of card, teal, glowing)
  - "No credit card required" below
- Small note: "Need custom features for your multi-doctor clinic? Contact us."

### 9. FINAL CTA — Full-Width Takeover
- Full viewport height, dark with animated gradient (same as hero vibe)
- Large text: "Your patients are already digital. Your clinic should be too."
- Inline signup: Phone number input + "Get Started" button — right on the page
- Or: large "Start Free Trial" button + "Questions? WhatsApp us" link
- Floating mockups of the app in background, blurred/dimmed

### 10. FOOTER — Clean, Minimal
- Dark background, 4 columns
- Logo + one-line description
- Product links: Features, Pricing, Demo
- Support: WhatsApp, Email, Help Center
- Legal: Privacy Policy, Terms of Service
- Bottom bar: "© 2025 ClinicPilot. Built for Bharat." + social icons

## Mobile-Specific Rules
- Hero headline drops to 40-48px
- Bento grid becomes single column stacked
- Sticky scroll section becomes regular scrolling sections
- Bottom CTA becomes sticky bottom bar with "Start Free Trial"
- Navigation becomes hamburger menu
- Touch targets minimum 48px
- No hover effects — tap/press effects instead

## Final Checklist (AI Must Follow)
- [ ] NO section uses a simple "3 cards in a row" layout
- [ ] EVERY feature mention has a real product UI mockup, not an icon
- [ ] Hero has animated/gradient background, not flat color
- [ ] Dark mode throughout (NOT white/light theme)
- [ ] Product mockups use realistic Indian data (names, addresses, medicines)
- [ ] At least 2 sections have non-rectangular dividers (diagonal, curved, or overlapping)
- [ ] Typography uses dramatic size contrast (80px headlines near 16px body)
- [ ] CTA buttons have glow/hover effects described
- [ ] At least one section uses sticky/scroll-triggered layout
- [ ] Testimonials feel real — specific doctor names, cities, specializations

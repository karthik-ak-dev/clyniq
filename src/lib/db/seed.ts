/**
 * ─── Demo Seed ────────────────────────────────────────────
 * Seeds a complete demo dataset for showcasing DoctorRx.
 *
 * Creates:
 *   - 1 doctor (Dr. Priya Sharma)
 *   - 10 patients with varied conditions, profiles, and activity levels
 *   - Check-in data ranging from 0 days to 2 months
 *   - Visit records for patients with longer histories
 *
 * Run: npx tsx src/lib/db/seed-demo.ts
 *
 * DESTRUCTIVE: Deletes all existing data before seeding.
 * Only for dev/staging environments.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import {
  trackingTemplates,
  doctors,
  patients,
  doctorPatients,
  checkIns,
  visits,
  reminderConfigs,
} from "./schema";
import type { TemplateQuestion } from "./schema";

// ─── Environment Setup ────────────────────────────────────

const envFile =
  process.env.ENV === "production"
    ? ".env.production"
    : process.env.ENV === "staging"
      ? ".env.staging"
      : ".env.local";

dotenv.config({ path: envFile });

if (process.env.NODE_ENV === "production") {
  console.error("Cannot run demo seed in production!");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ─── Template Definitions ─────────────────────────────────

const DIABETES_QUESTIONS: TemplateQuestion[] = [
  { key: "took_meds", label: "Did you take your medicine today?", type: "yes_no", order: 1 },
  { key: "insulin_taken", label: "Did you take your insulin?", type: "yes_no", order: 2 },
  { key: "insulin_time", label: "What time did you take your insulin?", type: "time", order: 3 },
  { key: "followed_diet", label: "How was your diet today?", type: "choice", options: ["Perfect", "Good", "Okay", "Poor"], order: 4 },
  { key: "did_activity", label: "Did you exercise today?", type: "yes_no", order: 5 },
  { key: "water_intake", label: "Did you drink enough water today?", type: "yes_no", order: 6 },
  { key: "blood_sugar", label: "What was your fasting blood sugar?", type: "number", unit: "mg/dL", order: 7 },
  { key: "blood_sugar_monitored", label: "Did you monitor your blood sugar today?", type: "yes_no", order: 8 },
  { key: "blood_pressure", label: "What was your blood pressure?", type: "bp", order: 9 },
  { key: "weight", label: "What's your current weight?", type: "number", unit: "kg", order: 10 },
  { key: "sleep_quality", label: "How was your sleep last night?", type: "choice", options: ["Great", "Good", "Okay", "Poor", "Awful"], order: 11 },
  { key: "stress_level", label: "How are you feeling today?", type: "choice", options: ["Great", "Good", "Okay", "Bad", "Awful"], order: 12 },
  { key: "symptoms", label: "Any symptoms today?", type: "multi_choice", options: ["Dizziness", "Fatigue", "Blurred Vision", "Numbness", "Excessive Thirst", "None"], order: 13 },
  { key: "foot_issues", label: "Any foot issues today?", type: "text", order: 14 },
  { key: "alcohol", label: "Did you consume alcohol today?", type: "yes_no", order: 15 },
  { key: "foot_check", label: "Did you check your feet today?", type: "yes_no", order: 16 },
];

const OBESITY_QUESTIONS: TemplateQuestion[] = [
  { key: "followed_diet", label: "How was your diet today?", type: "choice", options: ["Perfect", "Good", "Okay", "Poor"], order: 1 },
  { key: "did_activity", label: "Did you exercise today?", type: "yes_no", order: 2 },
  { key: "water_intake", label: "Did you drink enough water today?", type: "yes_no", order: 3 },
  { key: "meal_portions", label: "Did you control your meal portions?", type: "yes_no", order: 4 },
  { key: "snacking", label: "Did you avoid unhealthy snacking?", type: "yes_no", order: 5 },
  { key: "sugary_drinks", label: "Did you avoid sugary drinks today?", type: "yes_no", order: 6 },
  { key: "meal_count", label: "How many meals did you eat today?", type: "number", unit: "meals", order: 7 },
  { key: "weight", label: "What's your current weight?", type: "number", unit: "kg", order: 8 },
  { key: "steps", label: "How many steps did you walk today?", type: "number", unit: "steps", order: 9 },
  { key: "blood_pressure", label: "What was your blood pressure?", type: "bp", order: 10 },
  { key: "sleep_quality", label: "How was your sleep last night?", type: "choice", options: ["Great", "Good", "Okay", "Poor", "Awful"], order: 11 },
  { key: "stress_level", label: "How are you feeling today?", type: "choice", options: ["Great", "Good", "Okay", "Bad", "Awful"], order: 12 },
  { key: "emotional_eating", label: "Did you eat due to stress or emotions?", type: "yes_no", order: 13 },
];

// ─── Patient Profiles ─────────────────────────────────────

type PatientProfile = {
  name: string;
  phone: string;
  condition: "diabetes" | "obesity";
  gender: "male" | "female";
  dateOfBirth: string;
  email: string | null;
  bloodType: string | null;
  allergies: string | null;
  currentMedications: string | null;
  preExistingConditions: string | null;
  status: "active" | "new" | "inactive";
  enabledKeys: string[]; // subset of template keys to enable
  daysOfCheckins: number; // 0 = no check-ins
  complianceTrend: "improving" | "stable" | "declining" | "poor";
  visitCount: number;
  joinedDaysAgo: number;
};

const PATIENTS: PatientProfile[] = [
  // ── 1. Star patient — 2 months, diabetes, improving ──────
  {
    name: "Ravi Kumar",
    phone: "+919876543210",
    condition: "diabetes",
    gender: "male",
    dateOfBirth: "1978-03-15",
    email: "ravi.kumar@gmail.com",
    bloodType: "B+",
    allergies: null,
    currentMedications: "Metformin 500mg twice daily, Glimepiride 0.5mg",
    preExistingConditions: "Hypertension",
    status: "active",
    enabledKeys: ["took_meds", "insulin_taken", "insulin_time", "followed_diet", "did_activity", "water_intake", "blood_sugar", "blood_sugar_monitored", "blood_pressure", "weight", "sleep_quality", "stress_level", "symptoms", "foot_issues", "alcohol", "foot_check"],
    daysOfCheckins: 60,
    complianceTrend: "improving",
    visitCount: 4,
    joinedDaysAgo: 65,
  },
  // ── 2. Good compliance — 1.5 months, obesity, stable ─────
  {
    name: "Anita Desai",
    phone: "+919876543211",
    condition: "obesity",
    gender: "female",
    dateOfBirth: "1985-07-22",
    email: "anita.desai@yahoo.com",
    bloodType: "O+",
    allergies: "Peanuts",
    currentMedications: "Orlistat 120mg",
    preExistingConditions: "PCOS",
    status: "active",
    enabledKeys: ["followed_diet", "did_activity", "water_intake", "meal_portions", "snacking", "sugary_drinks", "weight", "steps", "sleep_quality", "stress_level", "emotional_eating"],
    daysOfCheckins: 45,
    complianceTrend: "stable",
    visitCount: 3,
    joinedDaysAgo: 50,
  },
  // ── 3. Struggling — 2 months, diabetes, declining ────────
  {
    name: "Suresh Patel",
    phone: "+919876543212",
    condition: "diabetes",
    gender: "male",
    dateOfBirth: "1962-11-03",
    email: null,
    bloodType: "A+",
    allergies: "Sulfa drugs",
    currentMedications: "Insulin Glargine 20u, Metformin 1000mg",
    preExistingConditions: "Neuropathy, Retinopathy",
    status: "active",
    enabledKeys: ["took_meds", "insulin_taken", "insulin_time", "followed_diet", "did_activity", "blood_sugar", "blood_sugar_monitored", "weight", "sleep_quality", "symptoms", "alcohol", "foot_check"],
    daysOfCheckins: 55,
    complianceTrend: "declining",
    visitCount: 3,
    joinedDaysAgo: 60,
  },
  // ── 4. New patient — 2 weeks, obesity, too early to tell ─
  {
    name: "Meera Iyer",
    phone: "+919876543213",
    condition: "obesity",
    gender: "female",
    dateOfBirth: "1992-01-18",
    email: "meera.iyer@gmail.com",
    bloodType: "AB+",
    allergies: null,
    currentMedications: null,
    preExistingConditions: "Hypothyroidism",
    status: "active",
    enabledKeys: ["followed_diet", "did_activity", "water_intake", "meal_portions", "snacking", "weight", "steps", "sleep_quality"],
    daysOfCheckins: 14,
    complianceTrend: "improving",
    visitCount: 1,
    joinedDaysAgo: 16,
  },
  // ── 5. Very consistent — 2 months, diabetes, stable high ─
  {
    name: "Guru Prasad",
    phone: "+919888888888",
    condition: "diabetes",
    gender: "male",
    dateOfBirth: "1975-06-30",
    email: "guru@gmail.com",
    bloodType: "B+",
    allergies: null,
    currentMedications: "Metformin 500mg twice daily",
    preExistingConditions: null,
    status: "active",
    enabledKeys: ["took_meds", "insulin_taken", "insulin_time", "followed_diet", "did_activity", "water_intake", "blood_sugar", "blood_sugar_monitored", "blood_pressure", "weight", "sleep_quality", "stress_level", "symptoms", "alcohol", "foot_check"],
    daysOfCheckins: 58,
    complianceTrend: "stable",
    visitCount: 4,
    joinedDaysAgo: 62,
  },
  // ── 6. Sporadic — 1 month, obesity, poor ─────────────────
  {
    name: "Priya Nair",
    phone: "+919876543215",
    condition: "obesity",
    gender: "female",
    dateOfBirth: "1990-04-12",
    email: null,
    bloodType: "O-",
    allergies: null,
    currentMedications: null,
    preExistingConditions: null,
    status: "active",
    enabledKeys: ["followed_diet", "did_activity", "water_intake", "meal_portions", "snacking", "sugary_drinks", "weight", "steps", "sleep_quality", "emotional_eating"],
    daysOfCheckins: 30,
    complianceTrend: "poor",
    visitCount: 2,
    joinedDaysAgo: 35,
  },
  // ── 7. Just joined — 3 days, diabetes, brand new ─────────
  {
    name: "Arvind Rao",
    phone: "+919876543216",
    condition: "diabetes",
    gender: "male",
    dateOfBirth: "1988-09-25",
    email: "arvind.rao@outlook.com",
    bloodType: "A-",
    allergies: null,
    currentMedications: "Metformin 500mg",
    preExistingConditions: null,
    status: "new",
    enabledKeys: ["took_meds", "followed_diet", "did_activity", "water_intake", "blood_sugar", "weight", "sleep_quality", "stress_level"],
    daysOfCheckins: 3,
    complianceTrend: "stable",
    visitCount: 1,
    joinedDaysAgo: 4,
  },
  // ── 8. Zero records — just registered, no check-ins ──────
  {
    name: "Kavitha Reddy",
    phone: "+919876543217",
    condition: "obesity",
    gender: "female",
    dateOfBirth: "1995-12-08",
    email: "kavitha.r@gmail.com",
    bloodType: "B-",
    allergies: "Lactose intolerant",
    currentMedications: null,
    preExistingConditions: null,
    status: "new",
    enabledKeys: ["followed_diet", "did_activity", "water_intake", "meal_portions", "snacking", "sugary_drinks", "weight", "steps", "sleep_quality", "stress_level", "emotional_eating"],
    daysOfCheckins: 0,
    complianceTrend: "stable",
    visitCount: 0,
    joinedDaysAgo: 2,
  },
  // ── 9. Inactive — was active 1 month, stopped ────────────
  {
    name: "Mohan Das",
    phone: "+919876543218",
    condition: "diabetes",
    gender: "male",
    dateOfBirth: "1970-02-14",
    email: null,
    bloodType: "O+",
    allergies: "Penicillin",
    currentMedications: "Insulin Lispro, Metformin 1000mg, Atorvastatin",
    preExistingConditions: "Heart disease, Hypertension",
    status: "inactive",
    enabledKeys: ["took_meds", "insulin_taken", "followed_diet", "did_activity", "blood_sugar", "blood_pressure", "weight", "sleep_quality", "symptoms"],
    daysOfCheckins: 25,
    complianceTrend: "declining",
    visitCount: 2,
    joinedDaysAgo: 50,
  },
  // ── 10. Moderate — 3 weeks, obesity, slowly improving ────
  {
    name: "Lakshmi Venkat",
    phone: "+919876543219",
    condition: "obesity",
    gender: "female",
    dateOfBirth: "1983-08-19",
    email: "lakshmi.v@gmail.com",
    bloodType: "AB-",
    allergies: null,
    currentMedications: "Phentermine 15mg",
    preExistingConditions: "Pre-diabetes",
    status: "active",
    enabledKeys: ["followed_diet", "did_activity", "water_intake", "meal_portions", "snacking", "sugary_drinks", "meal_count", "weight", "steps", "blood_pressure", "sleep_quality", "stress_level", "emotional_eating"],
    daysOfCheckins: 21,
    complianceTrend: "improving",
    visitCount: 2,
    joinedDaysAgo: 24,
  },
];

// ─── Response Generators ──────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickChoice(options: string[], quality: number): string {
  // quality 0-1, higher = pick better options (earlier in array)
  const idx = Math.min(
    Math.floor((1 - quality) * options.length + Math.random() * 1.5),
    options.length - 1
  );
  return options[Math.max(0, idx)];
}

function generateResponse(
  q: TemplateQuestion,
  dayQuality: number // 0-1, higher = better day
): boolean | number | string | string[] {
  switch (q.type) {
    case "yes_no": {
      // Good questions (meds, activity): higher quality = more likely true
      // Bad questions (alcohol, emotional eating): higher quality = more likely false
      const isBadHabit = ["alcohol", "emotional_eating"].includes(q.key);
      const threshold = isBadHabit ? 1 - dayQuality * 0.8 : dayQuality * 0.85;
      return Math.random() < threshold;
    }
    case "choice":
      return pickChoice(q.options!, dayQuality);
    case "multi_choice": {
      if (dayQuality > 0.7) return ["None"];
      const symptoms = (q.options || []).filter((o) => o !== "None");
      const count = Math.max(1, Math.floor((1 - dayQuality) * 3));
      const shuffled = [...symptoms].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }
    case "number": {
      if (q.key === "blood_sugar") return rand(80, 200 - Math.floor(dayQuality * 60));
      if (q.key === "weight") return Math.round((65 + Math.random() * 30) * 10) / 10;
      if (q.key === "steps") return rand(1000, 3000 + Math.floor(dayQuality * 8000));
      if (q.key === "meal_count") return rand(2, 4);
      return rand(50, 150);
    }
    case "time": {
      const hour = rand(6, 10);
      const min = rand(0, 11) * 5;
      return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
    }
    case "bp": {
      const sys = rand(110, 145 - Math.floor(dayQuality * 15));
      const dia = rand(70, 95 - Math.floor(dayQuality * 10));
      return `${sys}/${dia}`;
    }
    case "text":
      return dayQuality > 0.6 ? "" : "Mild discomfort";
    case "scale":
      return Math.min(10, Math.max(1, Math.round(dayQuality * 8 + Math.random() * 2)));
    default:
      return "";
  }
}

function getDayQuality(
  dayIndex: number,
  totalDays: number,
  trend: PatientProfile["complianceTrend"]
): number {
  const progress = dayIndex / Math.max(totalDays - 1, 1); // 0 to 1
  const noise = (Math.random() - 0.5) * 0.3;

  switch (trend) {
    case "improving":
      return Math.min(1, Math.max(0, 0.35 + progress * 0.45 + noise));
    case "stable":
      return Math.min(1, Math.max(0, 0.6 + noise));
    case "declining":
      return Math.min(1, Math.max(0, 0.7 - progress * 0.4 + noise));
    case "poor":
      return Math.min(1, Math.max(0, 0.25 + noise));
  }
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ─── Visit Generator ──────────────────────────────────────

type VisitType = "initial" | "checkup" | "followup" | "emergency";

function generateVisits(
  doctorPatientId: string,
  count: number,
  joinedDaysAgo: number,
  condition: string
): {
  doctorPatientId: string;
  visitDate: string;
  visitType: VisitType;
  diagnosis: string | null;
  notes: string | null;
  prescription: string | null;
  vitals: Record<string, unknown> | null;
  nextVisitDate: string | null;
}[] {
  if (count === 0) return [];
  const result = [];
  const daysBetween = Math.floor(joinedDaysAgo / count);

  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() - joinedDaysAgo + i * daysBetween);
    const visitDate = toDateStr(d);
    const isFirst = i === 0;
    const isLast = i === count - 1;
    const visitType: VisitType = isFirst ? "initial" : i % 3 === 0 ? "checkup" : "followup";

    const bp = `${rand(115, 140)}/${rand(72, 90)}`;
    const weight = Math.round((65 + Math.random() * 25) * 10) / 10;
    const bloodSugar = condition === "diabetes" ? rand(90, 180) : undefined;

    const nextDate = isLast ? new Date(d.getTime() + 30 * 86400000) : undefined;

    result.push({
      doctorPatientId,
      visitDate,
      visitType,
      diagnosis: isFirst
        ? `${condition === "diabetes" ? "Type 2 Diabetes Mellitus" : "Obesity Grade II"}. Initial assessment.`
        : `Follow-up. ${condition === "diabetes" ? "Blood sugar control" : "Weight management"} review.`,
      notes: isFirst
        ? "New patient. Discussed treatment plan and compliance tracking."
        : `Compliance ${i > count / 2 ? "improving" : "needs attention"}. Discussed lifestyle modifications.`,
      prescription: isFirst
        ? condition === "diabetes"
          ? "Metformin 500mg twice daily. Monitor blood sugar fasting."
          : "Dietary plan provided. 30 min daily exercise."
        : null,
      vitals: { bp, weight, ...(bloodSugar ? { bloodSugar } : {}) },
      nextVisitDate: nextDate ? toDateStr(nextDate) : null,
    });
  }
  return result;
}

// ─── Main Seed ────────────────────────────────────────────

async function seedDemo() {
  console.log("\n🌱 DoctorRx Demo Seed\n");

  // 1. Clean existing data (order matters for FK constraints)
  console.log("Cleaning existing data...");
  await db.delete(checkIns);
  await db.delete(visits);
  await db.delete(reminderConfigs);
  await db.delete(doctorPatients);
  await db.delete(patients);
  await db.delete(doctors);
  // Keep templates — just update them
  console.log("  ✓ Cleaned\n");

  // 2. Seed templates
  console.log("Seeding templates...");
  const templateMap: Record<string, string> = {};
  for (const tmpl of [
    { condition: "diabetes" as const, name: "Diabetes Default Template", questions: DIABETES_QUESTIONS },
    { condition: "obesity" as const, name: "Obesity Default Template", questions: OBESITY_QUESTIONS },
  ]) {
    const [existing] = await db
      .select()
      .from(trackingTemplates)
      .where(and(eq(trackingTemplates.condition, tmpl.condition), eq(trackingTemplates.isDefault, true)))
      .limit(1);

    if (existing) {
      await db.update(trackingTemplates)
        .set({ name: tmpl.name, questions: tmpl.questions })
        .where(eq(trackingTemplates.id, existing.id));
      templateMap[tmpl.condition] = existing.id;
      console.log(`  ✓ ${tmpl.name} — updated`);
    } else {
      const [created] = await db.insert(trackingTemplates)
        .values({ condition: tmpl.condition, name: tmpl.name, questions: tmpl.questions, isDefault: true })
        .returning();
      templateMap[tmpl.condition] = created.id;
      console.log(`  ✓ ${tmpl.name} — created`);
    }
  }

  // 3. Seed doctor
  console.log("\nSeeding doctor...");
  const passwordHash = await bcrypt.hash("doctor123", 10);
  const [doctor] = await db.insert(doctors).values({
    name: "Dr. Priya Sharma",
    email: "doctor@hormonia.in",
    passwordHash,
  }).returning();
  console.log(`  ✓ Dr. Priya Sharma (doctor@hormonia.in / doctor123)\n`);

  // 4. Seed patients
  console.log("Seeding 10 patients...\n");
  for (const p of PATIENTS) {
    const templateId = templateMap[p.condition];
    const magicToken = crypto.randomBytes(32).toString("hex");
    const joinDate = new Date();
    joinDate.setDate(joinDate.getDate() - p.joinedDaysAgo);

    // Create patient
    const [patient] = await db.insert(patients).values({
      name: p.name,
      phone: p.phone,
      email: p.email,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender as "male" | "female" | "other",
      bloodType: p.bloodType as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null,
      allergies: p.allergies,
      currentMedications: p.currentMedications,
      preExistingConditions: p.preExistingConditions,
    }).returning();

    // Create doctor-patient link
    const [dp] = await db.insert(doctorPatients).values({
      doctorId: doctor.id,
      patientId: patient.id,
      condition: p.condition,
      templateId,
      enabledQuestions: p.enabledKeys,
      magicToken,
      status: p.status,
      createdAt: joinDate,
    }).returning();

    // Get template questions for this patient
    const [template] = await db.select().from(trackingTemplates).where(eq(trackingTemplates.id, templateId)).limit(1);
    const allQuestions = template!.questions;
    const enabledQuestions = allQuestions.filter((q) => p.enabledKeys.includes(q.key));

    // Generate check-ins
    let checkinCount = 0;
    if (p.daysOfCheckins > 0) {
      // For inactive patients, start check-ins earlier and stop 15+ days ago
      const startDaysAgo = p.status === "inactive" ? p.joinedDaysAgo : p.daysOfCheckins;
      const endDaysAgo = p.status === "inactive" ? 15 : 0;

      for (let i = 0; i < p.daysOfCheckins; i++) {
        const d = new Date();
        d.setDate(d.getDate() - startDaysAgo + i);
        const dateStr = toDateStr(d);

        if (d > new Date()) continue; // Don't seed future dates
        if (startDaysAgo - i < endDaysAgo) continue; // inactive: stop early

        // Skip some days for realism
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const skipChance = p.complianceTrend === "poor" ? 0.4 : isWeekend ? 0.3 : 0.08;
        if (Math.random() < skipChance) continue;

        const quality = getDayQuality(i, p.daysOfCheckins, p.complianceTrend);
        const responses: Record<string, boolean | number | string | string[]> = {};

        for (const q of enabledQuestions) {
          responses[q.key] = generateResponse(q, quality);
        }

        try {
          await db.insert(checkIns).values({
            doctorPatientId: dp.id,
            date: dateStr,
            responses,
          });
          checkinCount++;
        } catch {
          // Skip duplicate dates
        }
      }
    }

    // Generate visits
    const visitData = generateVisits(dp.id, p.visitCount, p.joinedDaysAgo, p.condition);
    for (const v of visitData) {
      await db.insert(visits).values(v);
    }

    const statusIcon = p.status === "active" ? "🟢" : p.status === "new" ? "🔵" : "⚪";
    console.log(`  ${statusIcon} ${p.name.padEnd(18)} ${p.condition.padEnd(10)} ${checkinCount.toString().padStart(3)} check-ins  ${p.visitCount} visits  (${p.status})`);
  }

  console.log(`\n✅ Demo seed complete!\n`);
  console.log(`  Login: doctor@hormonia.in / doctor123`);
  console.log(`  URL:   ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login\n`);

  process.exit(0);
}

seedDemo().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { trackingTemplates, doctors, patients, doctorPatients } from "./schema";
import type { TemplateQuestion } from "./schema";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

const envFile =
  process.env.ENV === "production"
    ? ".env.production"
    : process.env.ENV === "staging"
      ? ".env.staging"
      : ".env.local";

dotenv.config({ path: envFile });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ─── Default Templates ─────────────────────────────────────
// System data required for the app to function. These define what
// questions patients see during check-in. Seeded in ALL environments.

// ─── Diabetes Default Template (16 questions) ──────────────
// Comprehensive daily tracking for diabetic patients.
// Doctor can toggle any of these on/off per patient.
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

// ─── Obesity Default Template (13 questions) ────────────────
// Comprehensive daily tracking for obesity patients.
// Doctor can toggle any of these on/off per patient.
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

// ─── Seed Function ─────────────────────────────────────────
// Idempotent — safe to run multiple times.
// Strategy: check if row exists first, then insert or update.

async function seed() {
  // 1. Seed default templates (required in all environments)
  //    Check by condition + is_default, then insert or update.
  console.log("Seeding default templates...");
  for (const tmpl of [
    { condition: "diabetes" as const, name: "Diabetes Default Template", questions: DIABETES_QUESTIONS },
    { condition: "obesity" as const, name: "Obesity Default Template", questions: OBESITY_QUESTIONS },
  ]) {
    const [existing] = await db
      .select()
      .from(trackingTemplates)
      .where(
        and(
          eq(trackingTemplates.condition, tmpl.condition),
          eq(trackingTemplates.isDefault, true)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(trackingTemplates)
        .set({ name: tmpl.name, questions: tmpl.questions })
        .where(eq(trackingTemplates.id, existing.id));
      console.log(`  ✓ ${tmpl.name} — updated`);
    } else {
      await db.insert(trackingTemplates).values({
        condition: tmpl.condition,
        name: tmpl.name,
        questions: tmpl.questions,
        isDefault: true,
      });
      console.log(`  ✓ ${tmpl.name} — created`);
    }
  }

  // 2. Seed test doctor (staging/dev only — skip in production)
  //    Email: test@hormonia.in / Password: test1234
  //    Check by email, then insert or update.
  if (process.env.NODE_ENV !== "production") {
    console.log("Seeding test doctor...");
    const passwordHash = await bcrypt.hash("test1234", 10);

    const [existing] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.email, "test@hormonia.in"))
      .limit(1);

    if (existing) {
      await db
        .update(doctors)
        .set({ name: "Dr. Test Sharma", passwordHash })
        .where(eq(doctors.id, existing.id));
      console.log("  ✓ Test doctor — updated (test@hormonia.in / test1234)");
    } else {
      await db.insert(doctors).values({
        name: "Dr. Test Sharma",
        email: "test@hormonia.in",
        passwordHash,
      });
      console.log("  ✓ Test doctor — created (test@hormonia.in / test1234)");
    }
  }

  // 3. Seed test patient (staging/dev only)
  //    Creates "Ravi Kumar" linked to the test doctor with Diabetes template.
  //    Check by doctor + phone, then insert or skip.
  if (process.env.NODE_ENV !== "production") {
    console.log("Seeding test patient...");

    // Get the test doctor
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.email, "test@hormonia.in"))
      .limit(1);

    // Get the diabetes default template
    const [template] = await db
      .select()
      .from(trackingTemplates)
      .where(
        and(
          eq(trackingTemplates.condition, "diabetes"),
          eq(trackingTemplates.isDefault, true)
        )
      )
      .limit(1);

    if (doctor && template) {
      // Check if patient already linked to this doctor
      const [existingLink] = await db
        .select()
        .from(doctorPatients)
        .innerJoin(patients, eq(patients.id, doctorPatients.patientId))
        .where(
          and(
            eq(doctorPatients.doctorId, doctor.id),
            eq(patients.phone, "+919876543210")
          )
        )
        .limit(1);

      if (existingLink) {
        // Update enabled questions to match current template
        const enabledQuestions = template.questions.map((q) => q.key);
        await db
          .update(doctorPatients)
          .set({ enabledQuestions, templateId: template.id })
          .where(eq(doctorPatients.id, existingLink.doctor_patients.id));
        console.log(`  ✓ Test patient — updated (enabled ${enabledQuestions.length} questions)`);
        console.log(`  → Check-in URL: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/p/${existingLink.doctor_patients.magicToken}`);
      } else {
        // Create patient
        const [patient] = await db
          .insert(patients)
          .values({ name: "Ravi Kumar", phone: "+919876543210" })
          .returning();

        // Enable all questions from the template
        const enabledQuestions = template.questions.map((q) => q.key);

        // Generate magic token
        const magicToken = crypto.randomBytes(32).toString("hex");

        // Create doctor-patient link
        await db.insert(doctorPatients).values({
          doctorId: doctor.id,
          patientId: patient.id,
          condition: "diabetes",
          templateId: template.id,
          enabledQuestions,
          magicToken,
        });

        console.log(`  ✓ Test patient — created (Ravi Kumar, +919876543210)`);
        console.log(`  → Check-in URL: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/p/${magicToken}`);
      }
    }
  }

  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

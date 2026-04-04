import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { trackingTemplates, doctors, patients, doctorPatients } from "./schema";
import type { TemplateQuestion } from "./schema";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ─── Default Templates ─────────────────────────────────────
// System data required for the app to function. These define what
// questions patients see during check-in. Seeded in ALL environments.

const DIABETES_QUESTIONS: TemplateQuestion[] = [
  { key: "took_meds", label: "Did you take your medicine today?", type: "yes_no", order: 1 },
  { key: "followed_diet", label: "Did you follow your diet today?", type: "yes_no", order: 2 },
  { key: "did_activity", label: "Did you exercise today?", type: "yes_no", order: 3 },
  { key: "blood_sugar", label: "What was your fasting blood sugar?", type: "number", unit: "mg/dL", order: 4 },
  { key: "weight", label: "Enter your weight", type: "number", unit: "kg", order: 5 },
];

const OBESITY_QUESTIONS: TemplateQuestion[] = [
  { key: "followed_diet", label: "Did you follow your diet today?", type: "yes_no", order: 1 },
  { key: "did_activity", label: "Did you exercise today?", type: "yes_no", order: 2 },
  { key: "water_intake", label: "Did you drink enough water today?", type: "yes_no", order: 3 },
  { key: "weight", label: "Enter your weight", type: "number", unit: "kg", order: 4 },
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
  //    Email: test@clyniq.in / Password: test1234
  //    Check by email, then insert or update.
  if (process.env.NODE_ENV !== "production") {
    console.log("Seeding test doctor...");
    const passwordHash = await bcrypt.hash("test1234", 10);

    const [existing] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.email, "test@clyniq.in"))
      .limit(1);

    if (existing) {
      await db
        .update(doctors)
        .set({ name: "Dr. Test Sharma", passwordHash })
        .where(eq(doctors.id, existing.id));
      console.log("  ✓ Test doctor — updated (test@clyniq.in / test1234)");
    } else {
      await db.insert(doctors).values({
        name: "Dr. Test Sharma",
        email: "test@clyniq.in",
        passwordHash,
      });
      console.log("  ✓ Test doctor — created (test@clyniq.in / test1234)");
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
      .where(eq(doctors.email, "test@clyniq.in"))
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
        console.log(`  ✓ Test patient — already exists`);
        console.log(`  → Check-in URL: http://localhost:3000/p/${existingLink.doctor_patients.magicToken}`);
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
        console.log(`  → Check-in URL: http://localhost:3000/p/${magicToken}`);
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

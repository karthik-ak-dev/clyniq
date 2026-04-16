import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import { doctorPatients, checkIns, patients, trackingTemplates } from "./schema";
import type { TemplateQuestion } from "./schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const PATIENT_ID = "7be8c5aa-5039-459e-bed8-a16aa1effee2";

// Generate a realistic response for a question
function generateResponse(q: TemplateQuestion, dayQuality: number): boolean | number | string | string[] {
  // dayQuality: 0-1 where 1 = perfect day, 0 = bad day
  const rand = Math.random();

  switch (q.type) {
    case "yes_no":
      return rand < dayQuality * 0.9 + 0.1; // Higher quality = more likely true
    case "choice": {
      if (!q.options) return "";
      const idx = Math.min(
        Math.floor((1 - dayQuality) * q.options.length * rand * 1.5),
        q.options.length - 1
      );
      return q.options[Math.max(0, idx)];
    }
    case "multi_choice": {
      if (!q.options) return [];
      // Pick 1-3 random options, more "None" on good days
      if (dayQuality > 0.7 && rand > 0.5) return ["None"];
      const count = Math.floor(rand * 3) + 1;
      const shuffled = [...q.options].filter(o => o !== "None").sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }
    case "number": {
      if (q.key === "blood_sugar") return Math.round(90 + (1 - dayQuality) * 80 + rand * 30);
      if (q.key === "weight") return Math.round((70 + rand * 5) * 10) / 10;
      if (q.key === "steps") return Math.round(3000 + dayQuality * 7000 + rand * 2000);
      return Math.round(rand * 100);
    }
    case "scale":
      return Math.round(dayQuality * 7 + rand * 3);
    case "text":
      return dayQuality > 0.7 ? "" : "Slight discomfort";
    case "time":
      return `${7 + Math.floor(rand * 3)}:${String(Math.floor(rand * 60)).padStart(2, "0")}`;
    case "bp":
      return `${110 + Math.round((1 - dayQuality) * 30 + rand * 10)}/${70 + Math.round((1 - dayQuality) * 15 + rand * 5)}`;
    default:
      return "";
  }
}

async function seedCheckins() {
  console.log("Finding patient and template...");

  // Find the doctor_patient record
  const [dp] = await db
    .select()
    .from(doctorPatients)
    .innerJoin(patients, eq(patients.id, doctorPatients.patientId))
    .where(eq(doctorPatients.patientId, PATIENT_ID))
    .limit(1);

  if (!dp) {
    console.error("Patient not found!");
    process.exit(1);
  }

  const doctorPatient = dp.doctor_patients;
  console.log(`  Found: doctor_patient_id = ${doctorPatient.id}`);

  // Get the template
  const [template] = await db
    .select()
    .from(trackingTemplates)
    .where(eq(trackingTemplates.id, doctorPatient.templateId))
    .limit(1);

  if (!template) {
    console.error("Template not found!");
    process.exit(1);
  }

  const enabledSet = new Set(doctorPatient.enabledQuestions as string[]);
  const questions = template.questions.filter((q) => enabledSet.has(q.key));
  console.log(`  Template: ${template.name} (${questions.length} enabled questions)`);

  // Generate 60 days of check-ins (skip ~15% of days randomly for realism)
  const today = new Date();
  const inserted: string[] = [];
  const skipped: string[] = [];

  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    // Skip some days randomly (more likely to skip on weekends)
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const skipChance = isWeekend ? 0.35 : 0.1;
    if (Math.random() < skipChance && i > 0) {
      skipped.push(dateStr);
      continue;
    }

    // Generate a day quality score (simulate improving trend over time)
    const progress = (60 - i) / 60; // 0 at start, 1 at today
    const baseQuality = 0.4 + progress * 0.35; // 40% → 75% over 2 months
    const dayVariance = (Math.random() - 0.5) * 0.3;
    const dayQuality = Math.max(0.1, Math.min(1, baseQuality + dayVariance));

    // Generate responses
    const responses: Record<string, boolean | number | string | string[]> = {};
    for (const q of questions) {
      // Sometimes skip individual questions (10% chance)
      if (Math.random() > 0.9 && i > 0) continue;
      responses[q.key] = generateResponse(q, dayQuality);
    }

    // Insert (skip if already exists)
    try {
      await db.insert(checkIns).values({
        doctorPatientId: doctorPatient.id,
        date: dateStr,
        responses,
      });
      inserted.push(dateStr);
    } catch {
      // Likely duplicate — skip
      skipped.push(dateStr);
    }
  }

  console.log(`\n  ✓ Inserted ${inserted.length} check-ins`);
  console.log(`  ○ Skipped ${skipped.length} days (random gaps + duplicates)`);
  console.log(`  Date range: ${inserted[0]} → ${inserted[inserted.length - 1]}`);
  console.log("\nDone.");
  process.exit(0);
}

seedCheckins().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { doctorPatients, patients, visits } from "./schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const PATIENT_ID = "7be8c5aa-5039-459e-bed8-a16aa1effee2";

async function seedVisits() {
  console.log("Finding patient...");

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

  const dpId = dp.doctor_patients.id;
  console.log(`  Found: doctor_patient_id = ${dpId}`);

  const visitData = [
    {
      doctorPatientId: dpId,
      visitDate: "2026-02-15",
      visitType: "initial" as const,
      diagnosis: "Type 2 Diabetes Mellitus. HbA1c at 8.2%, indicating poor glycemic control. BMI 28.4 — borderline obese.",
      notes: "Patient referred by GP. History of diabetes for 3 years, poorly managed. Started on structured compliance tracking program. Explained daily check-in process and set up magic link on patient's phone.",
      prescription: "Metformin 500mg — twice daily after meals\nGlimepiride 1mg — once daily before breakfast\nMultivitamin — once daily",
      vitals: { bp: "138/88", weight: 78.5, bloodSugar: 186 },
      nextVisitDate: "2026-03-15",
    },
    {
      doctorPatientId: dpId,
      visitDate: "2026-03-15",
      visitType: "followup" as const,
      diagnosis: "Slight improvement in fasting blood sugar. HbA1c pending. Weight stable.",
      notes: "Patient has been checking in regularly (85% compliance in last 2 weeks). Diet compliance is the weakest area — discussed meal planning strategies. Patient reports occasional dizziness in the mornings, likely related to medication timing. Adjusted insulin timing.",
      prescription: "Continue Metformin 500mg twice daily\nGlimepiride 1mg — moved to evening\nAdded: Vitamin D3 60K — once weekly",
      vitals: { bp: "132/84", weight: 77.8, bloodSugar: 158 },
      nextVisitDate: "2026-04-01",
    },
    {
      doctorPatientId: dpId,
      visitDate: "2026-04-01",
      visitType: "followup" as const,
      diagnosis: "Good progress. Fasting blood sugar trending down. Dizziness resolved after medication timing change.",
      notes: "Compliance improved to 72% overall. Patient is exercising 3-4 times a week now. Blood sugar readings showing a downward trend — averaging 135 vs 165 last month. Weight down 1.2kg. Patient motivated and engaged with the tracking program.",
      prescription: "Continue current medications\nReduce Glimepiride to 0.5mg — reassess in 2 weeks",
      vitals: { bp: "128/82", weight: 76.6, bloodSugar: 138 },
      nextVisitDate: "2026-04-15",
    },
    {
      doctorPatientId: dpId,
      visitDate: "2026-04-15",
      visitType: "checkup" as const,
      diagnosis: "Steady improvement. HbA1c dropped to 7.4% from 8.2%. Target is <7%.",
      notes: "Excellent progress over 2 months. Compliance averaging 70%+ consistently. Patient reports better sleep and energy levels. Foot examination normal. Discussed importance of maintaining current routine and not getting complacent. Set target for HbA1c <7% by next quarter.",
      prescription: "Continue Metformin 500mg twice daily\nContinue Glimepiride 0.5mg\nAdded: Omega-3 supplement",
      vitals: { bp: "126/80", weight: 75.9, bloodSugar: 128 },
      nextVisitDate: "2026-05-15",
    },
  ];

  let count = 0;
  for (const v of visitData) {
    try {
      await db.insert(visits).values(v);
      count++;
      console.log(`  ✓ Visit ${v.visitDate} (${v.visitType}) — created`);
    } catch (err) {
      console.log(`  ○ Visit ${v.visitDate} — skipped (may already exist)`);
    }
  }

  console.log(`\n  ✓ Inserted ${count} visits`);
  console.log("Done.");
  process.exit(0);
}

seedVisits().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

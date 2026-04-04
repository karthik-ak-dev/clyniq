import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { trackingTemplates } from "./schema";
import type { TemplateQuestion } from "./schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

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

async function seed() {
  console.log("Seeding default templates...");

  await db.insert(trackingTemplates).values([
    {
      condition: "diabetes",
      name: "Diabetes Default Template",
      questions: DIABETES_QUESTIONS,
      isDefault: true,
    },
    {
      condition: "obesity",
      name: "Obesity Default Template",
      questions: OBESITY_QUESTIONS,
      isDefault: true,
    },
  ]);

  console.log("Seeded 2 default templates.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

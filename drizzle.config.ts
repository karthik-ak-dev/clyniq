import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

const envFile =
  process.env.ENV === "production"
    ? ".env.production"
    : process.env.ENV === "staging"
      ? ".env.staging"
      : ".env.local";

dotenv.config({ path: envFile });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

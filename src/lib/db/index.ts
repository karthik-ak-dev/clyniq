import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Neon HTTP driver — recommended for Vercel serverless.
// Each query is a stateless HTTP request, no persistent connection needed.
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export * from "./schema";
export * from "./types";
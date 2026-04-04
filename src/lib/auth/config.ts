import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { doctors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ─── NextAuth Configuration ────────────────────────────────
// Uses the Credentials provider for email/password authentication.
// Sessions are stored as JWTs (stateless) — no database session table needed.
//
// Flow:
//   1. Doctor submits email + password on /login
//   2. `authorize()` looks up doctor by email, verifies bcrypt hash
//   3. On success, a JWT is created with { id, email, name }
//   4. The `session` callback attaches doctor.id to the session object
//   5. Subsequent requests read the session via getServerSession()
//
// Why JWT strategy (not database sessions):
//   - Simpler: no session table, no cleanup cron
//   - Stateless: works well with serverless (Vercel)
//   - Sufficient for single-device doctor usage in MVP

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // Called when a doctor signs in. Returns a user object on success,
      // or null to reject the sign-in (shows error on login page).
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Look up doctor by email
        const [doctor] = await db
          .select()
          .from(doctors)
          .where(eq(doctors.email, credentials.email))
          .limit(1);

        if (!doctor) {
          return null; // No account with this email
        }

        // Verify the password against the stored bcrypt hash
        const isValid = await bcrypt.compare(
          credentials.password,
          doctor.passwordHash
        );

        if (!isValid) {
          return null; // Wrong password
        }

        // Return the user object — this gets encoded into the JWT.
        // Only include fields needed for session (no sensitive data).
        return {
          id: doctor.id,
          email: doctor.email,
          name: doctor.name,
        };
      },
    }),
  ],

  // Use JWT-based sessions (no database session table)
  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Called when a JWT is created or updated.
    // On sign-in, `user` is the object returned by `authorize()`.
    // On subsequent requests, `token` already has the data from prior calls.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Called whenever `getServerSession()` is used.
    // Attaches the doctor's ID to the session so API routes can identify them.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login", // Custom login page (not the default NextAuth form)
  },
};

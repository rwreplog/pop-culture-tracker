import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { authConfig } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { accounts, users } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { loginSchema } from "@/lib/schemas/auth";
import { verifyPassword } from "@/lib/services/auth/password";
import { generateUniqueHandle } from "@/lib/services/users/handle";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts }),
  events: {
    /**
     * Only fires for adapter-created users, i.e. OAuth sign-up (the
     * Credentials path inserts its own row directly in registerUser and
     * sets a handle there) — DrizzleAdapter's insert doesn't know about
     * our extra `handle` column, so it's backfilled right after.
     */
    async createUser({ user }) {
      if (!user.id) return;
      const handle = await generateUniqueHandle(user.name || user.email || "");
      await db.update(users).set({ handle }).where(eq(users.id, user.id));
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.error("DEBUG authorize: schema failed", parsed.error);
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, parsed.data.email),
        });
        if (!user?.passwordHash) {
          console.error(
            "DEBUG authorize: no user/hash",
            parsed.data.email,
            !!user,
          );
          return null;
        }

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) {
          console.error("DEBUG authorize: bad password", parsed.data.email);
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
});

import type { NextAuthConfig } from "next-auth";

/**
 * Routes reachable without a session. Everything else redirects to /login.
 */
const PUBLIC_ROUTES = ["/login", "/register"];

/**
 * The subset of NextAuth config that's safe to run in Edge middleware:
 * no database adapter, no bcrypt. Real providers are added in
 * src/lib/auth/index.ts, which extends this config for use in server
 * components, server actions, and the route handler. See
 * https://authjs.dev/guides/edge-compatibility.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  /**
   * We self-host rather than deploy on a platform that auto-verifies the
   * Host header (e.g. Vercel), so Auth.js requires this explicitly. Safe
   * as long as the app only ever sits behind our own reverse proxy.
   * https://authjs.dev/reference/nextjs#trusthost
   */
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = PUBLIC_ROUTES.some((route) =>
        request.nextUrl.pathname.startsWith(route),
      );

      if (isPublicRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", request.nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;

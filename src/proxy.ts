import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth/config";

const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/auth|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|css|js|map|txt|xml|webmanifest)$).*)",
  ],
};

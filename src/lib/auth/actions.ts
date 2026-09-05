"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth";
import { isRateLimited, recordFailedAttempt } from "@/lib/auth/rate-limit";
import { loginSchema, registerSchema } from "@/lib/schemas/auth";
import { registerUser } from "@/lib/services/auth/register";

export type FormActionState = { error?: string } | undefined;

export async function loginAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  if (isRateLimited(parsed.data.email)) {
    return { error: "Too many attempts. Try again in a minute." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      recordFailedAttempt(parsed.data.email);
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function registerAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await registerUser(parsed.data);
  if (!result.success) {
    return { error: result.error };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created. Please sign in." };
    }
    throw error;
  }
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

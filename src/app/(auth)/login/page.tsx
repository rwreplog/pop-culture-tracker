import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LoginForm } from "@/components/auth/login-form";
import { env } from "@/lib/env";

export default function LoginPage() {
  const googleEnabled = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <Card variant="glass" className="w-full max-w-sm">
      <CardHeader className="justify-items-center text-center">
        <Image
          src="/geekery-logo.png"
          alt=""
          width={56}
          height={56}
          className="mb-1 size-14"
          priority
        />
        <CardTitle as="h1" className="text-xl">
          Sign in
        </CardTitle>
        <CardDescription>
          Welcome back to your personal library.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {googleEnabled ? (
          <>
            <GoogleSignInButton />
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-xs">or</span>
              <Separator className="flex-1" />
            </div>
          </>
        ) : null}
        <LoginForm />
      </CardContent>
    </Card>
  );
}

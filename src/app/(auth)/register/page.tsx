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
import { RegisterForm } from "@/components/auth/register-form";
import { env } from "@/lib/env";

export default function RegisterPage() {
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
          Create your account
        </CardTitle>
        <CardDescription>
          Start tracking everything you watch, read, and play.
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
        <RegisterForm />
      </CardContent>
    </Card>
  );
}

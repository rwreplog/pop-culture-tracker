"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/lib/actions/profile";

export function EditProfileForm({
  handle,
  bio,
}: {
  handle: string | null;
  bio: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-handle">Handle</Label>
        <Input
          id="profile-handle"
          name="handle"
          required
          maxLength={30}
          pattern="[a-z0-9][a-z0-9-]*"
          defaultValue={handle ?? ""}
        />
        <p className="text-muted-foreground text-xs">
          Lowercase letters, numbers, and hyphens. Your public profile lives at
          /u/{handle ?? "your-handle"}.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-bio">Bio</Label>
        <Textarea
          id="profile-bio"
          name="bio"
          rows={3}
          maxLength={280}
          defaultValue={bio ?? ""}
        />
      </div>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending} className="self-start">
        Save profile
      </Button>
    </form>
  );
}

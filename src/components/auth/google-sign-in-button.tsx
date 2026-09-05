import { Button } from "@/components/ui/button";
import { googleSignInAction } from "@/lib/auth/actions";

export function GoogleSignInButton() {
  return (
    <form action={googleSignInAction}>
      <Button type="submit" variant="outline" className="w-full">
        Continue with Google
      </Button>
    </form>
  );
}

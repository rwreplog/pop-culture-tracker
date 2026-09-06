import { Compass } from "lucide-react";
import Link from "next/link";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col px-4">
      <PlaceholderScreen
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have been moved."
        action={
          <Button nativeButton={false} render={<Link href="/" />}>
            Back to dashboard
          </Button>
        }
      />
    </div>
  );
}

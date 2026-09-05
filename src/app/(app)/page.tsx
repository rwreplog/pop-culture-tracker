import { Sparkles } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";

export default function HomePage() {
  return (
    <PlaceholderScreen
      icon={Sparkles}
      title="Welcome to Geekery"
      description="Your personal home base is coming together. Continue watching, your queue, and recent activity will live here."
    />
  );
}

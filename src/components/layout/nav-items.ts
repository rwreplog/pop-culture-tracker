import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Compass,
  Home,
  Library,
  ListChecks,
  Plus,
  Settings,
  User,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/**
 * Primary desktop navigation.
 * Discover and Stats currently render placeholder screens — see
 * docs/UX.md and docs/ROADMAP.md (Discover scope and Stats are not
 * yet defined for MVP).
 */
export const desktopNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/lists", label: "Lists", icon: ListChecks },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Bottom navigation for small screens. */
export const mobileNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/library?add=1", label: "Add", icon: Plus },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

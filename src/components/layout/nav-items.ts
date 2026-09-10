import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Compass,
  Home,
  Library,
  ListChecks,
  Moon,
  Plus,
  Sparkles,
  Target,
  User,
  Users,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Rendered as an elevated accent action in the mobile dock. */
  isPrimary?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/**
 * Primary desktop navigation, grouped so a sidebar of ~10 links reads as
 * categories instead of one long flat list. Settings is deliberately
 * omitted — it's already reachable from the account menu in the header
 * (see UserMenu), so it doesn't need a second entry point here.
 */
export const desktopNavGroups: NavGroup[] = [
  {
    label: "Discover",
    items: [
      { href: "/", label: "Home", icon: Home },
      { href: "/tonight", label: "Tonight", icon: Moon },
      { href: "/surprise", label: "Surprise", icon: Sparkles },
      { href: "/discover", label: "Discover", icon: Compass },
    ],
  },
  {
    label: "Your library",
    items: [
      { href: "/library", label: "Library", icon: Library },
      { href: "/lists", label: "Lists", icon: ListChecks },
      { href: "/goals", label: "Goals", icon: Target },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/activity", label: "Activity", icon: Activity },
      { href: "/stats", label: "Stats", icon: BarChart3 },
    ],
  },
  {
    label: "Social",
    items: [{ href: "/friends", label: "Friends", icon: Users }],
  },
];

/** Bottom navigation for small screens. */
export const mobileNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/discover", label: "Add", icon: Plus, isPrimary: true },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

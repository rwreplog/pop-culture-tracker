import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Manrope,
  Space_Grotesk,
  Sora,
} from "next/font/google";
import "./globals.css";

import { PwaUpdateManager } from "@/components/pwa/pwa-update-manager";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSync } from "@/components/theme-sync";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth";
import { getUserPreferences } from "@/lib/services/users/queries";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcfe" },
    { media: "(prefers-color-scheme: dark)", color: "#090b12" },
  ],
  // Lets content draw under the iOS status bar/home indicator so the
  // safe-area-inset-* padding used in header/mobile-nav/toast actually has
  // something to react to — without it those insets stay 0 in standalone.
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Geekery",
  description:
    "Track, organize, and discover the movies, shows, games, books, and comics you care about.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Geekery",
  },
  icons: {
    // The manifest's icons are transparent-cornered "any" purpose PNGs —
    // fine for Android, but iOS composites apple-touch-icon on a black
    // home-screen background, so a dedicated opaque one is needed here.
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Geekery",
    description:
      "Track, organize, and discover the movies, shows, games, books, and comics you care about.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Geekery",
    description:
      "Track, organize, and discover the movies, shows, games, books, and comics you care about.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  const preferences = session?.user?.id
    ? await getUserPreferences(session.user.id)
    : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-accent={preferences?.accentColor ?? "blue"}
      data-font={preferences?.fontFamily ?? "space-grotesk"}
      className={`${spaceGrotesk.variable} ${bricolageGrotesque.variable} ${manrope.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Warm up the connection to each provider's image CDN ahead of the
            first poster request — these are separate subdomains from the
            APIs we call, so the browser hasn't connected to them yet. */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://images.igdb.com" />
        <link rel="preconnect" href="https://comicvine.gamespot.com" />
        <link rel="preconnect" href="https://books.google.com" />
        <ThemeProvider
          attribute="class"
          defaultTheme={preferences?.theme ?? "dark"}
          enableSystem
          disableTransitionOnChange
        >
          <ThemeSync initialTheme={preferences?.theme} />
          <TooltipProvider>{children}</TooltipProvider>
          <PwaUpdateManager />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

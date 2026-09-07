import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import "./globals.css";

import { PwaUpdateManager } from "@/components/pwa/pwa-update-manager";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcfe" },
    { media: "(prefers-color-scheme: dark)", color: "#090b12" },
  ],
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${bricolageGrotesque.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <PwaUpdateManager />
        </ThemeProvider>
      </body>
    </html>
  );
}

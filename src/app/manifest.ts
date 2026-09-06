import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Geekery",
    short_name: "Geekery",
    description:
      "Track, organize, and discover the movies, shows, games, books, and comics you care about.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcfe",
    theme_color: "#2b59c8",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

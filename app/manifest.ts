import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Medbl - Amharic Poetry",
    short_name: "Medbl",
    description: "Read, honor, and share Amharic poetry.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF3E6",
    theme_color: "#B5651D",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

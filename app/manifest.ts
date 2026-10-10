import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Medbl - Amharic Poetry",
    short_name: "Medbl",
    description: "Read, honor, and share Amharic poetry.",
    start_url: "/home",
    display: "standalone",
    background_color: "#FBF3E6",
    theme_color: "#B5651D",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-monochrome-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "monochrome",
      },
    ],
  };
}

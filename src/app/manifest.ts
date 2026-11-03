import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "BarberHub",
    short_name: "BarberHub",
    description: "Agende seu próximo corte de cabelo ou barba.",
    start_url: "/navalha",
    scope: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#292524",
    icons: [
      {
        src: "/icons/barberhub-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/barberhub-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

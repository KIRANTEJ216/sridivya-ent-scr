import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sri Divya Enterprises",
    short_name: "Sri Divya",
    description: "Corrugated box manufacturer in Jeedimetla, Hyderabad.",
    start_url: "/",
    display: "browser",
    background_color: "#0b0e13",
    theme_color: "#0b0e13",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

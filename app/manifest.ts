import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "우리 체중계",
    short_name: "우리 체중계",
    description: "2인 공유 체중 기록 웹앱",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f8fb",
    theme_color: "#ffffff",
    lang: "ko-KR",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

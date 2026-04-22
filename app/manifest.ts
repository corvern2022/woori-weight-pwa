import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "오리 레인저",
    short_name: "오리 레인저",
    description: "창희 하경의 공유 앱 — 할일 & 체중",
    start_url: "/",
    display: "standalone",
    background_color: "#EAF4FB",
    theme_color: "#EAF4FB",
    lang: "ko-KR",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

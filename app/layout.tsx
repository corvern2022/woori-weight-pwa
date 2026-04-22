import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리 공간",
  description: "커플 공유 앱 — 할일 & 체중",
  applicationName: "우리 공간",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "우리 공간",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

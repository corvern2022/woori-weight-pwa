import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리 체중계",
  description: "2인 공유 체중 기록 PWA",
  applicationName: "우리 체중계",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "우리 체중계",
  },
  themeColor: "#ffffff",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

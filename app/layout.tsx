import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/themeContext";

export const metadata: Metadata = {
  title: "오리 레인저",
  description: "창희하경 커플 공유 앱 — 할일 & 체중",
  applicationName: "오리 레인저",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "오리 레인저" },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  themeColor: "#EAF4FB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

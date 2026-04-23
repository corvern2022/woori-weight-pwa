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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&family=Jua&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){try{if(localStorage.getItem('oriDark')==='1')document.documentElement.classList.add('dark')}catch(e){}})()`
        }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

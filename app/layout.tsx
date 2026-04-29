import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/themeContext";
import { BottomNav } from "@/components/ui";

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
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/* Pretendard — non-blocking: media print trick, swap to all after load */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css"
          media="print"
          // @ts-expect-error onload is valid on link elements
          onLoad="this.media='all'"
        />
        {/* Fallback if JS disabled */}
        <noscript>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css" />
        </noscript>
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){try{if(localStorage.getItem('oriDark')==='1')document.documentElement.classList.add('dark')}catch(e){}})()`
        }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}

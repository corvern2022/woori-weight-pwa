# 오리 레인저 디자인 리디자인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 구름 놀이터 테마(Jua/Gaegu 폰트, 오리+돌핀 캐릭터, 파스텔 색상)로 전체 앱을 리디자인하고, `/chat`, `/drink`, `/settings` 3개 신규 페이지를 추가한다.

**Architecture:** Next.js App Router 기반 유지. CSS 변수로 다크모드 구현, Tailwind 커스텀 토큰 확장. 캐릭터 SVG는 TypeScript 컴포넌트로 포팅. 기존 Supabase 스키마(tasks, task_items, task_events, weigh_ins, household_members, user_profiles)는 그대로 유지.

**Tech Stack:** Next.js 16 + TypeScript + Tailwind CSS 3 + Supabase JS v2 + Recharts + Google Fonts (Jua, Gaegu)

---

## 파일 구조

**신규 생성:**
- `lib/theme.ts` — 테마 토큰 타입 + light/dark 색상 맵
- `lib/themeContext.tsx` — ThemeContext (dark 토글, localStorage 저장)
- `components/characters/Duck.tsx` — Duck SVG 컴포넌트
- `components/characters/Dolphin.tsx` — Dolphin SVG 컴포넌트
- `components/characters/DuckDolphinPair.tsx` — 커플 SVG
- `components/ui/WhoBadge.tsx` — 담당자 뱃지 (🦆창희 / 🐬하경 / 💞같이)
- `components/ui/Avatar.tsx` — 캐릭터 아바타 원형
- `components/ui/BottomNav.tsx` — 하단 네비게이션 바 (홈/할일/체중/채팅/설정)
- `components/ui/BackBtn.tsx` — 뒤로가기 버튼
- `components/ui/CloudDeco.tsx` — 구름 장식 SVG
- `components/ui/Confetti.tsx` — 컨페티 애니메이션
- `components/ui/PageWrapper.tsx` — 슬라이드 전환 래퍼
- `app/chat/page.tsx` — AI 코치 페이지
- `app/drink/page.tsx` — 음주 캘린더 페이지
- `app/settings/page.tsx` — 설정 페이지

**수정:**
- `tailwind.config.ts` — 디자인 토큰 추가
- `app/globals.css` — CSS 변수 + 폰트 + 다크모드
- `app/layout.tsx` — Google Fonts import + ThemeProvider
- `app/page.tsx` — 홈 리디자인
- `app/tasks/page.tsx` — 할일 리디자인
- `app/weight/page.tsx` — 체중 리디자인
- `components/DashboardClient.tsx` — 체중 대시보드 리디자인
- `components/tasks/TasksClient.tsx` — 할일 클라이언트 리디자인
- `components/tasks/TaskCard.tsx` — 새 TaskRow 스타일
- `components/tasks/TaskForm.tsx` — 새 폼 스타일
- `app/manifest.ts` — PWA manifest 업데이트

---

## Task 1: 디자인 토큰 + 테마 시스템

**Files:**
- Create: `lib/theme.ts`
- Create: `lib/themeContext.tsx`
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: lib/theme.ts 생성**

```typescript
// lib/theme.ts
export const THEMES = {
  light: {
    bg: '#EAF4FB', bgDeep: '#D4ECF7', card: '#FFFFFF', cardAlt: '#F5FAFE',
    ink: '#2A3D54', inkSoft: '#6B8AA8', inkMute: '#A6B7C7',
    accent: '#5BBFE8', accentDeep: '#2F95C4', accentSoft: '#CDE9F6',
    mint: '#9BDBC0', mintDeep: '#5FB894',
    peach: '#FFB89A', peachDeep: '#E88560',
    duck: '#FFC83A', duckDeep: '#E8B020', duckSoft: '#FFF2C4',
    dolphin: '#5BBFE8', dolphinDeep: '#2F95C4', dolphinSoft: '#CDE9F6',
    pink: '#FFB3C8',
    border: 'rgba(42,61,84,0.08)',
    shadow: '0 2px 0 rgba(42,61,84,0.04), 0 10px 26px -8px rgba(47,149,196,0.22)',
    shadowSoft: '0 1px 0 rgba(42,61,84,0.03), 0 6px 16px -6px rgba(47,149,196,0.15)',
    cloudColor: '#fff',
  },
  dark: {
    bg: '#0F1E2E', bgDeep: '#152838', card: '#1E3447', cardAlt: '#17293A',
    ink: '#E8F2FB', inkSoft: '#8FA8BE', inkMute: '#5E7690',
    accent: '#6FCCF2', accentDeep: '#4FB5E0', accentSoft: '#1F3E54',
    mint: '#7ACFB0', mintDeep: '#5FB894',
    peach: '#FFB89A', peachDeep: '#E88560',
    duck: '#FFD76B', duckDeep: '#E8B820', duckSoft: '#3A3018',
    dolphin: '#6FCCF2', dolphinDeep: '#4FB5E0', dolphinSoft: '#1F3E54',
    pink: '#FFB3C8',
    border: 'rgba(255,255,255,0.07)',
    shadow: '0 2px 0 rgba(0,0,0,0.2), 0 10px 26px -8px rgba(0,0,0,0.4)',
    shadowSoft: '0 1px 0 rgba(0,0,0,0.2), 0 6px 16px -6px rgba(0,0,0,0.3)',
    cloudColor: '#1E3447',
  },
} as const;

export type ThemeKey = keyof typeof THEMES;
export type Theme = typeof THEMES.light;
```

- [ ] **Step 2: lib/themeContext.tsx 생성**

```typescript
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Theme, ThemeKey } from "./theme";
import { THEMES } from "./theme";

type Ctx = { T: Theme; dark: boolean; setDark: (v: boolean) => void };
const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDarkState] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("oriDark");
      if (saved === "1") setDarkState(true);
    } catch {}
  }, []);

  function setDark(v: boolean) {
    setDarkState(v);
    try { localStorage.setItem("oriDark", v ? "1" : "0"); } catch {}
    document.documentElement.classList.toggle("dark", v);
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const T = dark ? THEMES.dark : THEMES.light;
  return <ThemeCtx.Provider value={{ T, dark, setDark }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
```

- [ ] **Step 3: tailwind.config.ts 업데이트**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        jua: ["var(--font-jua)", "sans-serif"],
        gaegu: ["var(--font-gaegu)", "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        "card-alt": "var(--card-alt)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-mute": "var(--ink-mute)",
        accent: "var(--accent)",
        "accent-deep": "var(--accent-deep)",
        "accent-soft": "var(--accent-soft)",
        mint: "var(--mint)",
        "mint-deep": "var(--mint-deep)",
        peach: "var(--peach)",
        "peach-deep": "var(--peach-deep)",
        duck: "var(--duck)",
        "duck-deep": "var(--duck-deep)",
        "duck-soft": "var(--duck-soft)",
        dolphin: "var(--dolphin)",
        "dolphin-soft": "var(--dolphin-soft)",
        pink: "var(--pink)",
      },
      boxShadow: {
        card: "var(--shadow)",
        soft: "var(--shadow-soft)",
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "24px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: app/globals.css 업데이트**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Jua&family=Gaegu:wght@400;700&display=swap');

:root {
  --font-jua: 'Jua';
  --font-gaegu: 'Gaegu';

  --bg: #EAF4FB;
  --card: #FFFFFF;
  --card-alt: #F5FAFE;
  --ink: #2A3D54;
  --ink-soft: #6B8AA8;
  --ink-mute: #A6B7C7;
  --accent: #5BBFE8;
  --accent-deep: #2F95C4;
  --accent-soft: #CDE9F6;
  --mint: #9BDBC0;
  --mint-deep: #5FB894;
  --peach: #FFB89A;
  --peach-deep: #E88560;
  --duck: #FFC83A;
  --duck-deep: #E8B020;
  --duck-soft: #FFF2C4;
  --dolphin: #5BBFE8;
  --dolphin-soft: #CDE9F6;
  --pink: #FFB3C8;
  --shadow: 0 2px 0 rgba(42,61,84,0.04), 0 10px 26px -8px rgba(47,149,196,0.22);
  --shadow-soft: 0 1px 0 rgba(42,61,84,0.03), 0 6px 16px -6px rgba(47,149,196,0.15);
}

.dark {
  --bg: #0F1E2E;
  --card: #1E3447;
  --card-alt: #17293A;
  --ink: #E8F2FB;
  --ink-soft: #8FA8BE;
  --ink-mute: #5E7690;
  --accent: #6FCCF2;
  --accent-deep: #4FB5E0;
  --accent-soft: #1F3E54;
  --mint: #7ACFB0;
  --mint-deep: #5FB894;
  --peach: #FFB89A;
  --peach-deep: #E88560;
  --duck: #FFD76B;
  --duck-deep: #E8B820;
  --duck-soft: #3A3018;
  --dolphin: #6FCCF2;
  --dolphin-soft: #1F3E54;
  --pink: #FFB3C8;
  --shadow: 0 2px 0 rgba(0,0,0,0.2), 0 10px 26px -8px rgba(0,0,0,0.4);
  --shadow-soft: 0 1px 0 rgba(0,0,0,0.2), 0 6px 16px -6px rgba(0,0,0,0.3);
}

*, *::before, *::after { box-sizing: border-box; }
html, body {
  margin: 0;
  min-height: 100%;
  background-color: var(--bg);
  color: var(--ink);
  transition: background-color 0.3s, color 0.3s;
}
button, input { font: inherit; }

/* iOS safe area */
.safe-top    { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }

/* hide scrollbar */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* page slide animations */
@keyframes slideInFromRight {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
@keyframes slideInFromLeft {
  from { transform: translateX(-18%); opacity: 0.5; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes floatCloud {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
@keyframes bobY {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
@keyframes jumpDolphin {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%       { transform: translateY(-12px) rotate(5deg); }
}
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
@keyframes shine {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.date-input {
  -webkit-appearance: none;
  appearance: none;
  background-color: var(--card);
  color: var(--ink);
  min-height: 48px;
}
```

- [ ] **Step 5: app/layout.tsx 업데이트 — ThemeProvider 추가**

```typescript
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
```

- [ ] **Step 6: 타입체크**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa" && npx tsc --noEmit 2>&1
```
Expected: 오류 없음

- [ ] **Step 7: 커밋**

```bash
git add -A && git commit -m "feat: add oriranger design tokens, CSS variables, and theme context"
```

---

## Task 2: 캐릭터 컴포넌트 (Duck, Dolphin, Pair)

**Files:**
- Create: `components/characters/Duck.tsx`
- Create: `components/characters/Dolphin.tsx`
- Create: `components/characters/DuckDolphinPair.tsx`

- [ ] **Step 1: components/characters/Duck.tsx 생성**

```typescript
type Palette = "yellow" | "cream" | "outline";
type Variant = "default" | "wave" | "strong" | "head";

interface DuckProps {
  size?: number;
  variant?: Variant;
  palette?: Palette;
  style?: React.CSSProperties;
}

const PALETTES = {
  yellow:  { main: "#FFC83A", shade: "#F2A91E", beak: "#FF8A3D", beakShade: "#E8691A", eye: "#2A1F12", cheek: "#FFB8B8" },
  cream:   { main: "#FFD76B", shade: "#E8B53A", beak: "#FF9C5A", beakShade: "#E67832", eye: "#3A2A18", cheek: "#FFC4B8" },
  outline: { main: "#FFC83A", shade: "#2A1F12", beak: "#FF8A3D", beakShade: "#2A1F12", eye: "#2A1F12", cheek: "#FFB8B8" },
};

export function Duck({ size = 80, variant = "default", palette = "yellow", style }: DuckProps) {
  const body = PALETTES[palette];
  const isOutline = palette === "outline";
  const stroke = isOutline ? "#2A1F12" : "none";
  const sw = isOutline ? 2.2 : 0;

  if (variant === "head") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
        <circle cx="50" cy="50" r="32" fill={body.main} stroke={stroke} strokeWidth={sw} />
        <ellipse cx="72" cy="54" rx="14" ry="7" fill={body.beak} stroke={stroke} strokeWidth={sw} />
        <ellipse cx="52" cy="44" rx="3.5" ry="4.5" fill={body.eye} />
        <circle cx="53" cy="42" r="1.3" fill="#fff" />
        <ellipse cx="38" cy="52" rx="5" ry="3" fill={body.cheek} opacity={0.7} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <ellipse cx="52" cy="68" rx="30" ry="22" fill={body.shade} stroke={stroke} strokeWidth={sw} />
      <ellipse cx="50" cy="62" rx="28" ry="22" fill={body.main} stroke={stroke} strokeWidth={sw} />
      <path d="M40 60 Q 38 74, 52 76 Q 62 74, 58 60 Z" fill={body.shade} stroke={stroke} strokeWidth={sw} opacity={0.85} />
      <circle cx="50" cy="36" r="20" fill={body.main} stroke={stroke} strokeWidth={sw} />
      <ellipse cx="66" cy="40" rx="12" ry="6" fill={body.beak} stroke={stroke} strokeWidth={sw} />
      <path d="M54 40 Q 66 43, 78 40" stroke={body.beakShade} strokeWidth="1.5" fill="none" opacity={isOutline ? 0 : 0.6} />
      <ellipse cx="52" cy="32" rx="3.2" ry="4" fill={body.eye} />
      <circle cx="53" cy="30.5" r="1.1" fill="#fff" />
      {variant === "strong" && (
        <path d="M46 25 Q 50 22, 56 25" stroke={body.eye} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      )}
      <ellipse cx="40" cy="38" rx="4" ry="2.5" fill={body.cheek} opacity={0.7} />
      <ellipse cx="42" cy="86" rx="5" ry="3" fill={body.beak} stroke={stroke} strokeWidth={sw} />
      <ellipse cx="56" cy="86" rx="5" ry="3" fill={body.beak} stroke={stroke} strokeWidth={sw} />
      {variant === "wave" && (
        <g transform="translate(22, 45) rotate(-20)">
          <ellipse cx="0" cy="0" rx="6" ry="5" fill={body.shade} stroke={stroke} strokeWidth={sw} />
        </g>
      )}
      {variant === "strong" && (
        <g>
          <path d="M26 58 Q 18 50, 22 42 Q 26 38, 32 42" fill={body.main} stroke={stroke} strokeWidth={sw} />
          <circle cx="22" cy="44" r="5" fill={body.shade} stroke={stroke} strokeWidth={sw} />
        </g>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: components/characters/Dolphin.tsx 생성**

```typescript
type Palette = "blue" | "pink" | "outline";
type Variant = "default" | "cry" | "happy" | "head";

interface DolphinProps {
  size?: number;
  variant?: Variant;
  palette?: Palette;
  style?: React.CSSProperties;
}

const PALETTES = {
  blue:    { main: "#7FC8E8", shade: "#4FA8D4", belly: "#E8F4FB", eye: "#1F2D3D", cheek: "#FFB3C8", tear: "#5BBFE8" },
  pink:    { main: "#F4A8C0", shade: "#D97AA0", belly: "#FFEEF3", eye: "#3F1F2D", cheek: "#FFB3C8", tear: "#7FC8E8" },
  outline: { main: "#7FC8E8", shade: "#2A1F12", belly: "#E8F4FB", eye: "#2A1F12", cheek: "#FFB3C8", tear: "#5BBFE8" },
};

export function Dolphin({ size = 80, variant = "default", palette = "blue", style }: DolphinProps) {
  const body = PALETTES[palette];
  const isOutline = palette === "outline";
  const stroke = isOutline ? "#2A1F12" : "none";
  const sw = isOutline ? 2.2 : 0;

  if (variant === "head") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
        <ellipse cx="50" cy="52" rx="34" ry="28" fill={body.main} stroke={stroke} strokeWidth={sw} />
        <ellipse cx="50" cy="60" rx="28" ry="18" fill={body.belly} opacity={0.8} />
        <ellipse cx="62" cy="48" rx="3" ry="4" fill={body.eye} />
        <circle cx="63" cy="46" r="1.1" fill="#fff" />
        <path d="M70 58 Q 74 62, 74 56" stroke={body.eye} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <ellipse cx="46" cy="58" rx="4" ry="2.5" fill={body.cheek} opacity={0.7} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <path d="M12 62 Q 4 54, 6 46 L 18 56 Q 16 64, 12 62 Z" fill={body.shade} stroke={stroke} strokeWidth={sw} />
      <path d="M14 70 Q 6 76, 4 70 L 18 62 Q 20 68, 14 70 Z" fill={body.shade} stroke={stroke} strokeWidth={sw} />
      <path d="M20 58 Q 30 36, 60 36 Q 82 38, 86 52 Q 84 64, 74 66 Q 50 72, 30 70 Q 22 68, 20 58 Z"
        fill={body.main} stroke={stroke} strokeWidth={sw} />
      <path d="M28 62 Q 40 68, 60 68 Q 72 66, 78 60 Q 70 72, 50 72 Q 34 72, 28 62 Z"
        fill={body.belly} opacity={isOutline ? 0.6 : 0.75} />
      <path d="M54 38 Q 58 28, 66 32 Q 64 38, 60 40 Z" fill={body.shade} stroke={stroke} strokeWidth={sw} />
      <ellipse cx="42" cy="64" rx="7" ry="4" fill={body.shade} stroke={stroke} strokeWidth={sw} transform="rotate(15 42 64)" />
      {variant !== "cry" && (
        <path d="M78 55 Q 82 58, 82 54" stroke={body.eye} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      )}
      {variant === "cry" && (
        <path d="M78 58 Q 82 54, 82 58" stroke={body.eye} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      )}
      {variant === "happy" ? (
        <path d="M68 46 Q 72 42, 76 46" stroke={body.eye} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx="72" cy="48" rx="2.8" ry="3.5" fill={body.eye} />
          <circle cx="73" cy="46.5" r="1" fill="#fff" />
        </>
      )}
      {variant === "cry" && (
        <>
          <ellipse cx="70" cy="56" rx="2" ry="3.5" fill={body.tear} opacity={0.85} />
          <ellipse cx="75" cy="58" rx="1.8" ry="3" fill={body.tear} opacity={0.85} />
        </>
      )}
      <ellipse cx="62" cy="54" rx="4" ry="2.5" fill={body.cheek} opacity={0.7} />
    </svg>
  );
}
```

- [ ] **Step 3: components/characters/DuckDolphinPair.tsx 생성**

```typescript
import { Duck } from "./Duck";
import { Dolphin } from "./Dolphin";

export function DuckDolphinPair({ size = 140, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", width: size, height: size * 0.75, ...style }}>
      <div style={{ position: "absolute", left: 0, bottom: 0 }}>
        <Duck size={size * 0.65} variant="default" palette="yellow" />
      </div>
      <div style={{ position: "absolute", right: 0, bottom: 4 }}>
        <Dolphin size={size * 0.7} variant="default" palette="blue" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 타입체크**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa" && npx tsc --noEmit 2>&1
```
Expected: 오류 없음

- [ ] **Step 5: 커밋**

```bash
git add -A && git commit -m "feat: add Duck, Dolphin, DuckDolphinPair TypeScript components"
```

---

## Task 3: 공유 UI 컴포넌트

**Files:**
- Create: `components/ui/WhoBadge.tsx`
- Create: `components/ui/Avatar.tsx`
- Create: `components/ui/BackBtn.tsx`
- Create: `components/ui/CloudDeco.tsx`
- Create: `components/ui/Confetti.tsx`
- Create: `components/ui/BottomNav.tsx`

- [ ] **Step 1: components/ui/WhoBadge.tsx**

```typescript
"use client";
import { useTheme } from "@/lib/themeContext";

type Who = "duck" | "dolphin" | "both";

export function WhoBadge({ who, size = "sm" }: { who: Who; size?: "sm" | "md" }) {
  const { T } = useTheme();
  const map: Record<Who, { bg: string; fg: string; emoji: string; label: string }> = {
    duck:    { bg: T.duck,    fg: T.ink,  emoji: "🦆", label: "창희" },
    dolphin: { bg: T.dolphin, fg: "#fff", emoji: "🐬", label: "하경" },
    both:    { bg: T.pink,    fg: T.ink,  emoji: "💞", label: "같이" },
  };
  const m = map[who];
  const cls = size === "sm"
    ? "text-xs px-2 py-0.5 rounded-lg"
    : "text-sm px-2.5 py-1 rounded-xl";
  return (
    <span className={`font-jua inline-flex items-center gap-0.5 ${cls}`}
      style={{ background: m.bg, color: m.fg }}>
      {m.emoji} {m.label}
    </span>
  );
}

export function assigneeToWho(assignee: string): Who {
  if (assignee === "창희") return "duck";
  if (assignee === "하경") return "dolphin";
  return "both";
}
```

- [ ] **Step 2: components/ui/Avatar.tsx**

```typescript
"use client";
import { useTheme } from "@/lib/themeContext";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";

type Who = "duck" | "dolphin";

export function Avatar({ who, size = 26 }: { who: Who; size?: number }) {
  const { T } = useTheme();
  const bg = who === "duck" ? T.duckSoft : T.dolphinSoft;
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {who === "duck"
        ? <Duck size={size * 0.85} variant="head" palette="yellow" />
        : <Dolphin size={size * 0.85} variant="head" palette="blue" />}
    </div>
  );
}
```

- [ ] **Step 3: components/ui/BackBtn.tsx**

```typescript
"use client";
import Link from "next/link";
import { useTheme } from "@/lib/themeContext";

export function BackBtn({ href, label = "홈" }: { href: string; label?: string }) {
  const { T } = useTheme();
  return (
    <Link href={href} style={{ display: "inline-flex", alignItems: "center", gap: 6,
      textDecoration: "none", color: T.accentDeep, fontFamily: "var(--font-jua)", fontSize: 15 }}>
      <div style={{ width: 32, height: 32, borderRadius: 16, background: T.card,
        boxShadow: T.shadowSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={T.accentDeep} strokeWidth="2.2" strokeLinecap="round">
          <path d="M9 2L3 7l6 5" />
        </svg>
      </div>
      {label}
    </Link>
  );
}
```

- [ ] **Step 4: components/ui/CloudDeco.tsx**

```typescript
"use client";
import { useTheme } from "@/lib/themeContext";

export function CloudDeco({ size = 120, opacity = 0.9, style }: {
  size?: number; opacity?: number; style?: React.CSSProperties;
}) {
  const { T } = useTheme();
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 120 72"
      style={{ ...style, opacity, pointerEvents: "none", position: "absolute" }}>
      <ellipse cx="30" cy="50" rx="26" ry="20" fill={T.cloudColor} />
      <ellipse cx="60" cy="38" rx="34" ry="28" fill={T.cloudColor} />
      <ellipse cx="90" cy="50" rx="28" ry="20" fill={T.cloudColor} />
      <ellipse cx="58" cy="56" rx="40" ry="14" fill={T.cloudColor} />
    </svg>
  );
}
```

- [ ] **Step 5: components/ui/Confetti.tsx**

```typescript
"use client";
import { useMemo } from "react";
import { useTheme } from "@/lib/themeContext";

export function Confetti() {
  const { T } = useTheme();
  const colors = [T.accent, T.duck, T.mint, T.peach, T.pink, T.accentDeep];
  const pieces = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    left: 15 + Math.random() * 70,
    size: 5 + Math.random() * 7,
    color: colors[i % colors.length],
    dx: (Math.random() - 0.5) * 260,
    dy: 340 + Math.random() * 120,
    rot: Math.random() * 900 - 450,
    dur: 1.0 + Math.random() * 0.7,
    delay: Math.random() * 0.15,
  })), []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: "42%", left: `${p.left}%`,
          width: p.size, height: p.size * 1.3, background: p.color, borderRadius: 2,
          animation: `cf${i} ${p.dur}s ${p.delay}s ease-out forwards`,
        }} />
      ))}
      <style>{pieces.map((p, i) => `@keyframes cf${i} {
        0%   { transform: translate(0,0) rotate(0deg); opacity:1; }
        100% { transform: translate(${p.dx}px,${p.dy}px) rotate(${p.rot}deg); opacity:0; }
      }`).join("\n")}</style>
    </div>
  );
}
```

- [ ] **Step 6: components/ui/BottomNav.tsx**

```typescript
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/themeContext";

const NAV_ITEMS = [
  { href: "/",        icon: "home",    label: "홈"    },
  { href: "/tasks",   icon: "task",    label: "할일"  },
  { href: "/weight",  icon: "weight",  label: "체중"  },
  { href: "/chat",    icon: "chat",    label: "코치"  },
  { href: "/settings",icon: "gear",    label: "설정"  },
];

function NavIcon({ name, active, color }: { name: string; active: boolean; color: string }) {
  const c = active ? "#fff" : color;
  if (name === "home") return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l7-7 7 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M7 19V12h6v7"/>
    </svg>
  );
  if (name === "task") return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="14" rx="2"/><path d="M7 10l2 2 4-4"/>
    </svg>
  );
  if (name === "weight") return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M4 15 Q 7 9, 10 12 T 16 10"/>
    </svg>
  );
  if (name === "chat") return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M3 6Q3 3 6 3h8Q17 3 17 6v5Q17 14 14 14h-3l-4 3v-3H6Q3 14 3 11Z"/>
    </svg>
  );
  if (name === "gear") return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/>
    </svg>
  );
  return null;
}

export function BottomNav() {
  const { T } = useTheme();
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: T.card, borderTop: `1px solid ${T.border}`,
      display: "flex", paddingBottom: "env(safe-area-inset-bottom)",
      boxShadow: T.shadow,
    }}>
      {NAV_ITEMS.map(({ href, icon, label }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, padding: "10px 6px", textDecoration: "none",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: active ? `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})` : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}>
              <NavIcon name={icon} active={active} color={T.inkMute} />
            </div>
            <span style={{
              fontFamily: "var(--font-jua)", fontSize: 10,
              color: active ? T.accentDeep : T.inkMute,
            }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 7: 타입체크**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa" && npx tsc --noEmit 2>&1
```

- [ ] **Step 8: 커밋**

```bash
git add -A && git commit -m "feat: add shared UI components (WhoBadge, Avatar, BackBtn, CloudDeco, Confetti, BottomNav)"
```

---

## Task 4: 홈 페이지 리디자인

**Files:**
- Modify: `app/page.tsx`

기존 간단한 HomeCard 2개에서 → 캐릭터 애니메이션, BigCard 2개, 오늘의 할일 3개, 하단 독 제거(BottomNav로 대체).

- [ ] **Step 1: app/page.tsx 완전 교체**

```typescript
import { HomePageClient } from "@/components/HomePageClient";

export default function HomePage() {
  return <HomePageClient />;
}
```

- [ ] **Step 2: components/HomePageClient.tsx 생성**

```typescript
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/themeContext";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";
import { CloudDeco } from "@/components/ui/CloudDeco";
import { BottomNav } from "@/components/ui/BottomNav";
import { getSupabaseClient } from "@/lib/supabase";

export function HomePageClient() {
  const { T } = useTheme();
  const supabase = useMemo(() => { try { return getSupabaseClient(); } catch { return null; } }, []);
  const [openCount, setOpenCount] = useState<number | null>(null);
  const today = new Date().toLocaleDateString("ko-KR", { weekday: "short", month: "long", day: "numeric" });

  useEffect(() => {
    if (!supabase) return;
    supabase.from("tasks").select("id", { count: "exact" }).eq("completed", false)
      .then(({ count }) => setOpenCount(count ?? 0));
  }, [supabase]);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgDeep} 60%, ${T.bg} 100%)`, color: T.ink, position: "relative", overflow: "hidden", paddingBottom: 80 }}>
      {/* 구름 장식 */}
      <CloudDeco style={{ top: 58, left: -20 }} size={100} />
      <CloudDeco style={{ top: 130, right: -30, animationDelay: "2s" }} size={90} opacity={0.7} />

      {/* 헤더 */}
      <div style={{ height: 60 }} />
      <div style={{ padding: "14px 22px 0", position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 15, color: T.inkSoft, marginBottom: 2, fontFamily: "var(--font-gaegu)" }}>
          {today}
        </div>
        <div style={{ fontFamily: "var(--font-jua)", fontSize: 28, lineHeight: 1.2, letterSpacing: -0.5 }}>
          안녕,{" "}
          <span style={{ color: T.accentDeep }}>창희하경!</span>
        </div>
      </div>

      {/* 캐릭터 */}
      <div style={{ position: "relative", height: 200, margin: "16px 0 8px" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
          background: `linear-gradient(180deg, ${T.accentSoft}00 0%, ${T.accentSoft} 100%)`,
          borderRadius: "50% 50% 0 0 / 20% 20% 0 0" }} />
        <div style={{ position: "absolute", left: "16%", bottom: 20,
          animation: "bobY 3.5s ease-in-out infinite" }}>
          <Duck size={120} variant="strong" palette="yellow" />
        </div>
        <div style={{ position: "absolute", right: "8%", bottom: 18,
          animation: "jumpDolphin 2.8s ease-in-out infinite" }}>
          <Dolphin size={120} variant="happy" palette="blue" />
        </div>
      </div>

      {/* BigCard 2개 */}
      <div style={{ padding: "8px 18px", display: "flex", gap: 12, position: "relative", zIndex: 2 }}>
        <BigCard href="/tasks" title="할 일" count={openCount ?? "…"} subtitle="오늘 남음"
          color={T.peach} colorDeep={T.peachDeep} icon="task" T={T} />
        <BigCard href="/weight" title="체중" count="체크" subtitle="기록하기"
          color={T.mint} colorDeep={T.mintDeep} icon="weight" T={T} />
      </div>

      {/* 오늘의 할일 미리보기 */}
      <div style={{ padding: "14px 18px 0" }}>
        <div style={{ background: T.card, borderRadius: 22, padding: 16, boxShadow: T.shadowSoft }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: "var(--font-jua)", fontSize: 16 }}>오늘 우리가 할 일</div>
            <Link href="/tasks" style={{ fontFamily: "var(--font-gaegu)", fontSize: 13,
              color: T.accent, textDecoration: "none" }}>전체 보기 →</Link>
          </div>
          {openCount === 0 ? (
            <div style={{ textAlign: "center", padding: "16px 0", color: T.inkMute,
              fontFamily: "var(--font-gaegu)", fontSize: 14 }}>
              🎉 오늘 할 일을 다 했어!
            </div>
          ) : (
            <div style={{ color: T.inkSoft, fontFamily: "var(--font-gaegu)", fontSize: 14, padding: "8px 0" }}>
              {openCount !== null ? `${openCount}개 남았어 — 할일 탭에서 확인해봐!` : "불러오는 중..."}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function BigCard({ href, title, count, subtitle, color, colorDeep, icon, T }: {
  href: string; title: string; count: number | string; subtitle: string;
  color: string; colorDeep: string; icon: string; T: typeof import("@/lib/theme").THEMES.light;
}) {
  return (
    <Link href={href} style={{ flex: 1, background: T.card, borderRadius: 24, padding: 16,
      boxShadow: T.shadow, position: "relative", overflow: "hidden",
      textDecoration: "none", color: T.ink, display: "block" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100,
        borderRadius: "50%", background: color, opacity: 0.25 }} />
      <div style={{ width: 40, height: 40, borderRadius: 14,
        background: `linear-gradient(135deg, ${color}, ${colorDeep})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "inset 0 2px 3px rgba(255,255,255,0.4)", marginBottom: 10 }}>
        {icon === "task" ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="5" width="14" height="14" rx="2"/><path d="M8 11l2 2 4-4"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
            <path d="M5 16 Q 8 10, 11 13 T 17 11"/>
          </svg>
        )}
      </div>
      <div style={{ fontFamily: "var(--font-jua)", fontSize: 17, letterSpacing: -0.3 }}>{title}</div>
      <div style={{ fontFamily: "var(--font-jua)", fontSize: 30, color: colorDeep, lineHeight: 1.1, marginTop: 2 }}>{count}</div>
      <div style={{ fontFamily: "var(--font-gaegu)", fontSize: 13, color: T.inkSoft }}>{subtitle}</div>
    </Link>
  );
}
```

- [ ] **Step 3: 타입체크**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa" && npx tsc --noEmit 2>&1
```

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "feat: redesign home page with characters and BigCards"
```

---

## Task 5: 할일 페이지 리디자인

**Files:**
- Modify: `components/tasks/TasksClient.tsx`
- Modify: `components/tasks/TaskCard.tsx`
- Modify: `components/tasks/TaskForm.tsx`

- [ ] **Step 1: components/tasks/TasksClient.tsx 리디자인**

TasksClient.tsx를 열어 전체를 새 디자인으로 교체. 핵심 변경:
- 필터 탭: `["전체","창희","하경","같이","완료"]` → 기존 FilterTab 타입 유지 (all/창희/하경/둘다/done)
- 헤더에 Duck + Dolphin 캐릭터 추가
- 배경 구름 장식
- FAB 버튼 스타일 업그레이드

```typescript
// components/tasks/TasksClient.tsx 상단 import에 추가
import { useTheme } from "@/lib/themeContext";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";
import { CloudDeco } from "@/components/ui/CloudDeco";
import { WhoBadge, assigneeToWho } from "@/components/ui/WhoBadge";
import { BottomNav } from "@/components/ui/BottomNav";
```

헤더 부분:
```tsx
<div style={{ padding: "54px 22px 12px", position: "relative" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 }}>
    <div>
      <div style={{ fontFamily: "var(--font-jua)", fontSize: 30, letterSpacing: -0.5, color: T.ink }}>할 일</div>
      <div style={{ fontFamily: "var(--font-gaegu)", fontSize: 15, color: T.inkSoft }}>
        {doneTasks.length}/{tasks.length} 완료 · 화이팅 🌊
      </div>
    </div>
    <div style={{ display: "flex" }}>
      <div style={{ transform: "rotate(-10deg)" }}><Duck size={50} variant="strong" palette="yellow"/></div>
      <div style={{ transform: "rotate(12deg) translateX(-6px)" }}><Dolphin size={56} variant="happy" palette="blue"/></div>
    </div>
  </div>
</div>
```

필터 버튼 (pill 스타일):
```tsx
const filters: Array<{ key: FilterTab; label: string }> = [
  { key: "all", label: "전체" },
  { key: "창희", label: "🦆 창희" },
  { key: "하경", label: "🐬 하경" },
  { key: "둘다", label: "💞 같이" },
  { key: "done", label: "완료" },
];
// 각 필터 버튼:
<button style={{
  padding: "8px 16px", borderRadius: 100, border: "none", cursor: "pointer", flexShrink: 0,
  background: activeFilter === f.key ? `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})` : T.card,
  color: activeFilter === f.key ? "#fff" : T.inkSoft,
  fontFamily: "var(--font-jua)", fontSize: 15,
  boxShadow: activeFilter === f.key ? `0 4px 12px ${T.accent}55` : T.shadowSoft,
}}>
```

FAB 버튼:
```tsx
<button style={{
  position: "fixed", bottom: 90, right: 20, width: 58, height: 58, borderRadius: 29,
  border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})`,
  color: "#fff", cursor: "pointer", zIndex: 40,
  boxShadow: `0 6px 20px ${T.accent}77, inset 0 2px 4px rgba(255,255,255,0.3)`,
  display: "flex", alignItems: "center", justifyContent: "center",
}}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
</button>
```

- [ ] **Step 2: components/tasks/TaskCard.tsx 리디자인**

새 TaskRow 스타일 (프로토타입의 TaskRow 참고):
- 카드 배경 `T.card`, borderRadius 20px
- 체크박스: 완료 시 민트 그라디언트, 미완료 시 inset 보더
- WhoBadge + 카테고리 뱃지 + 날짜 표시
- 댓글 수 표시

```typescript
// TaskCard.tsx 주요 스타일 변경 (props 유지, 스타일만 변경)
const { T } = useTheme(); // 상단에 추가

// 카드 컨테이너
<div style={{ background: T.card, borderRadius: 20, boxShadow: T.shadowSoft,
  border: task.completed ? `1.5px solid ${T.accentSoft}` : "1.5px solid transparent",
  overflow: "hidden", cursor: "pointer" }}>
  <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
    {/* 체크박스 */}
    <button style={{ width: 28, height: 28, borderRadius: 14, border: "none", cursor: "pointer", marginTop: 2,
      background: task.completed ? `linear-gradient(135deg, ${T.mint}, ${T.mintDeep})` : "transparent",
      boxShadow: task.completed ? `0 3px 8px ${T.mintDeep}66` : `inset 0 0 0 2.5px ${T.inkMute}`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s",
    }}>
      {task.completed && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M3 8l3 3 6-6"/></svg>}
    </button>
    {/* 본문 */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "center", flexWrap: "wrap" }}>
        <WhoBadge who={assigneeToWho(task.assignee)} />
        {task.category && (
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8,
            background: T.accentSoft, color: T.accentDeep, fontFamily: "var(--font-jua)" }}>
            {task.category}
          </span>
        )}
        {task.due_date && (
          <span style={{ fontSize: 11, color: T.inkMute, fontFamily: "var(--font-gaegu)" }}>
            · {task.due_date}
          </span>
        )}
      </div>
      <div style={{ fontFamily: "var(--font-jua)", fontSize: 17, color: task.completed ? T.inkMute : T.ink,
        textDecoration: task.completed ? "line-through" : "none" }}>
        {task.title}
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: 타입체크**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa" && npx tsc --noEmit 2>&1
```

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "feat: redesign tasks page with oriranger theme"
```

---

## Task 6: 체중 페이지 리디자인

**Files:**
- Modify: `components/DashboardClient.tsx`

- [ ] **Step 1: DashboardClient.tsx 헤더/섹션 스타일 업데이트**

```typescript
// DashboardClient.tsx 상단 import 추가
import { useTheme } from "@/lib/themeContext";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";
import { CloudDeco } from "@/components/ui/CloudDeco";
import { BottomNav } from "@/components/ui/BottomNav";
```

헤더:
```tsx
<header style={{ position: "relative", background: T.card, borderRadius: 22,
  margin: "54px 18px 0", padding: 16, boxShadow: T.shadowSoft, overflow: "hidden" }}>
  <CloudDeco style={{ top: -20, right: -20 }} size={80} opacity={0.5} />
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <div style={{ fontFamily: "var(--font-jua)", fontSize: 24 }}>우리 체중계</div>
      <div style={{ fontFamily: "var(--font-gaegu)", fontSize: 13, color: T.inkSoft }}>
        현재: {myName}
      </div>
    </div>
    <div style={{ display: "flex", gap: -8 }}>
      <Duck size={50} variant="head" palette="yellow" />
      <Dolphin size={50} variant="head" palette="blue" />
    </div>
  </div>
  <button onClick={() => { localStorage.removeItem("woori_weight_user_id"); setMyUserId(null); }}
    style={{ marginTop: 8, padding: "6px 12px", borderRadius: 12, border: "none",
      background: T.accentSoft, color: T.accentDeep, fontFamily: "var(--font-jua)", fontSize: 13, cursor: "pointer" }}>
    사람 전환
  </button>
</header>
```

이름 선택 화면:
```tsx
// myUserId가 없고 members가 있을 때 표시
<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
  background: `linear-gradient(180deg, ${T.bg}, ${T.bgDeep})`, padding: "0 24px" }}>
  <div style={{ background: T.card, borderRadius: 24, padding: 24, boxShadow: T.shadow, width: "100%", maxWidth: 400 }}>
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      <DuckDolphinPair size={120} style={{ margin: "0 auto" }} />
    </div>
    <div style={{ fontFamily: "var(--font-jua)", fontSize: 24, textAlign: "center", marginBottom: 6, color: T.ink }}>
      우리 체중계
    </div>
    <div style={{ fontFamily: "var(--font-gaegu)", fontSize: 15, textAlign: "center",
      color: T.inkSoft, marginBottom: 20 }}>나는 누구인가요?</div>
    {members.map((m) => (
      <button key={m.user_id} onClick={() => selectUser(m.user_id)}
        style={{ width: "100%", marginBottom: 10, padding: "14px 0", borderRadius: 18, border: "none",
          background: m.display_name === "창희"
            ? `linear-gradient(135deg, ${T.duck}, ${T.duckDeep})`
            : `linear-gradient(135deg, ${T.dolphin}, ${T.accentDeep})`,
          color: "#fff", fontFamily: "var(--font-jua)", fontSize: 18, cursor: "pointer",
          boxShadow: T.shadow }}>
        {m.display_name === "창희" ? "🦆 " : "🐬 "}{m.display_name}
      </button>
    ))}
  </div>
</div>
```

- [ ] **Step 2: 타입체크**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa" && npx tsc --noEmit 2>&1
```

- [ ] **Step 3: 커밋**

```bash
git add -A && git commit -m "feat: redesign weight page with oriranger theme"
```

---

## Task 7: /chat AI 코치 페이지

**Files:**
- Create: `app/chat/page.tsx`
- Modify: `components/AiChat.tsx` (추출 + 리디자인)

- [ ] **Step 1: app/chat/page.tsx 생성**

```typescript
export const dynamic = "force-dynamic";
import { ChatPageClient } from "@/components/ChatPageClient";

export default function ChatPage() {
  return <ChatPageClient />;
}
```

- [ ] **Step 2: components/ChatPageClient.tsx 생성**

기존 `AiChat.tsx`의 로직을 가져와서 새 디자인 적용.

```typescript
"use client";
import { useRef, useState } from "react";
import { useTheme } from "@/lib/themeContext";
import { BackBtn } from "@/components/ui/BackBtn";
import { BottomNav } from "@/components/ui/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import type { AiSummary, ChatMessage } from "@/lib/types";

const SUGGESTIONS = ["오늘 뭐 먹을까?", "운동 추천해줘", "다이어트 팁", "이번 주 정리해줘"];

export function ChatPageClient() {
  const { T } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          summary: null,
        }),
      });
      const data = await res.json() as { reply?: string };
      setMessages(m => [...m, { id: Date.now().toString(), role: "assistant", content: data.reply ?? "..." }]);
    } catch {
      setMessages(m => [...m, { id: Date.now().toString(), role: "assistant", content: "잠깐 오류가 났어. 다시 해봐!" }]);
    } finally {
      setLoading(false);
      setTimeout(() => { scrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" }); }, 100);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${T.bg}, ${T.bgDeep})`,
      color: T.ink, display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      {/* 헤더 */}
      <div style={{ padding: "54px 22px 10px" }}>
        <BackBtn href="/" label="홈" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22,
            background: `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden" }}>
            <span style={{ fontSize: 22 }}>✨</span>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
              animation: "shine 3s linear infinite" }} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-jua)", fontSize: 20, color: T.ink }}>오리&돌핀 코치</div>
            <div style={{ fontFamily: "var(--font-gaegu)", fontSize: 12, color: T.mintDeep,
              display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: T.mintDeep, display: "inline-block" }} />
              온라인 · 친근한 코치 모드
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 */}
      <div ref={scrollRef} className="no-scrollbar" style={{ flex: 1, overflowY: "auto",
        padding: "10px 18px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: T.inkMute,
            fontFamily: "var(--font-gaegu)", fontSize: 16 }}>
            안녕! 뭐든 물어봐 🌊
          </div>
        )}
        {messages.map(m => {
          const isMe = m.role === "user";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start",
              gap: 6, animation: "slideUp 0.3s ease-out" }}>
              {!isMe && (
                <div style={{ width: 30, height: 30, borderRadius: 15,
                  background: `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                  ✨
                </div>
              )}
              <div style={{ maxWidth: "75%" }}>
                <div style={{
                  background: isMe ? `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})` : T.card,
                  color: isMe ? "#fff" : T.ink, borderRadius: 18, padding: "10px 14px",
                  fontFamily: "var(--font-gaegu)", fontSize: 15, lineHeight: 1.4, boxShadow: T.shadowSoft,
                  borderBottomLeftRadius: isMe ? 18 : 4, borderBottomRightRadius: isMe ? 4 : 18,
                }}>
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 30, height: 30, borderRadius: 15,
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✨</div>
            <div style={{ background: T.card, borderRadius: 18, borderBottomLeftRadius: 4,
              padding: "10px 14px", fontFamily: "var(--font-gaegu)", fontSize: 15, color: T.inkMute }}>
              입력 중...
            </div>
          </div>
        )}
      </div>

      {/* 추천 질문 chips */}
      <div style={{ padding: "0 14px 4px" }}>
        <div className="no-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => void send(s)}
              style={{ padding: "6px 12px", borderRadius: 100, border: `1px solid ${T.accentSoft}`,
                background: T.card, color: T.accentDeep, fontFamily: "var(--font-jua)", fontSize: 12,
                cursor: "pointer", flexShrink: 0 }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 입력창 */}
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ background: T.card, borderRadius: 22, padding: 6, display: "flex", gap: 4,
          boxShadow: T.shadowSoft, border: `1px solid ${T.border}` }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && void send(input)}
            placeholder="코치한테 말 걸기..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent",
              fontFamily: "var(--font-gaegu)", fontSize: 15, color: T.ink, padding: "8px 12px" }} />
          <button onClick={() => void send(input)}
            style={{ border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})`,
              borderRadius: 18, width: 40, height: 40, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 8L14 3L10 14L8 9L2 8Z"/>
            </svg>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 3: 타입체크**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa" && npx tsc --noEmit 2>&1
```

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "feat: add /chat AI coach page with oriranger design"
```

---

## Task 8: /drink 음주 캘린더 페이지

**Files:**
- Create: `app/drink/page.tsx`
- Create: `components/DrinkPageClient.tsx`

기존 `AlcoholCalendarCard.tsx` 데이터 로직 재활용, 새 전체 페이지로 확장.

- [ ] **Step 1: app/drink/page.tsx**

```typescript
export const dynamic = "force-dynamic";
import { DrinkPageClient } from "@/components/DrinkPageClient";

export default function DrinkPage() {
  return <DrinkPageClient />;
}
```

- [ ] **Step 2: components/DrinkPageClient.tsx 생성**

Supabase에서 weigh_ins.drank 데이터 읽어 30일 캘린더 표시. 날짜 탭하면 기록/삭제.

```typescript
"use client";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/themeContext";
import { BackBtn } from "@/components/ui/BackBtn";
import { BottomNav } from "@/components/ui/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import { getSupabaseClient } from "@/lib/supabase";
import { toSeoulISODate, addDaysISO } from "@/lib/date";
import type { WeighInRow, HouseholdMember } from "@/lib/types";

const LOCAL_KEY = "woori_weight_user_id";

export function DrinkPageClient() {
  const { T } = useTheme();
  const supabase = useMemo(() => { try { return getSupabaseClient(); } catch { return null; } }, []);
  const [rows, setRows] = useState<WeighInRow[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [myUserId] = useState(() => { try { return localStorage.getItem(LOCAL_KEY); } catch { return null; } });
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const todayISO = useMemo(() => toSeoulISODate(), []);

  useEffect(() => {
    if (!supabase) return;
    void (async () => {
      const { data: mRows } = await supabase.from("household_members").select("user_id, display_name, household_id");
      const mems = (mRows ?? []) as Array<HouseholdMember & { household_id: string }>;
      setMembers(mems.map(m => ({ user_id: m.user_id, display_name: m.display_name })));
      const hid = mems[0]?.household_id ?? null;
      setHouseholdId(hid);
      if (!hid) return;
      const { data: wRows } = await supabase.from("weigh_ins").select("*").eq("household_id", hid).order("date");
      setRows(((wRows ?? []) as Array<{ date: string; user_id: string; weight_kg: number; drank?: boolean }>)
        .map(r => ({ date: r.date, user_id: r.user_id, weight_kg: Number(r.weight_kg), drank: Boolean(r.drank) })));
    })();
  }, [supabase]);

  // 30일 날짜 배열
  const days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => addDaysISO(todayISO, -(29 - i)));
  }, [todayISO]);

  const drankMap = useMemo(() => {
    const m = new Map<string, Set<string>>();
    rows.filter(r => r.drank).forEach(r => {
      if (!m.has(r.date)) m.set(r.date, new Set());
      m.get(r.date)!.add(r.user_id);
    });
    return m;
  }, [rows]);

  const memberDrankCount = useMemo(() => {
    return members.map(m => ({
      ...m,
      count: rows.filter(r => r.user_id === m.user_id && r.drank).length,
    }));
  }, [members, rows]);

  async function toggleDrink(userId: string, date: string) {
    if (!supabase || !householdId) return;
    setLoading(true);
    const existing = rows.find(r => r.user_id === userId && r.date === date);
    if (existing) {
      await supabase.from("weigh_ins").upsert(
        { household_id: householdId, user_id: userId, date, weight_kg: existing.weight_kg, drank: !existing.drank },
        { onConflict: "user_id,date" }
      );
      setRows(r => r.map(x => x.user_id === userId && x.date === date ? { ...x, drank: !x.drank } : x));
    } else {
      // drank 전용 레코드는 weight_kg 없이 저장할 수 없으므로 최근 체중 사용
      const recent = rows.filter(r => r.user_id === userId).sort((a, b) => b.date.localeCompare(a.date))[0];
      const weight = recent?.weight_kg ?? 60;
      await supabase.from("weigh_ins").upsert(
        { household_id: householdId, user_id: userId, date, weight_kg: weight, drank: true },
        { onConflict: "user_id,date" }
      );
      setRows(r => [...r, { date, user_id: userId, weight_kg: weight, drank: true }]);
    }
    setLoading(false);
  }

  // 월 그리드 (월요일 시작)
  const firstDay = new Date(days[0]).getDay(); // 0=Sun
  const pad = (firstDay + 6) % 7;
  const grid = [...Array(pad).fill(null), ...days];

  const getMemberColor = (userId: string) => {
    const m = members.find(x => x.user_id === userId);
    if (m?.display_name === "창희") return T.duck;
    return T.accent;
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, paddingBottom: 80 }}>
      <div style={{ padding: "54px 22px 10px" }}>
        <BackBtn href="/" label="홈" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
          <div style={{ fontFamily: "var(--font-jua)", fontSize: 28, letterSpacing: -0.5 }}>음주 캘린더 🍺</div>
          <div style={{ fontFamily: "var(--font-gaegu)", fontSize: 13, color: T.inkSoft }}>최근 30일</div>
        </div>
      </div>

      {/* 통계 */}
      <div style={{ padding: "6px 18px 10px", display: "flex", gap: 8 }}>
        {memberDrankCount.map(m => (
          <div key={m.user_id} style={{ flex: 1, borderRadius: 18, padding: 10,
            background: m.display_name === "창희" ? T.duckSoft : T.dolphinSoft }}>
            <div style={{ fontFamily: "var(--font-jua)", fontSize: 11 }}>
              {m.display_name === "창희" ? "🦆 창희" : "🐬 하경"}
            </div>
            <div style={{ fontFamily: "var(--font-jua)", fontSize: 22,
              color: m.display_name === "창희" ? T.duckDeep : T.accentDeep, lineHeight: 1 }}>
              {m.count}일
            </div>
          </div>
        ))}
      </div>

      {/* 달력 */}
      <div style={{ padding: "0 18px" }}>
        <div style={{ background: T.card, borderRadius: 22, padding: 14, boxShadow: T.shadowSoft }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
            {["월","화","수","목","금","토","일"].map((d, i) => (
              <div key={d} style={{ textAlign: "center", fontFamily: "var(--font-jua)", fontSize: 11,
                color: i >= 5 ? T.peachDeep : T.inkMute, padding: "2px 0" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {grid.map((date, i) => {
              if (!date) return <div key={i} style={{ aspectRatio: "1" }} />;
              const drinkers = drankMap.get(date);
              const isSelected = selected === date;
              const isToday = date === todayISO;
              return (
                <button key={i} onClick={() => setSelected(isSelected ? null : date)}
                  style={{ aspectRatio: "1", borderRadius: 10, cursor: "pointer",
                    border: isToday ? `2px solid ${T.accentDeep}` : `1px solid ${T.border}`,
                    background: isSelected ? T.accentSoft : T.card, padding: 3,
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "space-between", transition: "all 0.15s" }}>
                  <div style={{ fontFamily: "var(--font-jua)", fontSize: 10,
                    color: isToday ? T.accentDeep : T.ink }}>
                    {new Date(date).getDate()}
                  </div>
                  <div style={{ display: "flex", gap: 1 }}>
                    {members.map(m => drinkers?.has(m.user_id) ? (
                      <div key={m.user_id} style={{ width: 6, height: 6, borderRadius: 3,
                        background: getMemberColor(m.user_id) }} />
                    ) : null)}
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10, fontFamily: "var(--font-gaegu)",
            fontSize: 12, color: T.inkSoft }}>
            {members.map(m => (
              <span key={m.user_id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: getMemberColor(m.user_id), display: "inline-block" }} />
                {m.display_name}
              </span>
            ))}
          </div>
        </div>

        {/* 선택된 날짜 상세 */}
        {selected && (
          <div style={{ background: T.card, borderRadius: 22, padding: 16,
            boxShadow: T.shadowSoft, marginTop: 12, animation: "slideUp 0.2s ease-out" }}>
            <div style={{ fontFamily: "var(--font-jua)", fontSize: 16, marginBottom: 10 }}>
              {new Date(selected).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
            </div>
            {members.map(m => {
              const drank = drankMap.get(selected)?.has(m.user_id) ?? false;
              const who = m.display_name === "창희" ? "duck" : "dolphin";
              return (
                <div key={m.user_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                  borderTop: `1px solid ${T.border}` }}>
                  <Avatar who={who} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-jua)", fontSize: 14 }}>{m.display_name}</div>
                    <div style={{ fontFamily: "var(--font-gaegu)", fontSize: 13,
                      color: drank ? T.peachDeep : T.mintDeep }}>
                      {drank ? "🍺 마셨어" : "✓ 안 마심"}
                    </div>
                  </div>
                  <button onClick={() => void toggleDrink(m.user_id, selected)} disabled={loading}
                    style={{ padding: "6px 12px", borderRadius: 12, border: "none", cursor: "pointer",
                      background: drank ? T.cardAlt : `linear-gradient(135deg, ${T.duck}, ${T.peachDeep})`,
                      color: drank ? T.inkSoft : "#fff", fontFamily: "var(--font-jua)", fontSize: 12 }}>
                    {drank ? "지우기" : "🍺 기록"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 3: 타입체크**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa" && npx tsc --noEmit 2>&1
```

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "feat: add /drink alcohol calendar page"
```

---

## Task 9: /settings 설정 페이지

**Files:**
- Create: `app/settings/page.tsx`
- Create: `components/SettingsPageClient.tsx`

- [ ] **Step 1: app/settings/page.tsx**

```typescript
import { SettingsPageClient } from "@/components/SettingsPageClient";

export default function SettingsPage() {
  return <SettingsPageClient />;
}
```

- [ ] **Step 2: components/SettingsPageClient.tsx 생성**

```typescript
"use client";
import { useState } from "react";
import { useTheme } from "@/lib/themeContext";
import { BackBtn } from "@/components/ui/BackBtn";
import { BottomNav } from "@/components/ui/BottomNav";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";

export function SettingsPageClient() {
  const { T, dark, setDark } = useTheme();
  const [notif, setNotif] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, paddingBottom: 80 }}>
      <div style={{ padding: "54px 22px 10px" }}>
        <BackBtn href="/" label="홈" />
        <div style={{ fontFamily: "var(--font-jua)", fontSize: 30, letterSpacing: -0.5, marginTop: 4 }}>설정</div>
      </div>

      <div className="no-scrollbar" style={{ overflowY: "auto", padding: "4px 18px 50px",
        display: "flex", flexDirection: "column", gap: 14 }}>

        {/* 커플 프로필 */}
        <div style={{ background: `linear-gradient(135deg, ${T.accentSoft}, ${T.card})`,
          borderRadius: 22, padding: 16, boxShadow: T.shadowSoft, display: "flex", alignItems: "center", gap: 12 }}>
          <Duck size={44} variant="strong" palette="yellow" />
          <Dolphin size={48} variant="happy" palette="blue" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-jua)", fontSize: 16 }}>창희 &amp; 하경</div>
            <div style={{ fontFamily: "var(--font-gaegu)", fontSize: 13, color: T.inkSoft }}>
              오리 레인저 v1.0
            </div>
          </div>
        </div>

        <SettingGroup title="화면" T={T}>
          <SettingRow label="다크모드 🌙" value={dark} onToggle={() => setDark(!dark)}
            hint="야간에 눈이 편해" T={T} />
        </SettingGroup>

        <SettingGroup title="알림 & 리포트" T={T}>
          <SettingRow label="주간 리포트" value={weeklyReport} onToggle={() => setWeeklyReport(!weeklyReport)}
            hint="매주 일요일 오리가 요약해줘" T={T} />
          <SettingRow label="푸시 알림" value={notif} onToggle={() => setNotif(!notif)}
            hint="할 일 · 댓글 · 체중 입력 알림" T={T} last />
        </SettingGroup>

        <SettingGroup title="데이터" T={T}>
          <StaticRow label="데이터 내보내기 (CSV)" value="→" T={T} />
          <StaticRow label="초기화" value="→" warn T={T} last />
        </SettingGroup>

        <div style={{ textAlign: "center", fontFamily: "var(--font-gaegu)", fontSize: 12, color: T.inkMute, marginTop: 10 }}>
          오리 레인저 v1.0 · made with 🩵
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

type TT = typeof import("@/lib/theme").THEMES.light;

function SettingGroup({ title, children, T }: { title: string; children: React.ReactNode; T: TT }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-jua)", fontSize: 13, color: T.inkSoft,
        padding: "0 6px 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
      <div style={{ background: T.card, borderRadius: 20, boxShadow: T.shadowSoft, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, value, onToggle, hint, T, last }: {
  label: string; value: boolean; onToggle: () => void; hint?: string; T: TT; last?: boolean;
}) {
  return (
    <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
      borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-jua)", fontSize: 15 }}>{label}</div>
        {hint && <div style={{ fontFamily: "var(--font-gaegu)", fontSize: 12, color: T.inkSoft }}>{hint}</div>}
      </div>
      <button onClick={onToggle}
        style={{ width: 48, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
          background: value ? T.accentDeep : T.cardAlt, position: "relative", transition: "background 0.2s" }}>
        <div style={{ position: "absolute", top: 2, left: value ? 22 : 2, width: 24, height: 24,
          borderRadius: 12, background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
      </button>
    </div>
  );
}

function StaticRow({ label, value, warn, T, last }: { label: string; value: string; warn?: boolean; T: TT; last?: boolean }) {
  return (
    <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
      borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      <div style={{ flex: 1, fontFamily: "var(--font-jua)", fontSize: 15,
        color: warn ? T.peachDeep : T.ink }}>{label}</div>
      <div style={{ fontFamily: "var(--font-gaegu)", fontSize: 14, color: T.inkSoft }}>{value}</div>
    </div>
  );
}
```

- [ ] **Step 3: 타입체크**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa" && npx tsc --noEmit 2>&1
```

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "feat: add /settings page with dark mode toggle"
```

---

## Task 10: 컨페티 + 태스크 완료 인터랙션

**Files:**
- Modify: `components/tasks/TasksClient.tsx`
- Modify: `app/layout.tsx`

완료 토글 시 `<Confetti>` 잠깐 표시.

- [ ] **Step 1: TasksClient.tsx에 confetti 상태 추가**

```typescript
const [showConfetti, setShowConfetti] = useState(false);

function handleToggle(id: string, currentDone: boolean) {
  if (!currentDone) {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1600);
  }
  toggleTask(id);
}
```

- [ ] **Step 2: Confetti 렌더링 추가**

```tsx
import { Confetti } from "@/components/ui/Confetti";

// JSX 내에:
{showConfetti && <Confetti />}
```

- [ ] **Step 3: 커밋**

```bash
git add -A && git commit -m "feat: add confetti animation on task complete"
```

---

## Task 11: PWA manifest 업데이트

**Files:**
- Modify: `app/manifest.ts`

- [ ] **Step 1: app/manifest.ts 업데이트**

```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "오리 레인저",
    short_name: "오리레인저",
    description: "창희하경 커플 공유 앱",
    start_url: "/",
    display: "standalone",
    background_color: "#EAF4FB",
    theme_color: "#5BBFE8",
    orientation: "portrait",
    icons: [
      { src: "/icon?size=192", sizes: "192x192", type: "image/png" },
      { src: "/icon?size=512", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
```

- [ ] **Step 2: app/icon.tsx 오리+돌핀 아이콘으로 업데이트**

```typescript
import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: 192, height: 192, borderRadius: 48,
      background: "linear-gradient(135deg, #EAF4FB, #CDE9F6)",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100 }}>
      🦆
    </div>,
    { ...size }
  );
}
```

- [ ] **Step 3: 커밋**

```bash
git add -A && git commit -m "feat: update PWA manifest with oriranger branding"
```

---

## Task 12: 최종 통합 확인

- [ ] **Step 1: 전체 타입체크**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa" && npx tsc --noEmit 2>&1
```
Expected: 오류 없음

- [ ] **Step 2: dev 서버 실행 확인**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa" && npm run dev
```

- [ ] **Step 3: 각 페이지 동작 확인**
  - `/` 홈 — 캐릭터 애니메이션, BigCard 2개
  - `/tasks` — 필터 탭, 새 할일 추가, 완료 시 컨페티
  - `/weight` — 이름 선택, 체중 그래프
  - `/chat` — AI 코치 메시지 전송
  - `/drink` — 30일 달력, 날짜 탭하여 기록
  - `/settings` — 다크모드 토글 작동

- [ ] **Step 4: 최종 커밋**

```bash
git add -A && git commit -m "feat: complete oriranger redesign with all pages"
```

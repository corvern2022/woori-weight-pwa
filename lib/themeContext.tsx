"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Theme } from "./theme";
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

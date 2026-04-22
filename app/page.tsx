'use client'

import { HomeCard } from "@/components/HomeCard";
import { BottomNav } from "@/components/ui";
import { CloudDeco } from "@/components/ui";
import { DuckDolphinPair } from "@/components/characters";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="relative overflow-hidden flex flex-col items-center justify-end pb-6 pt-10 px-4"
        style={{ minHeight: "38vh", background: "linear-gradient(180deg, var(--bg-deep, #dbeafe) 0%, var(--bg) 100%)" }}>
        <div className="absolute top-4 left-4 opacity-30">
          <CloudDeco size={64} />
        </div>
        <div className="absolute top-10 right-6 opacity-20">
          <CloudDeco size={48} />
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-15">
          <CloudDeco size={80} />
        </div>

        <div className="relative z-10 text-center mb-4">
          <h1 className="font-jua text-3xl text-ink">오리 레인저 🦆🐬</h1>
          <p className="font-gaegu text-ink-soft mt-1">창희 하경의 공간</p>
        </div>

        <div className="relative z-10">
          <DuckDolphinPair size={110} />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          <HomeCard
            href="/tasks"
            icon="✅"
            title="할일"
            subtitle="창희·하경 투두"
            accentColor="duck"
          />
          <HomeCard
            href="/weight"
            icon="⚖️"
            title="체중"
            subtitle="기록 & 그래프"
            accentColor="dolphin"
          />
          <HomeCard
            href="/chat"
            icon="💬"
            title="AI 코치"
            subtitle="함께 조언"
            accentColor="mint"
          />
          <HomeCard
            href="/drink"
            icon="🍺"
            title="음주"
            subtitle="음주 캘린더"
            accentColor="peach"
          />
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  );
}

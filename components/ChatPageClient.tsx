'use client'

import { AiChat } from "@/components/AiChat";
import { BottomNav } from "@/components/ui";
import { Dolphin } from "@/components/characters";
import type { AiSummary } from "@/lib/types";

const emptySummary: AiSummary = {
  range_days: 30,
  today: "",
  me_label: "나",
  partner_label: "파트너",
  users: [],
  deltas: {
    me: { vs_yesterday: null, vs_week: null },
    partner: { vs_yesterday: null, vs_week: null },
  },
};

export function ChatPageClient() {
  return (
    <div className="bg-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-ink/10 shadow-soft sticky top-0 z-10">
        <div className="flex items-center gap-2 px-4 py-3">
          <Dolphin size={36} variant="happy" palette="blue" />
          <h1 className="font-jua text-ink text-xl">AI 코치 💬</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 overflow-hidden">
        <AiChat summary={emptySummary} />
      </main>

      <BottomNav active="chat" />
    </div>
  );
}

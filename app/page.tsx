import { HomeCard } from "@/components/HomeCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">우리 공간 💑</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
        <HomeCard
          href="/tasks"
          icon="✅"
          title="할일"
          subtitle="할일 목록 관리"
        />
        <HomeCard
          href="/weight"
          icon="⚖️"
          title="체중"
          subtitle="체중 기록 & 그래프"
        />
      </main>
    </div>
  );
}

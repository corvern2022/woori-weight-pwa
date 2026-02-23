type Props = {
  goalInput: string;
  dietStartDate: string;
  saving: boolean;
  currentWeight: number | null;
  onChangeGoal: (value: string) => void;
  onChangeDietStartDate: (value: string) => void;
  onSaveGoal: () => void;
  todayISO: string;
};

function goalMessage(current: number | null, goalInput: string): string {
  const goal = Number.parseFloat(goalInput);
  if (!Number.isFinite(goal) || goal <= 0) return "목표 체중을 입력하세요.";
  if (current == null) return "현재 체중 기록이 없어 계산할 수 없어요.";

  const diff = Math.round((current - goal) * 10) / 10;
  if (diff > 0) return `현재 기준 ${diff.toFixed(1)}kg 남았어요.`;
  if (diff < 0) return `목표보다 ${Math.abs(diff).toFixed(1)}kg 낮아요.`;
  return "목표 체중 달성!";
}

function dDayText(dietStartDate: string, todayISO: string): string {
  if (!dietStartDate) return "시작일을 입력하면 D-day를 보여줘요.";
  const [sy, sm, sd] = dietStartDate.split("-").map(Number);
  const [ty, tm, td] = todayISO.split("-").map(Number);
  const start = Date.UTC(sy, sm - 1, sd);
  const today = Date.UTC(ty, tm - 1, td);
  const diffDays = Math.floor((today - start) / (24 * 60 * 60 * 1000));
  if (diffDays < 0) return `시작일까지 ${Math.abs(diffDays)}일 남았어요.`;
  return `다이어트 시작 후 ${diffDays + 1}일째예요.`;
}

export function GoalCard({
  goalInput,
  dietStartDate,
  saving,
  currentWeight,
  onChangeGoal,
  onChangeDietStartDate,
  onSaveGoal,
  todayISO,
}: Props) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-card">
      <h2 className="text-lg font-bold">목표 체중</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-sm text-slate-600">목표 (kg)</span>
          <input
            value={goalInput}
            onChange={(e) => onChangeGoal(e.target.value)}
            inputMode="decimal"
            placeholder="예: 72.0"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
          />
        </label>
        <label>
          <span className="mb-1 block text-sm text-slate-600">다이어트 시작일</span>
          <input
            type="date"
            value={dietStartDate}
            onChange={(e) => onChangeDietStartDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base"
          />
        </label>
        <button
          type="button"
          onClick={onSaveGoal}
          disabled={saving}
          className="rounded-xl bg-accent px-5 py-3 text-base font-semibold text-white disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-600">{goalMessage(currentWeight, goalInput)}</p>
      <p className="mt-1 text-sm text-slate-600">{dDayText(dietStartDate, todayISO)}</p>
    </section>
  );
}

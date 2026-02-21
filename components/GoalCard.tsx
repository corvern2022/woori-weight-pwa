type Props = {
  goalInput: string;
  saving: boolean;
  currentWeight: number | null;
  onChangeGoal: (value: string) => void;
  onSaveGoal: () => void;
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

export function GoalCard({ goalInput, saving, currentWeight, onChangeGoal, onSaveGoal }: Props) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-card">
      <h2 className="text-lg font-bold">목표 체중</h2>
      <div className="mt-3 flex items-end gap-3">
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
    </section>
  );
}

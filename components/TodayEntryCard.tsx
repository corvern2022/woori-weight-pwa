type Props = {
  todayISO: string;
  yesterdayISO: string;
  selectedDate: string;
  weightInput: string;
  saving: boolean;
  onChangeDate: (value: string) => void;
  onChangeWeight: (value: string) => void;
  onSave: () => void;
};

export function TodayEntryCard({
  todayISO,
  yesterdayISO,
  selectedDate,
  weightInput,
  saving,
  onChangeDate,
  onChangeWeight,
  onSave,
}: Props) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-card">
      <h2 className="text-lg font-bold">기록 입력</h2>
      <p className="mt-1 text-sm text-slate-500">오늘: {todayISO} (Asia/Seoul)</p>
      <div className="mt-3 flex items-end gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-sm text-slate-600">기록 날짜</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-3"
          />
        </label>
        <button
          type="button"
          onClick={() => onChangeDate(yesterdayISO)}
          className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
        >
          어제
        </button>
        <button
          type="button"
          onClick={() => onChangeDate(todayISO)}
          className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
        >
          오늘
        </button>
      </div>
      <div className="mt-4 flex items-end gap-3">
        <label className="flex-1">
          <span className="mb-1 block text-sm text-slate-600">몸무게 (kg)</span>
          <input
            value={weightInput}
            onChange={(e) => onChangeWeight(e.target.value)}
            inputMode="decimal"
            placeholder="예: 72.3"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
          />
        </label>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-accent px-5 py-3 text-base font-semibold text-white disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </section>
  );
}

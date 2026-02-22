import { formatISOWithWeekdayKorean } from "@/lib/date";

type Props = {
  todayISO: string;
  selectedDate: string;
  weightInput: string;
  drank: boolean;
  saving: boolean;
  onPreviousDate: () => void;
  onNextDate: () => void;
  onChangeDate: (value: string) => void;
  onChangeWeight: (value: string) => void;
  onChangeDrank: (value: boolean) => void;
  onSave: () => void;
};

export function TodayEntryCard({
  todayISO,
  selectedDate,
  weightInput,
  drank,
  saving,
  onPreviousDate,
  onNextDate,
  onChangeDate,
  onChangeWeight,
  onChangeDrank,
  onSave,
}: Props) {
  return (
    <section className="panel p-4">
      <h2 className="text-lg font-bold">기록 입력</h2>
      <p className="mt-1 text-sm muted">오늘: {todayISO} (Asia/Seoul)</p>
      <p className="mt-1 text-sm text-slate-600">
        선택 날짜: {formatISOWithWeekdayKorean(selectedDate)}
      </p>
      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto] md:items-end">
        <label>
          <span className="mb-1 block text-sm text-slate-600">기록 날짜</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="field"
          />
        </label>
        <button
          type="button"
          onClick={onPreviousDate}
          className="btn-soft px-3 py-3 text-sm"
        >
          이전날
        </button>
        <button
          type="button"
          onClick={onNextDate}
          className="btn-soft px-3 py-3 text-sm"
        >
          다음날
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-sm text-slate-600">몸무게 (kg)</span>
          <input
            value={weightInput}
            onChange={(e) => onChangeWeight(e.target.value)}
            inputMode="decimal"
            placeholder="예: 72.3"
            className="field text-lg"
          />
        </label>
        <label className="inline-flex items-center gap-2 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={drank}
            onChange={(e) => onChangeDrank(e.target.checked)}
            className="h-4 w-4"
          />
          음주함
        </label>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="btn-primary px-5 py-3 text-base"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </section>
  );
}

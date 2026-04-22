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
    <section className="rounded-2xl bg-card p-4 shadow-soft">
      <h2 className="font-jua text-lg text-ink">기록 입력</h2>
      <p className="mt-1 font-gaegu text-sm text-ink-soft">오늘: {todayISO} (Asia/Seoul)</p>
      <p className="mt-1 font-gaegu text-sm text-ink-soft">
        선택 날짜: {formatISOWithWeekdayKorean(selectedDate)}
      </p>
      <div className="mt-3 flex items-end gap-2">
        <label className="min-w-0 flex-1">
          <span className="mb-1 block font-gaegu text-sm text-ink-soft">기록 날짜</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="date-input w-full rounded-xl border border-ink/15 bg-card-alt px-3 py-3 text-ink"
          />
        </label>
        <button
          type="button"
          onClick={onPreviousDate}
          className="rounded-xl border border-ink/15 bg-card-alt px-3 py-3 font-gaegu text-sm text-ink"
        >
          이전날
        </button>
        <button
          type="button"
          onClick={onNextDate}
          className="rounded-xl border border-ink/15 bg-card-alt px-3 py-3 font-gaegu text-sm text-ink"
        >
          다음날
        </button>
      </div>
      <div className="mt-4 flex items-end gap-3">
        <label className="flex-1">
          <span className="mb-1 block font-gaegu text-sm text-ink-soft">몸무게 (kg)</span>
          <input
            value={weightInput}
            onChange={(e) => onChangeWeight(e.target.value)}
            inputMode="decimal"
            placeholder="예: 72.3"
            className="w-full rounded-xl border border-ink/15 bg-card-alt px-4 py-3 text-lg text-ink"
          />
        </label>
        <label className="inline-flex items-center gap-2 pb-3 font-gaegu text-sm text-ink-soft">
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
          className="rounded-pill bg-duck px-5 py-3 font-jua text-base text-ink disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </section>
  );
}

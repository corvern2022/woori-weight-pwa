import { formatDelta } from "@/lib/date";

type Props = {
  vsYesterday: number | null;
  vsWeek: number | null;
};

export function DeltaStats({ vsYesterday, vsWeek }: Props) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-soft">
      <h2 className="font-jua text-lg text-ink">증감량 (나 기준)</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-card-alt p-3">
          <p className="font-gaegu text-sm text-ink-soft">전일 대비</p>
          <p className="mt-1 font-jua text-xl text-dolphin">{formatDelta(vsYesterday)}</p>
        </div>
        <div className="rounded-xl bg-card-alt p-3">
          <p className="font-gaegu text-sm text-ink-soft">전주 대비</p>
          <p className="mt-1 font-jua text-xl text-dolphin">{formatDelta(vsWeek)}</p>
        </div>
      </div>
    </section>
  );
}

import { formatDelta } from "@/lib/date";

type Props = {
  vsYesterday: number | null;
  vsWeek: number | null;
};

export function DeltaStats({ vsYesterday, vsWeek }: Props) {
  return (
    <section className="panel p-4">
      <h2 className="text-lg font-bold">증감량 (나 기준)</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm muted">전일 대비</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight">{formatDelta(vsYesterday)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm muted">전주 대비</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight">{formatDelta(vsWeek)}</p>
        </div>
      </div>
    </section>
  );
}

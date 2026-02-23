"use client";

import { useMemo, useState } from "react";
import { addDaysISO, toSeoulISODate } from "@/lib/date";
import type { HouseholdMember, WeighInRow } from "@/lib/types";

type Props = {
  rows: WeighInRow[];
  members: HouseholdMember[];
  meId: string;
};

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

function endOfMonth(iso: string): string {
  const [y, m] = iso.slice(0, 7).split("-").map(Number);
  const end = new Date(Date.UTC(y, m, 0));
  return end.toISOString().slice(0, 10);
}

function weekdayIndex(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function toMonthLabel(iso: string): string {
  const [y, m] = iso.slice(0, 7).split("-");
  return `${y}년 ${m}월`;
}

export function AlcoholCalendarCard({ rows, members, meId }: Props) {
  const [open, setOpen] = useState(false);
  const [monthISO, setMonthISO] = useState(() => toSeoulISODate());

  const me = members.find((m) => m.user_id === meId) ?? null;
  const partner = members.find((m) => m.user_id !== meId) ?? null;

  const drankMap = useMemo(() => {
    const map = new Map<string, { me: boolean; partner: boolean }>();
    rows.forEach((row) => {
      if (!row.drank) return;
      const prev = map.get(row.date) ?? { me: false, partner: false };
      if (row.user_id === meId) {
        prev.me = true;
      } else {
        prev.partner = true;
      }
      map.set(row.date, prev);
    });
    return map;
  }, [meId, rows]);

  const monthStats = useMemo(() => {
    const key = monthKey(monthISO);
    let meCount = 0;
    let partnerCount = 0;

    rows.forEach((row) => {
      if (!row.drank) return;
      if (monthKey(row.date) !== key) return;
      if (row.user_id === meId) meCount += 1;
      else partnerCount += 1;
    });

    return { meCount, partnerCount, total: meCount + partnerCount };
  }, [meId, monthISO, rows]);

  const grid = useMemo(() => {
    const start = startOfMonth(monthISO);
    const end = endOfMonth(monthISO);
    const firstPad = weekdayIndex(start);

    const list: Array<{ date: string; inMonth: boolean }> = [];

    for (let i = 0; i < firstPad; i += 1) {
      list.push({ date: addDaysISO(start, -(firstPad - i)), inMonth: false });
    }

    let cursor = start;
    while (cursor <= end) {
      list.push({ date: cursor, inMonth: true });
      cursor = addDaysISO(cursor, 1);
    }

    while (list.length % 7 !== 0) {
      const last = list.at(-1)?.date ?? end;
      list.push({ date: addDaysISO(last, 1), inMonth: false });
    }

    return list;
  }, [monthISO]);

  return (
    <section className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">음주 달력</h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          달력 바로가기
        </button>
      </div>

      <p className="mt-2 text-sm text-slate-600">
        이번 달 음주 횟수: {me?.display_name ?? "나"} {monthStats.meCount}회
        {partner ? ` / ${partner.display_name} ${monthStats.partnerCount}회` : ""} / 합계 {monthStats.total}회
      </p>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-10 w-full max-w-md rounded-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                onClick={() => setMonthISO((prev) => addDaysISO(startOfMonth(prev), -1))}
              >
                이전달
              </button>
              <p className="text-base font-semibold">{toMonthLabel(monthISO)}</p>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                onClick={() => setMonthISO((prev) => addDaysISO(endOfMonth(prev), 1))}
              >
                다음달
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <div key={d} className="py-1 font-semibold">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {grid.map((cell) => {
                const drank = drankMap.get(cell.date) ?? { me: false, partner: false };
                return (
                  <div
                    key={cell.date}
                    className={`min-h-14 rounded-lg border p-1 ${
                      cell.inMonth ? "border-slate-200 bg-white" : "border-transparent bg-slate-50 text-slate-300"
                    }`}
                  >
                    <div className="text-xs">{Number(cell.date.slice(8, 10))}</div>
                    <div className="mt-1 flex items-center gap-1">
                      <span
                        title={me?.display_name ?? "나"}
                        className={`inline-block h-3 w-3 rounded-full border ${
                          drank.me ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white"
                        }`}
                      />
                      {partner ? (
                        <span
                          title={partner.display_name}
                          className={`inline-block h-3 w-3 rounded-full border ${
                            drank.partner ? "border-rose-500 bg-rose-500" : "border-slate-300 bg-white"
                          }`}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
              <p>파란 원: {me?.display_name ?? "나"} 음주</p>
              {partner ? <p>빨간 원: {partner.display_name} 음주</p> : null}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white"
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

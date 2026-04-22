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
        <h2 className="font-jua text-ink text-lg">음주 달력</h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-peach text-ink font-jua rounded-full px-4 py-1.5 text-sm shadow-soft"
        >
          달력 바로가기
        </button>
      </div>

      <p className="mt-2 font-gaegu text-ink-soft text-sm">
        이번 달:{" "}
        <span className="font-jua text-ink">{me?.display_name ?? "나"}</span>{" "}
        <span className="font-jua text-peach-deep">{monthStats.meCount}회</span>
        {partner ? (
          <>
            {" / "}
            <span className="font-jua text-ink">{partner.display_name}</span>{" "}
            <span className="font-jua text-dolphin-soft">{monthStats.partnerCount}회</span>
          </>
        ) : null}
        {" / 합계 "}
        <span className="font-jua text-ink">{monthStats.total}회</span>
      </p>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-10 w-full max-w-md rounded-3xl bg-card p-4 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-ink-soft hover:text-ink px-3 py-1.5 text-sm transition-colors"
                onClick={() => setMonthISO((prev) => addDaysISO(startOfMonth(prev), -1))}
              >
                ‹ 이전달
              </button>
              <p className="font-jua text-ink text-base">{toMonthLabel(monthISO)}</p>
              <button
                type="button"
                className="text-ink-soft hover:text-ink px-3 py-1.5 text-sm transition-colors"
                onClick={() => setMonthISO((prev) => addDaysISO(endOfMonth(prev), 1))}
              >
                다음달 ›
              </button>
            </div>

            {/* Day headers */}
            <div className="mt-3 grid grid-cols-7 gap-1 text-center">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <div key={d} className="py-1 font-gaegu text-ink-mute text-xs">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {grid.map((cell) => {
                const drank = drankMap.get(cell.date) ?? { me: false, partner: false };
                const bothDrank = drank.me && drank.partner;
                const cellBg = !cell.inMonth
                  ? "bg-transparent"
                  : bothDrank
                  ? "bg-duck-soft"
                  : drank.me
                  ? "bg-peach"
                  : drank.partner
                  ? "bg-dolphin-soft"
                  : "bg-bg";

                return (
                  <div
                    key={cell.date}
                    className={`min-h-12 rounded-xl p-1 ${cellBg} ${
                      cell.inMonth ? "" : "opacity-30"
                    }`}
                  >
                    <div className={`font-gaegu text-xs ${cell.inMonth ? "text-ink" : "text-ink-mute"}`}>
                      {Number(cell.date.slice(8, 10))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 rounded-2xl bg-card-alt p-3 shadow-soft">
              <div className="flex flex-wrap gap-3 font-gaegu text-ink-soft text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-peach" />
                  {me?.display_name ?? "나"} 음주
                </span>
                {partner ? (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-full bg-dolphin-soft" />
                    {partner.display_name} 음주
                  </span>
                ) : null}
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-duck-soft" />
                  둘 다 음주
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-2xl bg-peach py-2.5 font-jua text-ink text-sm shadow-soft"
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

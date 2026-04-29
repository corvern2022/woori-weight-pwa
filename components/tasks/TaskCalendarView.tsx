"use client";

import { useMemo, useState } from "react";
import type { Task } from "./types";
import { toSeoulISODate } from "@/lib/date";

type Props = {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onToggle: (id: string, completed: boolean) => void;
};

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) grid.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) grid.push(new Date(year, month, d));
  return grid;
}

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export function TaskCalendarView({ tasks, onTaskClick, onToggle }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    toSeoulISODate(today)
  );
  const [showCompleted, setShowCompleted] = useState(true);

  const grid = buildMonthGrid(viewYear, viewMonth);
  const todayStr = toSeoulISODate(today);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (t.due_date) {
        if (!map[t.due_date]) map[t.due_date] = [];
        map[t.due_date].push(t);
      }
    });
    return map;
  }, [tasks]);

  const noDateTasks = tasks.filter(t => !t.due_date && !t.completed);
  const selectedTasksAll = selectedDate ? (tasksByDate[selectedDate] ?? []) : [];
  const selectedTasks = showCompleted ? selectedTasksAll : selectedTasksAll.filter(t => !t.completed);

  function goPrev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function goNext() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function dateStr(d: Date): string {
    return toSeoulISODate(d);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 18px 8px' }}>
        <button
          onClick={goPrev}
          style={{ minWidth: 44, minHeight: 44, border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >‹</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 16 }}>
            {viewYear}년 {viewMonth + 1}월
          </div>
          <button
            onClick={() => setShowCompleted(v => !v)}
            style={{
              fontSize: 11, fontFamily: 'var(--font-main)', border: 'none', cursor: 'pointer', borderRadius: 100,
              background: showCompleted ? 'var(--accent-soft)' : 'var(--bg-deep)',
              color: showCompleted ? 'var(--accent-deep)' : 'var(--ink-mute)',
              padding: '3px 9px', lineHeight: 1.4,
            }}
          >{showCompleted ? '완료 포함' : '미완료만'}</button>
        </div>
        <button
          onClick={goNext}
          style={{ minWidth: 44, minHeight: 44, border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px', gap: 2 }}>
        {WEEK_DAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontFamily: 'var(--font-main)', fontWeight: 700,
            fontSize: 12, color: 'var(--ink-mute)', paddingBottom: 4,
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px', gap: 2 }}>
        {grid.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const ds = dateStr(d);
          const dayTasks = tasksByDate[ds] ?? [];
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDate;
          const isPast = ds < todayStr;
          const hasOverdue = dayTasks.some(t => !t.completed && isPast);

          return (
            <button
              key={ds}
              onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
              style={{
                minHeight: 52,
                borderRadius: 12,
                border: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                background: isSelected
                  ? 'var(--accent-soft)'
                  : isToday
                  ? 'var(--card)'
                  : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                padding: '6px 2px',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-main)',
                fontWeight: isToday ? 800 : 400,
                fontSize: 15,
                color: isToday
                  ? 'var(--accent-deep)'
                  : isPast && !isSelected
                  ? 'var(--ink-mute)'
                  : 'var(--ink)',
              }}>
                {d.getDate()}
              </span>
              {dayTasks.length > 0 && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {dayTasks.slice(0, 3).map((t, ti) => (
                    <div key={ti} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: t.completed
                        ? 'var(--mint-deep)'
                        : hasOverdue && !t.completed && isPast
                        ? 'var(--peach-deep)'
                        : 'var(--accent)',
                    }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date tasks */}
      {selectedDate && (
        <div style={{ padding: '12px 18px 0' }}>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14, color: 'var(--ink-soft)', marginBottom: 8 }}>
            {selectedDate.slice(5).replace('-', '/')} 할 일
            {selectedTasks.length === 0 && <span style={{ color: 'var(--ink-mute)', fontWeight: 400 }}> — 없음</span>}
          </div>
          {selectedTasks.map(t => (
            <CalendarTaskRow
              key={t.id}
              t={t}
              onOpen={() => onTaskClick(t.id)}
              onToggle={() => onToggle(t.id, t.completed)}
            />
          ))}
        </div>
      )}

      {/* Tasks without due date */}
      {noDateTasks.length > 0 && (
        <div style={{ padding: '12px 18px 0' }}>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14, color: 'var(--ink-mute)', marginBottom: 8 }}>
            📌 날짜 없음 ({noDateTasks.length})
          </div>
          {noDateTasks.map(t => (
            <CalendarTaskRow
              key={t.id}
              t={t}
              onOpen={() => onTaskClick(t.id)}
              onToggle={() => onToggle(t.id, t.completed)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarTaskRow({ t, onOpen, onToggle }: { t: Task; onOpen: () => void; onToggle: () => void }) {
  const whoEmoji = t.assignee === '창희' ? '🦆' : t.assignee === '하경' ? '🐬' : '💞';
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 0', borderBottom: '1px solid var(--border-soft)',
      }}
    >
      <button
        onClick={e => { e.stopPropagation(); onToggle(); }}
        style={{
          width: 44, height: 44, borderRadius: 22, border: 'none',
          background: 'transparent', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 11,
          background: t.completed ? 'var(--accent)' : 'transparent',
          border: t.completed ? 'none' : '2px solid var(--ink-mute)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {t.completed && (
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M2 5l2 2 4-5" />
            </svg>
          )}
        </div>
      </button>
      <button
        onClick={onOpen}
        style={{
          flex: 1, background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', padding: '4px 0', minHeight: 44,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-main)', fontSize: 15, color: t.completed ? 'var(--ink-mute)' : 'var(--ink)',
          textDecoration: t.completed ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {t.title}
        </span>
        <span style={{ fontFamily: 'var(--font-main)', fontSize: 11, color: 'var(--ink-mute)' }}>
          {whoEmoji} {t.assignee}
        </span>
      </button>
    </div>
  );
}

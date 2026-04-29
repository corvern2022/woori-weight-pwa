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

  // Format selected date label
  const selectedLabel = (() => {
    if (!selectedDate) return '';
    const d = new Date(selectedDate + 'T00:00:00');
    const mm = d.getMonth() + 1;
    const dd = d.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[d.getDay()];
    return `${mm}월 ${dd}일 (${dayName})`;
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 8px 10px' }}>
        <button
          onClick={goPrev}
          style={{
            width: 40, height: 40, borderRadius: 20, border: 'none',
            background: 'var(--card-alt)', cursor: 'pointer',
            color: 'var(--ink-soft)', fontSize: 18, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-soft)',
          }}
        >‹</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 17, color: 'var(--ink)', letterSpacing: -0.4 }}>
            {viewYear}년 {viewMonth + 1}월
          </span>
          <button
            onClick={() => setShowCompleted(v => !v)}
            style={{
              fontSize: 11, fontFamily: 'var(--font-main)', fontWeight: 600,
              border: 'none', cursor: 'pointer', borderRadius: 100,
              background: showCompleted ? 'var(--accent-soft)' : 'var(--bg-deep)',
              color: showCompleted ? 'var(--accent-deep)' : 'var(--ink-mute)',
              padding: '4px 10px', lineHeight: 1.4, letterSpacing: -0.2,
            }}
          >{showCompleted ? '완료 포함' : '미완료만'}</button>
        </div>

        <button
          onClick={goNext}
          style={{
            width: 40, height: 40, borderRadius: 20, border: 'none',
            background: 'var(--card-alt)', cursor: 'pointer',
            color: 'var(--ink-soft)', fontSize: 18, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-soft)',
          }}
        >›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 10px', gap: 3, marginBottom: 4 }}>
        {WEEK_DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontFamily: 'var(--font-main)', fontWeight: 700,
            fontSize: 11, letterSpacing: 0.5,
            color: i === 6 ? 'var(--peach-deep)' : i === 5 ? 'var(--dolphin-deep)' : 'var(--ink-mute)',
            paddingBottom: 6,
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 10px', gap: 3 }}>
        {grid.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const ds = dateStr(d);
          const dayTasks = tasksByDate[ds] ?? [];
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDate;
          const isPast = ds < todayStr;
          const allDone = dayTasks.length > 0 && dayTasks.every(t => t.completed);
          const hasOverdue = dayTasks.some(t => !t.completed && isPast);
          const pendingCount = dayTasks.filter(t => !t.completed).length;
          const doneCount = dayTasks.filter(t => t.completed).length;
          const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat

          return (
            <button
              key={ds}
              onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
              style={{
                minHeight: 58,
                borderRadius: 14,
                border: 'none',
                background: isSelected
                  ? 'var(--accent-deep)'
                  : isToday
                  ? 'var(--accent-soft)'
                  : dayTasks.length > 0
                  ? 'var(--card)'
                  : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '7px 2px',
                boxShadow: (isSelected || isToday || dayTasks.length > 0) ? 'var(--shadow-soft)' : 'none',
                transition: 'background 0.15s, box-shadow 0.15s',
              }}
            >
              {/* Date number */}
              <span style={{
                fontFamily: 'var(--font-main)',
                fontWeight: isToday || isSelected ? 800 : 500,
                fontSize: 14,
                lineHeight: 1,
                color: isSelected
                  ? '#fff'
                  : isToday
                  ? 'var(--accent-deep)'
                  : dayOfWeek === 0
                  ? 'var(--peach-deep)'
                  : dayOfWeek === 6
                  ? 'var(--dolphin-deep)'
                  : isPast
                  ? 'var(--ink-mute)'
                  : 'var(--ink)',
              }}>
                {d.getDate()}
              </span>

              {/* Task indicator */}
              {dayTasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {/* Count badge */}
                  {allDone ? (
                    <div style={{
                      fontSize: 9, fontFamily: 'var(--font-main)', fontWeight: 700,
                      background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--mint)',
                      color: isSelected ? '#fff' : 'var(--mint-deep)',
                      borderRadius: 8, padding: '1px 5px', lineHeight: 1.4,
                    }}>✓{dayTasks.length}</div>
                  ) : hasOverdue ? (
                    <div style={{
                      fontSize: 9, fontFamily: 'var(--font-main)', fontWeight: 700,
                      background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--peach-soft)',
                      color: isSelected ? '#fff' : 'var(--peach-deep)',
                      borderRadius: 8, padding: '1px 5px', lineHeight: 1.4,
                    }}>{pendingCount}건</div>
                  ) : (
                    <div style={{ display: 'flex', gap: 2 }}>
                      {pendingCount > 0 && (
                        <div style={{
                          fontSize: 9, fontFamily: 'var(--font-main)', fontWeight: 700,
                          background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--accent-soft)',
                          color: isSelected ? '#fff' : 'var(--accent-deep)',
                          borderRadius: 8, padding: '1px 5px', lineHeight: 1.4,
                        }}>{pendingCount}</div>
                      )}
                      {doneCount > 0 && !isSelected && (
                        <div style={{
                          fontSize: 9, fontFamily: 'var(--font-main)', fontWeight: 700,
                          background: 'var(--mint)',
                          color: 'var(--mint-deep)',
                          borderRadius: 8, padding: '1px 5px', lineHeight: 1.4,
                        }}>✓{doneCount}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date task section */}
      {selectedDate && (
        <div style={{ marginTop: 16, padding: '0 14px' }}>
          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 15,
                color: 'var(--ink)', letterSpacing: -0.3,
              }}>{selectedLabel}</div>
              {selectedTasks.length > 0 && (
                <div style={{
                  fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 11,
                  background: 'var(--accent-soft)', color: 'var(--accent-deep)',
                  borderRadius: 100, padding: '2px 8px',
                }}>{selectedTasks.length}개</div>
              )}
            </div>
          </div>

          {selectedTasks.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '22px 0',
              fontFamily: 'var(--font-main)', fontSize: 13,
              color: 'var(--ink-mute)', letterSpacing: -0.2,
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📅</div>
              이 날은 할 일이 없어요
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
        </div>
      )}

      {/* Tasks without due date */}
      {noDateTasks.length > 0 && (
        <div style={{ marginTop: 16, padding: '0 14px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 10,
          }}>
            <div style={{
              fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 15,
              color: 'var(--ink-soft)', letterSpacing: -0.3,
            }}>📌 날짜 미정</div>
            <div style={{
              fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 11,
              background: 'var(--bg-deep)', color: 'var(--ink-mute)',
              borderRadius: 100, padding: '2px 8px',
            }}>{noDateTasks.length}개</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {noDateTasks.map(t => (
              <CalendarTaskRow
                key={t.id}
                t={t}
                onOpen={() => onTaskClick(t.id)}
                onToggle={() => onToggle(t.id, t.completed)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom spacer */}
      <div style={{ height: 20 }} />
    </div>
  );
}

function CalendarTaskRow({ t, onOpen, onToggle }: { t: Task; onOpen: () => void; onToggle: () => void }) {
  const whoEmoji = t.assignee === '창희' ? '🦆' : t.assignee === '하경' ? '🐬' : '💞';
  const accentColor = t.assignee === '창희' ? 'var(--duck-deep)' : t.assignee === '하경' ? 'var(--dolphin-deep)' : 'var(--accent-deep)';

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        background: 'var(--card)',
        borderRadius: 14,
        boxShadow: 'var(--shadow-soft)',
        borderLeft: `3px solid ${t.completed ? 'var(--mint-deep)' : accentColor}`,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={e => { e.stopPropagation(); onToggle(); }}
        style={{
          width: 36, height: 36, borderRadius: 18, border: 'none',
          background: 'transparent', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0,
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 11,
          background: t.completed ? 'var(--accent)' : 'transparent',
          border: t.completed ? 'none' : '2px solid var(--ink-mute)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {t.completed && (
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M2 5l2 2 4-5" />
            </svg>
          )}
        </div>
      </button>

      {/* Task info */}
      <button
        onClick={onOpen}
        style={{
          flex: 1, background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', padding: 0, minHeight: 36,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-main)', fontSize: 14, fontWeight: t.completed ? 400 : 600,
          color: t.completed ? 'var(--ink-mute)' : 'var(--ink)',
          textDecoration: t.completed ? 'line-through' : 'none',
          letterSpacing: -0.2,
          display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {t.title}
        </span>
        <span style={{
          fontFamily: 'var(--font-main)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: -0.1,
        }}>
          {whoEmoji} {t.assignee ?? '모두'}
        </span>
      </button>

      {/* Arrow */}
      <span style={{ color: 'var(--ink-mute)', fontSize: 14, flexShrink: 0, marginRight: 2 }}>›</span>
    </div>
  );
}

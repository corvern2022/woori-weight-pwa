"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { TaskCalendarView } from "./TaskCalendarView";
import { useTasks } from "./useTasks";
import { Task } from "./types";
import { CloudDeco, Confetti } from "@/components/ui";
import { Dolphin } from "@/components/characters/Dolphin";

type Filter = '전체' | '미완료' | '완료';
type ViewMode = 'calendar' | 'list';

const FILTERS: Filter[] = ['전체', '미완료', '완료'];

function filterTasks(tasks: Task[], filter: Filter): Task[] {
  if (filter === '전체') return tasks;
  if (filter === '미완료') return tasks.filter(t => !t.completed);
  if (filter === '완료') return tasks.filter(t => t.completed);
  return tasks;
}

export function TasksClient() {
  const {
    tasks, eventsByTask, loading, toast,
    addTask, updateTask, toggleDone,
  } = useTasks();

  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('미완료');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  function handleToggleDone(id: string, current: boolean) {
    toggleDone(id, current);
    if (!current) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
  }

  const visible = filterTasks(tasks, filter);
  const doneCount = tasks.filter(t => t.completed).length;
  const openCount = tasks.filter(t => !t.completed).length;

  // Count badges per filter tab
  const filterCounts: Record<Filter, number> = {
    '전체': tasks.length,
    '미완료': openCount,
    '완료': doneCount,
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <CloudDeco style={{ position: 'absolute', top: 40, right: -40 }} size={100} opacity={0.5} />

      {/* Header */}
      <div style={{ padding: '54px 22px 12px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 28, letterSpacing: -0.5 }}>할 일</div>
            <div style={{ fontFamily: 'var(--font-main)', fontSize: 13, color: 'var(--ink-soft)' }}>{openCount === 0 ? '다 했다! 🎉' : `${openCount}개 남음`}</div>
          </div>
          {/* View toggle */}
          <button
            onClick={() => setViewMode(m => m === 'calendar' ? 'list' : 'calendar')}
            style={{
              minHeight: 44, minWidth: 44, borderRadius: 14, border: 'none',
              background: 'var(--card)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)', fontSize: 20,
            }}
            aria-label={viewMode === 'calendar' ? '목록 보기' : '달력 보기'}
          >
            {viewMode === 'calendar' ? '☰' : '📅'}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--duck)', display: 'inline-block', animation: 'bounce 0.6s infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
          <TaskCalendarView
            tasks={tasks}
            onTaskClick={id => router.push(`/tasks/${id}`)}
            onToggle={(id, completed) => handleToggleDone(id, completed)}
          />
        </div>
      ) : (
        <>
          {/* Filter tabs */}
          <div style={{ position: 'relative' }}>
            <div role="tablist" className="no-scrollbar" style={{ display: 'flex', gap: 6, padding: '4px 18px 12px', overflowX: 'auto' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 12px', borderRadius: 100, border: 'none', cursor: 'pointer',
                    background: filter === f ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))' : 'var(--card)',
                    color: filter === f ? '#fff' : 'var(--ink-soft)',
                    fontFamily: 'var(--font-main)', fontSize: 13,
                    boxShadow: filter === f ? '0 4px 12px rgba(0,0,0,0.18)' : 'var(--shadow-soft)',
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap',
                  }}
                >
                  {f === '미완료' && '⬜'}{f === '완료' && '✅'} {f}
                  {filterCounts[f] > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: 16, height: 16, borderRadius: 8, padding: '0 3px',
                      background: filter === f ? 'rgba(255,255,255,0.28)' : 'var(--accent-soft)',
                      color: filter === f ? '#fff' : 'var(--accent-deep)',
                      fontSize: 10, fontFamily: 'var(--font-main)', lineHeight: 1,
                    }}>{filterCounts[f]}</span>
                  )}
                </button>
              ))}
            </div>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 32, height: '100%', background: 'linear-gradient(to right, transparent, var(--bg))', pointerEvents: 'none' }} />
          </div>

          <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 18px calc(80px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visible.map(t => (
              <TaskCard
                key={t.id}
                t={t}
                events={eventsByTask[t.id] || []}
                onOpen={() => router.push(`/tasks/${t.id}`)}
                onToggle={() => handleToggleDone(t.id, t.completed)}
              />
            ))}
            {visible.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-mute)', fontFamily: 'var(--font-main)', fontSize: 18 }}>
                <Dolphin size={70} variant="happy" palette="blue" />
                <div>여기엔 아무것도 없어!</div>
                {filter === '미완료' && (
                  <button
                    onClick={() => { setEditingTask(null); setFormOpen(true); }}
                    style={{
                      marginTop: 12, border: 'none', borderRadius: 100, cursor: 'pointer',
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                      color: '#fff', fontFamily: 'var(--font-main)', fontSize: 14,
                      padding: '10px 22px', boxShadow: 'var(--shadow-soft)',
                    }}
                  >+ 첫 할 일 추가하기</button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* FAB */}
      <button
        aria-label="새 할 일 추가"
        onClick={() => { setEditingTask(null); setFormOpen(true); }}
        style={{
          position: 'fixed',
          bottom: 'calc(68px + env(safe-area-inset-bottom))',
          right: 22,
          width: 52,
          height: 52,
          borderRadius: 26,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>

      <TaskForm
        open={formOpen}
        editing={editingTask}
        onClose={() => { setFormOpen(false); setEditingTask(null); }}
        onSubmit={addTask}
        onUpdate={updateTask}
      />

      {toast && (
        <div style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          left: '50%', transform: 'translateX(-50%)',
          background: 'var(--ink)', color: '#fff',
          fontSize: 14, borderRadius: 100,
          padding: '8px 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 100, whiteSpace: 'nowrap',
          fontFamily: 'var(--font-main)',
        }}>
          {toast}
        </div>
      )}

      <Confetti trigger={showConfetti} />
    </div>
  );
}

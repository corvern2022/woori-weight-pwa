"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { useTasks } from "./useTasks";
import { Task } from "./types";
import { BackBtn, CloudDeco, Confetti } from "@/components/ui";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";

type Filter = '전체' | '창희' | '하경' | '같이' | '완료';

const FILTERS: Filter[] = ['전체', '창희', '하경', '같이', '완료'];

function filterTasks(tasks: Task[], filter: Filter): Task[] {
  if (filter === '전체') return tasks.filter(t => !t.completed);
  if (filter === '창희') return tasks.filter(t => !t.completed && (t.assignee === '창희' || t.assignee === '둘다'));
  if (filter === '하경') return tasks.filter(t => !t.completed && (t.assignee === '하경' || t.assignee === '둘다'));
  if (filter === '같이') return tasks.filter(t => !t.completed && t.assignee === '둘다');
  if (filter === '완료') return tasks.filter(t => t.completed);
  return tasks;
}

export function TasksClient() {
  const {
    tasks, eventsByTask, loading, toast,
    addTask, updateTask, toggleDone,
  } = useTasks();

  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('전체');
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

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <CloudDeco style={{ position: 'absolute', top: 40, right: -40 }} size={100} opacity={0.5} />

      {/* Header */}
      <div style={{ padding: '54px 22px 12px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          <div>
            <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 30, letterSpacing: -0.5 }}>할 일</div>
            <div style={{ fontFamily: 'Gaegu, cursive', fontSize: 15, color: 'var(--ink-soft)' }}>{openCount === 0 ? '다 했다! 🎉' : `${doneCount}/${tasks.length} 완료 · 화이팅 🌊`}</div>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ transform: 'rotate(-10deg)' }}><Duck size={50} variant="strong" palette="yellow" /></div>
            <div style={{ transform: 'rotate(12deg) translateX(-6px)' }}><Dolphin size={56} variant="happy" palette="blue" /></div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div role="tablist" className="no-scrollbar" style={{ display: 'flex', gap: 8, padding: '4px 22px 12px', overflowX: 'auto' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              background: filter === f ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))' : 'var(--card)',
              color: filter === f ? '#fff' : 'var(--ink-soft)',
              fontFamily: 'Jua, sans-serif',
              fontSize: 15,
              boxShadow: filter === f ? '0 4px 12px rgba(0,0,0,0.18)' : 'var(--shadow-soft)',
              flexShrink: 0,
            }}
          >
            {f === '창희' && '🦆 '}{f === '하경' && '🐬 '}{f === '같이' && '💞 '}{f}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--duck)', display: 'inline-block', animation: 'bounce 0.6s infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : (
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
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-mute)', fontFamily: 'Gaegu, cursive', fontSize: 18 }}>
              <Dolphin size={70} variant="happy" palette="blue" />
              <div>여기엔 아무것도 없어!</div>
            </div>
          )}
        </div>
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
          fontFamily: 'Jua, sans-serif',
        }}>
          {toast}
        </div>
      )}

      <Confetti trigger={showConfetti} />
    </div>
  );
}

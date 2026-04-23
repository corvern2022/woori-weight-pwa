"use client";

import { Task, TaskEvent } from "./types";
import { WhoBadge } from "@/components/ui/WhoBadge";

type Props = {
  t: Task;
  events: TaskEvent[];
  onOpen: () => void;
  onToggle: () => void;
};

function dueLabel(dateStr: string | null): string {
  if (!dateStr) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "오늘";
  if (diff === 1) return "내일";
  if (diff === -1) return "어제";
  return dateStr;
}

export function TaskCard({ t, events, onOpen, onToggle }: Props) {
  const commentCount = events.filter((e) => e.event_type === "comment_added").length;
  const label = dueLabel(t.due_date);

  return (
    <div
      onClick={onOpen}
      style={{
        background: 'var(--card)',
        borderRadius: 20,
        boxShadow: 'var(--shadow-soft)',
        overflow: 'hidden',
        border: t.completed ? '1.5px solid var(--accent-soft)' : '1.5px solid transparent',
        cursor: 'pointer',
      }}
    >
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            marginTop: 2,
            background: t.completed ? 'linear-gradient(135deg, var(--mint), var(--mint-deep))' : 'transparent',
            boxShadow: t.completed ? '0 3px 8px rgba(0,0,0,0.18)' : 'inset 0 0 0 2.5px var(--ink-mute)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
        >
          {t.completed && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
              <path d="M3 8l3 3 6-6"/>
            </svg>
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <WhoBadge who={t.assignee} size="sm" />
            {t.category && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent-deep)', fontFamily: 'Jua, sans-serif' }}>
                {t.category}
              </span>
            )}
            {label && (
              <span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'Gaegu, cursive' }}>
                · {label}
              </span>
            )}
          </div>
          <div style={{
            fontFamily: 'Jua, sans-serif',
            fontSize: 17,
            color: t.completed ? 'var(--ink-mute)' : 'var(--ink)',
            textDecoration: t.completed ? 'line-through' : 'none',
          }}>
            {t.title}
          </div>
          {commentCount > 0 && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Gaegu, cursive', fontSize: 13, color: 'var(--accent)' }}>
              💬 댓글 {commentCount}개
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

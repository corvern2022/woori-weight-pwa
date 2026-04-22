"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "./useTasks";
import { TaskEvent } from "./types";
import { BackBtn, Avatar, WhoBadge } from "@/components/ui";

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

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function CommentBubble({ c }: { c: TaskEvent }) {
  const isDuck = c.actor === '창희';
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
      <Avatar who={isDuck ? '창희' : '하경'} size={30} />
      <div style={{ maxWidth: '80%' }}>
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 12, color: isDuck ? 'var(--duck-deep)' : 'var(--accent-deep)', marginBottom: 2 }}>
          {c.actor}{' '}
          <span style={{ color: 'var(--ink-mute)', fontFamily: 'Gaegu, cursive', marginLeft: 4 }}>
            {formatTime(c.created_at)}
          </span>
        </div>
        <div style={{ background: isDuck ? 'var(--duck-soft)' : 'var(--dolphin-soft)', borderRadius: 14, padding: '8px 12px', fontFamily: 'Gaegu, cursive', fontSize: 14, color: 'var(--ink)' }}>
          {String(c.payload?.text ?? '')}
        </div>
      </div>
    </div>
  );
}

interface Props {
  taskId: string;
}

export function TaskDetail({ taskId }: Props) {
  const router = useRouter();
  const { tasks, eventsByTask, loading, toggleDone, addComment } = useTasks();
  const [input, setInput] = useState("");

  const actor = typeof window !== "undefined"
    ? localStorage.getItem("ori_ranger_actor") || "하경"
    : "하경";

  const t = tasks.find(t => t.id === taskId);
  const events = (eventsByTask[taskId] || []).filter(e => e.event_type === "comment_added");

  async function send() {
    if (!input.trim() || !t) return;
    await addComment(taskId, input.trim(), actor);
    setInput("");
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100svh', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--duck)', display: 'inline-block', animation: 'bounce 0.6s infinite', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    );
  }

  if (!t) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Gaegu, cursive', color: 'var(--ink-mute)' }}>
        할 일을 찾을 수 없어요
        <br />
        <button onClick={() => router.push('/tasks')} style={{ marginTop: 16, fontFamily: 'Jua, sans-serif', background: 'var(--card)', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', color: 'var(--ink)' }}>돌아가기</button>
      </div>
    );
  }

  const label = dueLabel(t.due_date);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '54px 22px 12px' }}>
        <BackBtn label="할 일" onClick={() => router.push('/tasks')} />
        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <WhoBadge who={t.assignee} />
          {t.category && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent-deep)', fontFamily: 'Jua, sans-serif' }}>
              {t.category}
            </span>
          )}
          {label && (
            <span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'Gaegu, cursive' }}>· {label}</span>
          )}
        </div>
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 26, letterSpacing: -0.4, marginTop: 6, color: t.completed ? 'var(--ink-mute)' : 'var(--ink)', textDecoration: t.completed ? 'line-through' : 'none' }}>
          {t.title}
        </div>
        <button
          onClick={() => toggleDone(t.id, t.completed)}
          style={{
            marginTop: 10,
            background: t.completed ? 'var(--card)' : 'linear-gradient(135deg, var(--mint), var(--mint-deep))',
            color: t.completed ? 'var(--ink-soft)' : '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '10px 18px',
            fontFamily: 'Jua, sans-serif',
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          {t.completed ? '↺ 다시 열기' : '✓ 완료 표시'}
        </button>
      </div>

      {/* Comment count */}
      <div style={{ padding: '0 22px 8px', fontFamily: 'Jua, sans-serif', fontSize: 15, color: 'var(--ink-soft)' }}>
        댓글 {events.length}
      </div>

      {/* Comments */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 18px 12px' }}>
        {events.map(e => <CommentBubble key={e.id} c={e} />)}
        {events.length === 0 && (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--ink-mute)', fontFamily: 'Gaegu, cursive', fontSize: 14 }}>
            첫 댓글을 남겨봐 💬
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '0 16px 46px' }}>
        <div style={{ background: 'var(--card)', borderRadius: 22, padding: 8, display: 'flex', gap: 6, boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(42,61,84,0.08)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="댓글 달기..."
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Gaegu, cursive', fontSize: 15, color: 'var(--ink)', padding: '6px 12px' }}
          />
          <button
            onClick={send}
            style={{ border: 'none', background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', borderRadius: 16, padding: '8px 14px', cursor: 'pointer', color: '#fff', fontFamily: 'Jua, sans-serif', fontSize: 14 }}
          >
            보내기
          </button>
        </div>
      </div>
    </div>
  );
}

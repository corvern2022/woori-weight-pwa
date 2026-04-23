"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Task, TaskEvent } from "./types";
import { BackBtn, WhoBadge } from "@/components/ui";
import { getSupabaseClient } from "@/lib/supabase";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";

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
  if (diff < 0) return `${Math.abs(diff)}일 지남`;
  return `${diff}일 후`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const mo = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${mo}/${dd} ${h}:${m}`;
}

function CommentBubble({ c }: { c: TaskEvent }) {
  const isDuck = c.actor === '창희';
  return (
    <div style={{ display: 'flex', flexDirection: isDuck ? 'row' : 'row-reverse', gap: 8, marginBottom: 12, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0 }}>
        {isDuck
          ? <Duck size={32} variant="head" palette="yellow" />
          : <Dolphin size={32} variant="head" palette="blue" />
        }
      </div>
      <div style={{ maxWidth: '75%' }}>
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 11, color: isDuck ? 'var(--duck-deep)' : 'var(--accent-deep)', marginBottom: 3, textAlign: isDuck ? 'left' : 'right' }}>
          {c.actor} · {formatTime(c.created_at)}
        </div>
        <div style={{
          background: isDuck ? 'var(--duck-soft)' : 'var(--dolphin-soft)',
          borderRadius: isDuck ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
          padding: '10px 14px',
          fontFamily: 'Gaegu, cursive', fontSize: 15, color: 'var(--ink)',
          lineHeight: 1.4,
        }}>
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
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [actor, setActor] = useState("하경");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActor(localStorage.getItem("ori_ranger_actor") || "하경");
    }
  }, []);

  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient();
    const [{ data: taskData }, { data: evData }] = await Promise.all([
      supabase.from("tasks").select("*").eq("id", taskId).single(),
      supabase.from("task_events").select("*").eq("task_id", taskId).eq("event_type", "comment_added").order("created_at", { ascending: true }),
    ]);
    if (taskData) setTask(taskData as Task);
    setComments((evData || []) as TaskEvent[]);
    setLoading(false);
  }, [taskId]);

  useEffect(() => { loadData(); }, [loadData]);

  async function toggleDone() {
    if (!task) return;
    const supabase = getSupabaseClient();
    await supabase.from("tasks").update({ completed: !task.completed, completed_at: !task.completed ? new Date().toISOString() : null }).eq("id", taskId);
    setTask(t => t ? { ...t, completed: !t.completed } : t);
  }

  async function send() {
    if (!input.trim()) return;
    setSending(true);
    const supabase = getSupabaseClient();
    await supabase.from("task_events").insert([{
      task_id: taskId,
      event_type: "comment_added",
      actor,
      payload: { text: input.trim() },
    }]);
    setInput("");
    await loadData();
    setSending(false);
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

  if (!task) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Gaegu, cursive', color: 'var(--ink-mute)' }}>
        할 일을 찾을 수 없어요<br />
        <button onClick={() => router.push('/tasks')} style={{ marginTop: 16, fontFamily: 'Jua, sans-serif', background: 'var(--card)', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', color: 'var(--ink)' }}>돌아가기</button>
      </div>
    );
  }

  const label = dueLabel(task.due_date);

  return (
    <div style={{ width: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '54px 22px 16px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
        <BackBtn label="할 일" onClick={() => router.push('/tasks')} />

        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <WhoBadge who={task.assignee} />
          {task.category && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent-deep)', fontFamily: 'Jua, sans-serif' }}>
              {task.category}
            </span>
          )}
          {label && (
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 8, fontFamily: 'Gaegu, cursive',
              background: label.includes('지남') ? 'var(--peach-soft, #FFE8E0)' : label === '오늘' ? 'var(--mint)' : 'var(--bg-deep)',
              color: label.includes('지남') ? 'var(--peach-deep)' : label === '오늘' ? 'var(--mint-deep)' : 'var(--ink-soft)',
            }}>
              📅 {label}
            </span>
          )}
        </div>

        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 24, letterSpacing: -0.4, marginTop: 8, color: task.completed ? 'var(--ink-mute)' : 'var(--ink)', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: 1.3 }}>
          {task.title}
        </div>

        {task.description && (
          <div style={{ marginTop: 8, fontFamily: 'Gaegu, cursive', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            {task.description}
          </div>
        )}

        <button
          onClick={toggleDone}
          style={{
            marginTop: 14,
            background: task.completed ? 'var(--bg-deep)' : 'linear-gradient(135deg, var(--mint), var(--mint-deep))',
            color: task.completed ? 'var(--ink-soft)' : '#fff',
            border: 'none', borderRadius: 16, padding: '10px 20px',
            fontFamily: 'Jua, sans-serif', fontSize: 15, cursor: 'pointer',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          {task.completed ? '↺ 다시 열기' : '✓ 완료 표시'}
        </button>
      </div>

      {/* Actor selector */}
      <div style={{ padding: '12px 18px 4px', display: 'flex', gap: 8 }}>
        {(['창희', '하경'] as const).map(a => (
          <button
            key={a}
            onClick={() => {
              setActor(a);
              if (typeof window !== 'undefined') localStorage.setItem('ori_ranger_actor', a);
            }}
            style={{
              padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer',
              fontFamily: 'Jua, sans-serif', fontSize: 13,
              background: actor === a ? (a === '창희' ? 'var(--duck)' : 'var(--dolphin)') : 'var(--card)',
              color: actor === a && a === '하경' ? '#fff' : 'var(--ink)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            {a === '창희' ? '🦆 ' : '🐬 '}{a}로 댓글
          </button>
        ))}
      </div>

      {/* Comments */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 16px' }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-mute)', fontFamily: 'Gaegu, cursive', fontSize: 15 }}>
            첫 댓글을 남겨봐 💬
          </div>
        ) : (
          comments.map(c => <CommentBubble key={c.id} c={c} />)
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 16px 46px', background: 'var(--card)', borderTop: '1px solid rgba(42,61,84,0.08)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flexShrink: 0 }}>
            {actor === '창희'
              ? <Duck size={28} variant="head" palette="yellow" />
              : <Dolphin size={28} variant="head" palette="blue" />
            }
          </div>
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 20, padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center', border: '1.5px solid var(--accent-soft)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="댓글 달기..."
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Gaegu, cursive', fontSize: 15, color: 'var(--ink)' }}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              style={{
                border: 'none', borderRadius: 14, padding: '6px 14px',
                background: input.trim() ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))' : 'var(--ink-mute)',
                color: '#fff', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer',
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? '...' : '전송'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

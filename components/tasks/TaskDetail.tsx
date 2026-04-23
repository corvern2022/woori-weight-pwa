"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Task, TaskEvent, TaskItem } from "./types";
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

// ── Sub-task item row ─────────────────────────────────────────────────────────
function SubItem({
  item,
  onToggle,
  onUpdate,
  onDelete,
}: {
  item: TaskItem;
  onToggle: () => void;
  onUpdate: (content: string, dueDate: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const [editDue, setEditDue] = useState(item.due_date ?? "");
  const todayStr = new Date().toISOString().slice(0, 10);

  function save() {
    if (!editContent.trim()) return;
    onUpdate(editContent.trim(), editDue);
    setEditing(false);
  }

  const label = dueLabel(item.due_date);
  const isOverdue = item.due_date && item.due_date < todayStr && !item.done;

  if (editing) {
    return (
      <div style={{ padding: '8px 0 10px', borderBottom: '1px dashed var(--accent-soft)' }}>
        <input
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          autoFocus
          style={{
            width: '100%', fontFamily: 'Gaegu, cursive', fontSize: 15, border: '2px solid var(--accent)',
            borderRadius: 10, padding: '6px 10px', background: 'var(--bg)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
          <input
            type="date"
            value={editDue}
            onChange={e => setEditDue(e.target.value)}
            style={{ flex: 1, fontFamily: 'Jua, sans-serif', fontSize: 13, border: '1.5px solid var(--accent-soft)', borderRadius: 8, padding: '4px 8px', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
          />
          <button onClick={save} style={{ border: 'none', borderRadius: 8, background: 'var(--accent)', color: '#fff', padding: '5px 12px', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer' }}>저장</button>
          <button onClick={() => setEditing(false)} style={{ border: 'none', borderRadius: 8, background: 'var(--bg-deep)', color: 'var(--ink-soft)', padding: '5px 10px', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer' }}>취소</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0',
      borderBottom: '1px dashed var(--accent-soft)',
      opacity: item.done ? 0.55 : 1,
    }}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        style={{
          width: 44, height: 44, borderRadius: 22, background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          cursor: 'pointer', marginLeft: -10, marginTop: -8,
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: 5,
          background: item.done ? 'linear-gradient(135deg, var(--mint), var(--mint-deep))' : 'transparent',
          border: item.done ? 'none' : '2px solid var(--ink-mute)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {item.done && (
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 5l2 2 4-5" />
            </svg>
          )}
        </div>
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Jua, sans-serif', fontSize: 15, color: 'var(--ink)',
          textDecoration: item.done ? 'line-through' : 'none',
          lineHeight: 1.4,
        }}>
          {item.content}
        </div>
        {label && (
          <span style={{
            fontSize: 11, fontFamily: 'Jua, sans-serif',
            color: isOverdue ? 'var(--peach-deep)' : label === '오늘' ? 'var(--mint-deep)' : 'var(--ink-mute)',
          }}>
            📅 {label}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <button
          onClick={() => { setEditContent(item.content); setEditDue(item.due_date ?? ''); setEditing(true); }}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px 6px', fontSize: 14, color: 'var(--ink-mute)', borderRadius: 6 }}
        >✏️</button>
        <button
          onClick={onDelete}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px 6px', fontSize: 14, color: 'var(--peach-deep)', borderRadius: 6 }}
        >🗑️</button>
      </div>
    </div>
  );
}

// ── Comment bubble ────────────────────────────────────────────────────────────
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

// ── Main component ────────────────────────────────────────────────────────────
interface Props { taskId: string }

type InputMode = 'sub' | 'comment';

export function TaskDetail({ taskId }: Props) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [items, setItems] = useState<TaskItem[]>([]);
  const [comments, setComments] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [inputDue, setInputDue] = useState("");
  const [sending, setSending] = useState(false);
  const [actor, setActor] = useState("하경");
  const [mode, setMode] = useState<InputMode>('sub');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActor(localStorage.getItem("ori_ranger_actor") || "하경");
    }
  }, []);

  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient();
    const [{ data: taskData }, { data: itemData }, { data: evData }] = await Promise.all([
      supabase.from("tasks").select("*").eq("id", taskId).single(),
      supabase.from("task_items").select("*").eq("task_id", taskId).order("position", { ascending: true }).order("created_at", { ascending: true }),
      supabase.from("task_events").select("*").eq("task_id", taskId).eq("event_type", "comment_added").order("created_at", { ascending: true }),
    ]);
    if (taskData) setTask(taskData as Task);
    setItems((itemData || []) as TaskItem[]);
    setComments((evData || []) as TaskEvent[]);
    setLoading(false);
  }, [taskId]);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveTitle() {
    if (!task || !editTitle.trim()) return;
    await getSupabaseClient().from("tasks").update({ title: editTitle.trim() }).eq("id", taskId);
    setTask(t => t ? { ...t, title: editTitle.trim() } : t);
    setEditingTitle(false);
  }

  async function saveDesc() {
    if (!task) return;
    await getSupabaseClient().from("tasks").update({ description: editDesc.trim() || null }).eq("id", taskId);
    setTask(t => t ? { ...t, description: editDesc.trim() || null } : t);
    setEditingDesc(false);
  }

  async function toggleDone() {
    if (!task) return;
    await getSupabaseClient().from("tasks").update({ completed: !task.completed, completed_at: !task.completed ? new Date().toISOString() : null }).eq("id", taskId);
    setTask(t => t ? { ...t, completed: !t.completed } : t);
  }

  async function toggleItem(item: TaskItem) {
    const now = new Date().toISOString();
    await getSupabaseClient().from("task_items").update({ done: !item.done, done_at: !item.done ? now : null }).eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, done: !i.done } : i));
  }

  async function updateItem(item: TaskItem, content: string, dueDate: string) {
    const due = dueDate || null;
    await getSupabaseClient().from("task_items").update({ content, due_date: due }).eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, content, due_date: due } : i));
  }

  async function deleteItem(itemId: string) {
    await getSupabaseClient().from("task_items").delete().eq("id", itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
  }

  async function addSubTask() {
    if (!input.trim()) return;
    setSending(true);
    const position = items.length ? Math.max(...items.map(i => i.position)) + 1 : 0;
    const { data } = await getSupabaseClient().from("task_items").insert([{
      task_id: taskId,
      content: input.trim(),
      due_date: inputDue || null,
      position,
    }]).select().single();
    if (data) setItems(prev => [...prev, data as TaskItem]);
    setInput("");
    setInputDue("");
    setSending(false);
  }

  async function addComment() {
    if (!input.trim()) return;
    setSending(true);
    await getSupabaseClient().from("task_events").insert([{
      task_id: taskId, event_type: "comment_added", actor,
      payload: { text: input.trim() },
    }]);
    setInput("");
    await loadData();
    setSending(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  async function handleSend() {
    if (mode === 'sub') await addSubTask();
    else await addComment();
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
  const doneCount = items.filter(i => i.done).length;

  return (
    <div style={{ width: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
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
              background: label.includes('지남') ? '#FFE8E0' : label === '오늘' ? 'var(--mint)' : 'var(--bg-deep)',
              color: label.includes('지남') ? 'var(--peach-deep)' : label === '오늘' ? 'var(--mint-deep)' : 'var(--ink-soft)',
            }}>
              📅 {label}
            </span>
          )}
        </div>

        {/* Title */}
        {editingTitle ? (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
              autoFocus
              style={{ flex: 1, fontFamily: 'Jua, sans-serif', fontSize: 20, border: '2px solid var(--accent)', borderRadius: 12, padding: '6px 10px', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
            />
            <button onClick={saveTitle} style={{ border: 'none', borderRadius: 10, background: 'var(--accent)', color: '#fff', padding: '6px 12px', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer' }}>저장</button>
            <button onClick={() => setEditingTitle(false)} style={{ border: 'none', borderRadius: 10, background: 'var(--bg-deep)', color: 'var(--ink-soft)', padding: '6px 10px', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer' }}>✕</button>
          </div>
        ) : (
          <div onClick={() => { setEditTitle(task.title); setEditingTitle(true); }}
            style={{ fontFamily: 'Jua, sans-serif', fontSize: 24, letterSpacing: -0.4, marginTop: 8, color: task.completed ? 'var(--ink-mute)' : 'var(--ink)', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: 1.3, cursor: 'text' }}>
            {task.title} <span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>✏️</span>
          </div>
        )}

        {/* Description */}
        {editingDesc ? (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} autoFocus rows={2}
              style={{ fontFamily: 'Gaegu, cursive', fontSize: 15, border: '2px solid var(--accent)', borderRadius: 12, padding: '8px 10px', background: 'var(--bg)', color: 'var(--ink)', outline: 'none', resize: 'none' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={saveDesc} style={{ border: 'none', borderRadius: 10, background: 'var(--accent)', color: '#fff', padding: '6px 14px', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer' }}>저장</button>
              <button onClick={() => setEditingDesc(false)} style={{ border: 'none', borderRadius: 10, background: 'var(--bg-deep)', color: 'var(--ink-soft)', padding: '6px 10px', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer' }}>취소</button>
            </div>
          </div>
        ) : (
          <div onClick={() => { setEditDesc(task.description || ''); setEditingDesc(true); }}
            style={{ marginTop: 6, fontFamily: 'Gaegu, cursive', fontSize: 14, color: task.description ? 'var(--ink-soft)' : 'var(--ink-mute)', lineHeight: 1.5, cursor: 'text', minHeight: 20 }}>
            {task.description || <span style={{ opacity: 0.5 }}>설명 추가... ✏️</span>}
          </div>
        )}

        <button onClick={toggleDone} style={{
          marginTop: 12,
          background: task.completed ? 'var(--bg-deep)' : 'linear-gradient(135deg, var(--mint), var(--mint-deep))',
          color: task.completed ? 'var(--ink-soft)' : '#fff',
          border: 'none', borderRadius: 14, padding: '8px 18px',
          fontFamily: 'Jua, sans-serif', fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-soft)',
        }}>
          {task.completed ? '↺ 다시 열기' : '✓ 완료 표시'}
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 18px', paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>

        {/* Sub-tasks section */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 15, color: 'var(--ink)' }}>
              📋 하위 아젠다
            </div>
            {items.length > 0 && (
              <span style={{ fontFamily: 'Gaegu, cursive', fontSize: 12, color: 'var(--ink-soft)', background: 'var(--bg-deep)', borderRadius: 100, padding: '1px 8px' }}>
                {doneCount}/{items.length}
              </span>
            )}
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 18, padding: '0 14px', boxShadow: 'var(--shadow-soft)' }}>
            {items.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', fontFamily: 'Gaegu, cursive', fontSize: 13, color: 'var(--ink-mute)' }}>
                하위 아젠다가 없어요. 아래에서 추가해봐요!
              </div>
            ) : (
              items.map(item => (
                <SubItem
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem(item)}
                  onUpdate={(content, dueDate) => updateItem(item, content, dueDate)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Comments section */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>
            💬 댓글 {comments.length > 0 ? `(${comments.length})` : ''}
          </div>

          {/* Actor selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {(['창희', '하경'] as const).map(a => (
              <button key={a} onClick={() => {
                setActor(a);
                if (typeof window !== 'undefined') localStorage.setItem('ori_ranger_actor', a);
              }} style={{
                padding: '5px 12px', borderRadius: 100, border: 'none', cursor: 'pointer',
                fontFamily: 'Jua, sans-serif', fontSize: 12,
                background: actor === a ? (a === '창희' ? 'var(--duck)' : 'var(--dolphin)') : 'var(--card)',
                color: actor === a && a === '하경' ? '#fff' : 'var(--ink)',
                boxShadow: 'var(--shadow-soft)',
              }}>
                {a === '창희' ? '🦆 ' : '🐬 '}{a}
              </button>
            ))}
          </div>

          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink-mute)', fontFamily: 'Gaegu, cursive', fontSize: 14 }}>
              첫 댓글을 남겨봐 💬
            </div>
          ) : (
            comments.map(c => <CommentBubble key={c.id} c={c} />)
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Fixed input bar ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '8px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        background: 'var(--card)',
        borderTop: '1px solid rgba(42,61,84,0.08)',
        boxShadow: '0 -4px 20px rgba(47,149,196,0.08)',
      }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {([['sub', '📋 하위 아젠다'], ['comment', '💬 댓글']] as [InputMode, string][]).map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '4px 12px', border: 'none', borderRadius: 100, cursor: 'pointer',
              fontFamily: 'Jua, sans-serif', fontSize: 12,
              background: mode === m ? 'var(--accent)' : 'var(--bg-deep)',
              color: mode === m ? '#fff' : 'var(--ink-soft)',
            }}>{l}</button>
          ))}
        </div>

        {/* Date picker for sub mode */}
        {mode === 'sub' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontFamily: 'Gaegu, cursive', fontSize: 12, color: 'var(--ink-soft)', flexShrink: 0 }}>📅 마감일</span>
            <input type="date" value={inputDue} onChange={e => setInputDue(e.target.value)}
              style={{ flex: 1, fontFamily: 'Jua, sans-serif', fontSize: 13, border: '1.5px solid var(--accent-soft)', borderRadius: 8, padding: '4px 8px', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }} />
            {inputDue && <button onClick={() => setInputDue('')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-mute)' }}>✕</button>}
          </div>
        )}

        {/* Input row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {mode === 'comment' && (
            <div style={{ flexShrink: 0 }}>
              {actor === '창희'
                ? <Duck size={26} variant="head" palette="yellow" />
                : <Dolphin size={26} variant="head" palette="blue" />
              }
            </div>
          )}
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 18, padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center', border: '1.5px solid var(--accent-soft)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={mode === 'sub' ? '하위 아젠다 입력...' : '댓글 달기...'}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: mode === 'sub' ? 'Jua, sans-serif' : 'Gaegu, cursive', fontSize: 15, color: 'var(--ink)' }}
            />
            <button onClick={handleSend} disabled={sending || !input.trim()} style={{
              border: 'none', borderRadius: 12, padding: '5px 12px',
              background: input.trim() ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))' : 'var(--ink-mute)',
              color: '#fff', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer',
              opacity: sending ? 0.6 : 1,
            }}>
              {sending ? '...' : mode === 'sub' ? '추가' : '전송'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

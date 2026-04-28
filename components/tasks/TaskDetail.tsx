"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Task, TaskEvent, TaskItem } from "./types";
import { BackBtn, WhoBadge } from "@/components/ui";
import { getSupabaseClient } from "@/lib/supabase";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";
import { toSeoulISODate } from "@/lib/date";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const todayStr = toSeoulISODate();

  useEffect(() => {
    if (editing && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }, [editing]);

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
          ref={inputRef}
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          onKeyDown={e => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') { e.preventDefault(); save(); }
            if (e.key === 'Escape') setEditing(false);
          }}
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

const REACTION_EMOJIS = ['👍','❤️','🔥','😂','👏','🥹'];

// ── Comment bubble ────────────────────────────────────────────────────────────
function CommentBubble({ c, onReact }: { c: TaskEvent; onReact: (eventId: string, emoji: string) => void }) {
  const isDuck = c.actor === '창희';
  const reactions = (c.payload?.reactions ?? {}) as Record<string, string[]>;
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: isDuck ? 'row' : 'row-reverse', gap: 8, marginBottom: 14, alignItems: 'flex-start' }}>
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

        {/* 리액션 표시 + 추가 버튼 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5, justifyContent: isDuck ? 'flex-start' : 'flex-end', alignItems: 'center' }}>
          {REACTION_EMOJIS.filter(e => reactions[e]?.length > 0).map(e => (
            <button key={e} onClick={() => onReact(c.id, e)} style={{
              border: 'none', borderRadius: 100, padding: '2px 8px', cursor: 'pointer', fontSize: 13,
              background: 'var(--card)', boxShadow: 'var(--shadow-soft)',
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
              {e} <span style={{ fontFamily: 'Jua, sans-serif', fontSize: 11, color: 'var(--ink-soft)' }}>{reactions[e].length}</span>
            </button>
          ))}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowPicker(v => !v)} style={{
              border: 'none', borderRadius: 100, padding: '2px 8px', cursor: 'pointer', fontSize: 13,
              background: 'var(--bg-deep)', color: 'var(--ink-mute)',
            }}>＋</button>
            {showPicker && (
              <div style={{
                position: 'absolute', [isDuck ? 'left' : 'right']: 0, bottom: 30,
                background: 'var(--card)', borderRadius: 16, padding: '8px 10px',
                boxShadow: 'var(--shadow)', display: 'flex', gap: 6, zIndex: 100, whiteSpace: 'nowrap',
              }}>
                {REACTION_EMOJIS.map(e => (
                  <button key={e} onClick={() => { onReact(c.id, e); setShowPicker(false); }} style={{
                    border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, padding: '2px 4px',
                  }}>{e}</button>
                ))}
              </div>
            )}
          </div>
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
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [task, setTask] = useState<Task | null>(null);
  const [items, setItems] = useState<TaskItem[]>([]);
  const [comments, setComments] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [subInput, setSubInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [inputDue, setInputDue] = useState("");
  const [sending, setSending] = useState(false);
  const [actor, setActor] = useState("");
  const [mode, setMode] = useState<InputMode>('sub');
  const [showSubDate, setShowSubDate] = useState(false);
  const [deletedItem, setDeletedItem] = useState<TaskItem | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActor(localStorage.getItem("ori_ranger_actor") || "");
    }
  }, []);

  const loadData = useCallback(async () => {
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
    await supabase.from("tasks").update({ title: editTitle.trim() }).eq("id", taskId);
    setTask(t => t ? { ...t, title: editTitle.trim() } : t);
    setEditingTitle(false);
  }

  async function saveDesc() {
    if (!task) return;
    await supabase.from("tasks").update({ description: editDesc.trim() || null }).eq("id", taskId);
    setTask(t => t ? { ...t, description: editDesc.trim() || null } : t);
    setEditingDesc(false);
  }

  async function toggleDone() {
    if (!task) return;
    await supabase.from("tasks").update({ completed: !task.completed, completed_at: !task.completed ? new Date().toISOString() : null }).eq("id", taskId);
    setTask(t => t ? { ...t, completed: !t.completed } : t);
  }

  async function toggleItem(item: TaskItem) {
    const now = new Date().toISOString();
    await supabase.from("task_items").update({ done: !item.done, done_at: !item.done ? now : null }).eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, done: !i.done } : i));
  }

  async function updateItem(item: TaskItem, content: string, dueDate: string) {
    const due = dueDate || null;
    await supabase.from("task_items").update({ content, due_date: due }).eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, content, due_date: due } : i));
  }

  function deleteItem(item: TaskItem) {
    // 낙관적으로 즉시 UI에서 제거
    setItems(prev => prev.filter(i => i.id !== item.id));
    setDeletedItem(item);
    // 이전 타이머 취소
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    // 3초 후 실제 DB 삭제
    deleteTimerRef.current = setTimeout(async () => {
      await supabase.from("task_items").delete().eq("id", item.id);
      setDeletedItem(null);
    }, 3000);
  }

  function undoDelete() {
    if (!deletedItem) return;
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    setItems(prev => {
      const arr = [...prev, deletedItem];
      return arr.sort((a, b) => a.position - b.position);
    });
    setDeletedItem(null);
  }

  async function addSubTask() {
    if (!subInput.trim()) return;
    setSending(true);
    const position = items.length ? Math.max(...items.map(i => i.position)) + 1 : 0;
    const { data } = await supabase.from("task_items").insert([{
      task_id: taskId,
      content: subInput.trim(),
      due_date: inputDue || null,
      position,
    }]).select().single();
    if (data) setItems(prev => [...prev, data as TaskItem]);
    setSubInput("");
    setInputDue("");
    setSending(false);
  }

  async function addReaction(eventId: string, emoji: string) {
    const target = comments.find(c => c.id === eventId);
    if (!target) return;
    const reactions = ((target.payload?.reactions ?? {}) as Record<string, string[]>);
    const users = reactions[emoji] ?? [];
    const myName = actor;
    const next = users.includes(myName)
      ? users.filter(u => u !== myName)
      : [...users, myName];
    const newReactions = { ...reactions, [emoji]: next };
    const newPayload = { ...target.payload, reactions: newReactions };
    await supabase.from('task_events').update({ payload: newPayload }).eq('id', eventId);
    setComments(prev => prev.map(c => c.id === eventId ? { ...c, payload: newPayload } : c));
  }

  async function addComment() {
    if (!commentInput.trim()) return;
    setSending(true);
    const text = commentInput.trim();
    setCommentInput("");

    // 낙관적 업데이트
    const tempComment: TaskEvent = {
      id: `temp-${Date.now()}`,
      task_id: taskId,
      event_type: "comment_added",
      actor,
      payload: { text },
      created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, tempComment]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    const { data } = await supabase.from("task_events").insert([{
      task_id: taskId, event_type: "comment_added", actor,
      payload: { text },
    }]).select().single();

    // 실제 데이터로 교체
    if (data) {
      setComments(prev => prev.map(c => c.id === tempComment.id ? data as TaskEvent : c));
    }
    setSending(false);
    // Keep focus after send for continuous commenting
    setTimeout(() => commentInputRef.current?.focus(), 50);
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
              background: label.includes('지남') ? 'var(--peach-soft)' : label === '오늘' ? 'var(--mint)' : 'var(--bg-deep)',
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
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8 }}>
            <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 24, letterSpacing: -0.4, color: task.completed ? 'var(--ink-mute)' : 'var(--ink)', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: 1.3, flex: 1 }}>
              {task.title}
            </div>
            <button
              onClick={() => { setEditTitle(task.title); setEditingTitle(true); }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--ink-mute)', padding: '4px', flexShrink: 0, marginTop: 2 }}
              aria-label="제목 편집"
            >✏️</button>
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
                  onDelete={() => deleteItem(item)}
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

          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink-mute)', fontFamily: 'Gaegu, cursive', fontSize: 14 }}>
              첫 댓글을 남겨봐 💬
            </div>
          ) : (
            comments.map(c => <CommentBubble key={c.id} c={c} onReact={addReaction} />)
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Delete undo toast ── */}
      {deletedItem && (
        <div style={{
          position: 'fixed', bottom: 'calc(120px + env(safe-area-inset-bottom, 0px))',
          left: '50%', transform: 'translateX(-50%)',
          background: 'var(--ink)', color: '#fff',
          borderRadius: 100, padding: '8px 16px',
          display: 'flex', gap: 12, alignItems: 'center',
          fontFamily: 'Jua, sans-serif', fontSize: 14,
          zIndex: 60, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}>
          <span>삭제됨</span>
          <button onClick={undoDelete} style={{ border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 20, padding: '4px 12px', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer' }}>실행 취소</button>
        </div>
      )}

      {/* ── Fixed input bar ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '8px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -4px 20px rgba(47,149,196,0.08)',
      }}>
        {/* Mode toggle + 완료 버튼 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
          {([['sub', '📋 하위'], ['comment', '💬 댓글']] as [InputMode, string][]).map(([m, l]) => (
            <button key={m} onClick={() => setMode(m as InputMode)} style={{
              padding: '10px 14px', border: 'none', borderRadius: 100, cursor: 'pointer',
              fontFamily: 'Jua, sans-serif', fontSize: 12,
              background: mode === m ? 'var(--accent)' : 'var(--bg-deep)',
              color: mode === m ? '#fff' : 'var(--ink-soft)',
              minHeight: 44,
            }}>{l}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={toggleDone} style={{
            padding: '4px 14px', border: 'none', borderRadius: 100, cursor: 'pointer',
            fontFamily: 'Jua, sans-serif', fontSize: 12,
            background: task.completed ? 'var(--bg-deep)' : 'linear-gradient(135deg, var(--mint), var(--mint-deep))',
            color: task.completed ? 'var(--ink-soft)' : '#fff',
            boxShadow: 'var(--shadow-soft)',
          }}>
            {task.completed ? '↺ 열기' : '✓ 완료'}
          </button>
        </div>

        {/* Date picker for sub mode */}
        {mode === 'sub' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {showSubDate ? (
              <>
                <input type="date" value={inputDue} onChange={e => setInputDue(e.target.value)}
                  style={{ flex: 1, fontFamily: 'Jua, sans-serif', fontSize: 13, border: '1.5px solid var(--accent-soft)', borderRadius: 8, padding: '4px 8px', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }} />
                <button onClick={() => { setInputDue(''); setShowSubDate(false); }}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-mute)' }}>✕</button>
              </>
            ) : (
              <button onClick={() => setShowSubDate(true)}
                style={{ border: 'none', background: 'var(--bg-deep)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontFamily: 'Gaegu, cursive', fontSize: 12, color: 'var(--ink-soft)' }}>
                📅 날짜 추가
              </button>
            )}
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
            {mode === 'sub' ? (
              <input
                value={subInput}
                onChange={e => setSubInput(e.target.value)}
                onKeyDown={e => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === 'Enter' && !e.shiftKey) handleSend();
                }}
                placeholder="하위 아젠다 입력..."
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Jua, sans-serif', fontSize: 15, color: 'var(--ink)' }}
              />
            ) : (
              <textarea
                ref={commentInputRef}
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="댓글 달기..."
                rows={1}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent',
                  fontFamily: 'Gaegu, cursive', fontSize: 15, color: 'var(--ink)',
                  resize: 'none', overflow: 'hidden', lineHeight: 1.4,
                  maxHeight: 80,
                }}
                onInput={e => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 80) + 'px';
                }}
              />
            )}
            <button onClick={handleSend} disabled={sending || !(mode === 'sub' ? subInput : commentInput).trim()} style={{
              border: 'none', borderRadius: 12, padding: '5px 12px',
              background: (mode === 'sub' ? subInput : commentInput).trim() ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))' : 'var(--ink-mute)',
              color: '#fff', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer',
              opacity: sending ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {sending ? (
                <span style={{
                  display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.6s linear infinite',
                }} />
              ) : (mode === 'sub' ? '추가' : '전송')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Task, TaskItem } from "./types";
import { BackBtn, WhoBadge } from "@/components/ui";
import { getSupabaseClient } from "@/lib/supabase";

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
            width: '100%', fontFamily: 'var(--font-main)', fontSize: 15, border: '2px solid var(--accent)',
            borderRadius: 10, padding: '8px 10px', background: 'var(--bg)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', minHeight: 44,
          }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
          <input
            type="date"
            value={editDue}
            onChange={e => setEditDue(e.target.value)}
            style={{ flex: 1, minHeight: 44, fontFamily: 'var(--font-main)', fontSize: 13, border: '1.5px solid var(--accent-soft)', borderRadius: 10, padding: '4px 10px', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
          />
          <button onClick={save} style={{ minWidth: 60, minHeight: 44, border: 'none', borderRadius: 10, background: 'var(--accent)', color: '#fff', padding: '0 12px', fontFamily: 'var(--font-main)', fontSize: 14, cursor: 'pointer' }}>저장</button>
          <button onClick={() => setEditing(false)} style={{ minWidth: 44, minHeight: 44, border: 'none', borderRadius: 10, background: 'var(--bg-deep)', color: 'var(--ink-soft)', padding: '0 10px', fontFamily: 'var(--font-main)', fontSize: 14, cursor: 'pointer' }}>취소</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0',
      borderBottom: '1px dashed var(--accent-soft)',
      opacity: item.done ? 0.55 : 1,
    }}>
      {/* Checkbox — 44px touch area */}
      <button
        onClick={onToggle}
        style={{
          width: 44, height: 44, borderRadius: 22, background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer',
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: item.done ? 'linear-gradient(135deg, var(--mint), var(--mint-deep))' : 'transparent',
          border: item.done ? 'none' : '2px solid var(--ink-mute)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {item.done && (
            <svg width="13" height="13" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 5l2 2 4-5" />
            </svg>
          )}
        </div>
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-main)', fontSize: 15, color: 'var(--ink)', textDecoration: item.done ? 'line-through' : 'none', lineHeight: 1.4 }}>
          {item.content}
        </div>
        {label && (
          <span style={{ fontSize: 11, fontFamily: 'var(--font-main)', color: isOverdue ? 'var(--peach-deep)' : label === '오늘' ? 'var(--mint-deep)' : 'var(--ink-mute)' }}>
            📅 {label}
          </span>
        )}
      </div>

      {/* Actions — 44px touch area each */}
      <div style={{ display: 'flex', flexShrink: 0 }}>
        <button
          onClick={() => { setEditContent(item.content); setEditDue(item.due_date ?? ''); setEditing(true); }}
          style={{ minWidth: 44, minHeight: 44, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 10, fontSize: 18, color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >✏️</button>
        <button
          onClick={onDelete}
          style={{ minWidth: 44, minHeight: 44, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 10, fontSize: 18, color: 'var(--peach-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >🗑️</button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { taskId: string }

export function TaskDetail({ taskId }: Props) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [items, setItems] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState("");
  const [newItemDue, setNewItemDue] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState("");

  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient();
    const [{ data: taskData }, { data: itemData }] = await Promise.all([
      supabase.from("tasks").select("*").eq("id", taskId).single(),
      supabase.from("task_items").select("*").eq("task_id", taskId).order("position", { ascending: true }).order("created_at", { ascending: true }),
    ]);
    if (taskData) setTask(taskData as Task);
    setItems((itemData || []) as TaskItem[]);
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

  async function addChecklistItem() {
    if (!newItemText.trim()) return;
    setAdding(true);
    const position = items.length ? Math.max(...items.map(i => i.position)) + 1 : 0;
    const { data } = await getSupabaseClient().from("task_items").insert([{
      task_id: taskId,
      content: newItemText.trim(),
      due_date: newItemDue || null,
      position,
    }]).select().single();
    if (data) setItems(prev => [...prev, data as TaskItem]);
    setNewItemText("");
    setNewItemDue("");
    setAdding(false);
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
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-main)', color: 'var(--ink-mute)' }}>
        할 일을 찾을 수 없어요<br />
        <button onClick={() => router.push('/tasks')} style={{ marginTop: 16, fontFamily: 'var(--font-main)', background: 'var(--card)', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', color: 'var(--ink)' }}>돌아가기</button>
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
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent-deep)', fontFamily: 'var(--font-main)' }}>
              {task.category}
            </span>
          )}
          {label && (
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 8, fontFamily: 'var(--font-main)',
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
              style={{ flex: 1, fontFamily: 'var(--font-main)', fontSize: 20, border: '2px solid var(--accent)', borderRadius: 12, padding: '6px 10px', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
            />
            <button onClick={saveTitle} style={{ minWidth: 52, minHeight: 44, border: 'none', borderRadius: 10, background: 'var(--accent)', color: '#fff', padding: '0 12px', fontFamily: 'var(--font-main)', fontSize: 13, cursor: 'pointer' }}>저장</button>
            <button onClick={() => setEditingTitle(false)} style={{ minWidth: 44, minHeight: 44, border: 'none', borderRadius: 10, background: 'var(--bg-deep)', color: 'var(--ink-soft)', padding: '0 10px', fontFamily: 'var(--font-main)', fontSize: 13, cursor: 'pointer' }}>✕</button>
          </div>
        ) : (
          <div onClick={() => { setEditTitle(task.title); setEditingTitle(true); }}
            style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 22, letterSpacing: -0.4, marginTop: 8, color: task.completed ? 'var(--ink-mute)' : 'var(--ink)', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: 1.3, cursor: 'text' }}>
            {task.title} <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 400 }}>✏️</span>
          </div>
        )}

        {/* Description */}
        {editingDesc ? (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} autoFocus rows={2}
              style={{ fontFamily: 'var(--font-main)', fontSize: 14, border: '2px solid var(--accent)', borderRadius: 12, padding: '8px 10px', background: 'var(--bg)', color: 'var(--ink)', outline: 'none', resize: 'none' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={saveDesc} style={{ minHeight: 44, border: 'none', borderRadius: 10, background: 'var(--accent)', color: '#fff', padding: '0 14px', fontFamily: 'var(--font-main)', fontSize: 13, cursor: 'pointer' }}>저장</button>
              <button onClick={() => setEditingDesc(false)} style={{ minHeight: 44, border: 'none', borderRadius: 10, background: 'var(--bg-deep)', color: 'var(--ink-soft)', padding: '0 10px', fontFamily: 'var(--font-main)', fontSize: 13, cursor: 'pointer' }}>취소</button>
            </div>
          </div>
        ) : (
          <div onClick={() => { setEditDesc(task.description || ''); setEditingDesc(true); }}
            style={{ marginTop: 6, fontFamily: 'var(--font-main)', fontSize: 14, color: task.description ? 'var(--ink-soft)' : 'var(--ink-mute)', lineHeight: 1.5, cursor: 'text', minHeight: 20 }}>
            {task.description || <span style={{ opacity: 0.5 }}>설명 추가... ✏️</span>}
          </div>
        )}

        <button onClick={toggleDone} style={{
          marginTop: 12, minHeight: 44,
          background: task.completed ? 'var(--bg-deep)' : 'linear-gradient(135deg, var(--mint), var(--mint-deep))',
          color: task.completed ? 'var(--ink-soft)' : '#fff',
          border: 'none', borderRadius: 14, padding: '0 18px',
          fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-soft)',
        }}>
          {task.completed ? '↺ 다시 열기' : '✓ 완료 표시'}
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 0px))' }}>

        {/* Sub-tasks section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>
              📋 하위 아젠다
            </div>
            {items.length > 0 && (
              <span style={{ fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--ink-soft)', background: 'var(--bg-deep)', borderRadius: 100, padding: '1px 8px' }}>
                {doneCount}/{items.length}
              </span>
            )}
          </div>

          <div style={{ background: 'var(--card)', borderRadius: 18, padding: '0 14px', boxShadow: 'var(--shadow-soft)' }}>
            {items.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', fontFamily: 'var(--font-main)', fontSize: 13, color: 'var(--ink-mute)' }}>
                아래에서 추가해봐요!
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

          {/* Inline add form — always visible */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void addChecklistItem(); } }}
                placeholder="하위 아젠다 추가..."
                style={{
                  flex: 1, minHeight: 48, borderRadius: 14,
                  border: '1.5px solid var(--border)', background: 'var(--card)',
                  color: 'var(--ink)', padding: '0 14px',
                  fontFamily: 'var(--font-main)', fontSize: 15, outline: 'none',
                }}
              />
              <button
                onClick={() => void addChecklistItem()}
                disabled={adding || !newItemText.trim()}
                style={{
                  minWidth: 52, minHeight: 48, borderRadius: 14, border: 'none',
                  background: newItemText.trim() ? 'var(--accent)' : 'var(--ink-mute)',
                  color: '#fff', fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 20,
                  cursor: adding || !newItemText.trim() ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>
            <input
              type="date"
              value={newItemDue}
              onChange={e => setNewItemDue(e.target.value)}
              style={{
                marginTop: 6, width: '100%', minHeight: 44, borderRadius: 12,
                border: '1.5px solid var(--border)', background: 'var(--card)',
                color: 'var(--ink)', padding: '0 12px',
                fontFamily: 'var(--font-main)', fontSize: 14, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

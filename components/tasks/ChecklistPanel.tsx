"use client";

import { useState } from "react";
import { CHECKLIST_NO_DUE_SENTINEL, TaskItem } from "./types";

type Props = {
  taskId: string;
  items: TaskItem[];
  onAdd: (taskId: string, content: string, dueDate: string | null) => void;
  onToggle: (taskId: string, itemId: string, current: boolean) => void;
  onUpdate: (taskId: string, itemId: string, content: string, dueDate: string | null) => void;
  onDelete: (itemId: string) => void;
};

function formatDate(dateStr: string | null): string {
  if (!dateStr || dateStr === CHECKLIST_NO_DUE_SENTINEL) return "";
  return dateStr;
}

export function ChecklistPanel({ taskId, items, onAdd, onToggle, onUpdate, onDelete }: Props) {
  const [newContent, setNewContent] = useState("");
  const [newDue, setNewDue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editDue, setEditDue] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;
    onAdd(taskId, newContent.trim(), newDue || null);
    setNewContent("");
    setNewDue("");
  }

  function startEdit(item: TaskItem) {
    setEditingId(item.id);
    setEditContent(item.content);
    setEditDue(formatDate(item.due_date));
  }

  function handleUpdate(e: React.FormEvent, itemId: string) {
    e.preventDefault();
    onUpdate(taskId, itemId, editContent.trim(), editDue || null);
    setEditingId(null);
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          {editingId === item.id ? (
            <form onSubmit={(e) => handleUpdate(e, item.id)} style={{ display: 'flex', gap: 4, flex: 1 }}>
              <input
                style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 8, padding: '4px 8px', fontSize: 13, background: 'var(--card-alt)', color: 'var(--ink)', outline: 'none' }}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <input
                type="date"
                style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '4px 8px', fontSize: 12, background: 'var(--card-alt)', color: 'var(--ink)', outline: 'none' }}
                value={editDue}
                onChange={(e) => setEditDue(e.target.value)}
              />
              <button type="submit" style={{ color: 'var(--mint-deep)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>저장</button>
              <button type="button" style={{ color: 'var(--ink-mute)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setEditingId(null)}>취소</button>
            </form>
          ) : (
            <>
              <button
                style={{
                  width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${item.done ? 'var(--mint-deep)' : 'var(--ink-mute)'}`,
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  background: item.done ? 'var(--mint-deep)' : 'var(--card)',
                }}
                onClick={() => onToggle(taskId, item.id, item.done)}
                aria-label={item.done ? '완료 취소' : '완료'}
              >
                {item.done && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
              </button>
              <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--ink-mute)' : 'var(--ink)', fontFamily: 'var(--font-main)', fontSize: 14 }}>{item.content}</span>
              {item.due_date && item.due_date !== CHECKLIST_NO_DUE_SENTINEL && (
                <span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-main)' }}>{item.due_date}</span>
              )}
              <button style={{ fontSize: 11, color: 'var(--ink-mute)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => startEdit(item)}>수정</button>
              <button style={{ fontSize: 11, color: 'var(--peach-deep)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onDelete(item.id)}>✕</button>
            </>
          )}
        </div>
      ))}

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        <input
          style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 13, background: 'var(--card-alt)', color: 'var(--ink)', outline: 'none' }}
          placeholder="체크리스트 항목 추가..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <input
          type="date"
          style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 8px', fontSize: 12, background: 'var(--card-alt)', color: 'var(--ink)', outline: 'none' }}
          value={newDue}
          onChange={(e) => setNewDue(e.target.value)}
        />
        <button type="submit" style={{ background: 'var(--accent-soft)', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: 'var(--accent-deep)', cursor: 'pointer', fontFamily: 'var(--font-main)' }}>+</button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES, Task } from "./types";

type FormData = {
  title: string;
  description: string;
  due_date: string;
  assignee: "하경" | "창희" | "둘다";
  category: string;
};

type Props = {
  open: boolean;
  editing: Task | null;
  onClose: () => void;
  onSubmit: (data: Omit<Task, "id" | "created_at" | "completed_at" | "completed">) => void;
  onUpdate: (id: string, data: Partial<Task>, before: Task) => void;
};

const EMPTY: FormData = {
  title: "", description: "", due_date: "",
  assignee: "둘다", category: "",
};

const CUSTOM_CATEGORIES_KEY = 'ori_ranger_custom_categories';

function loadCustomCategories(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_KEY) ?? '[]'); } catch { return []; }
}

export function TaskForm({ open, editing, onClose, onSubmit, onUpdate }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const newCatRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCustomCategories(loadCustomCategories());
  }, [open]);

  useEffect(() => {
    if (showNewCat) setTimeout(() => newCatRef.current?.focus(), 50);
  }, [showNewCat]);

  function addCustomCategory() {
    const cat = newCatInput.trim();
    if (!cat) return;
    const next = [...customCategories, cat];
    setCustomCategories(next);
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(next));
    setForm(f => ({ ...f, category: cat }));
    setNewCatInput('');
    setShowNewCat(false);
  }

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description || "",
        due_date: editing.due_date || "",
        assignee: editing.assignee,
        category: editing.category || "",
      });
    } else {
      const actor = typeof window !== 'undefined' ? localStorage.getItem('ori_ranger_actor') : null;
      setForm({
        ...EMPTY,
        assignee: actor === '창희' ? '창희' : actor === '하경' ? '하경' : '둘다',
      });
    }
  }, [editing, open]);

  function handleClose() {
    const hasContent = form.title.trim() || form.description.trim() || form.due_date;
    if (hasContent && !editing) {
      if (!window.confirm('작성 중인 내용이 있어요. 닫을까요?')) return;
    }
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      due_date: form.due_date || null,
      assignee: form.assignee,
      category: form.category.trim() || null,
    };
    if (editing) {
      onUpdate(editing.id, payload, editing);
    } else {
      onSubmit(payload);
    }
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-end sm:items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-card rounded-t-3xl sm:rounded-3xl shadow-card w-full sm:max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-jua text-ink">{editing ? "아젠다 수정" : "새 아젠다"}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border border-ink/15 bg-card-alt text-ink placeholder:text-ink-mute rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-duck/40"
            placeholder="제목 *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />

          <textarea
            className="w-full border border-ink/15 bg-card-alt text-ink placeholder:text-ink-mute rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-duck/40"
            placeholder="설명 (선택)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
              style={{ flex: 1, border: '1.5px solid var(--accent-soft)', borderRadius: 12, padding: '8px 12px', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'Jua, sans-serif', fontSize: 14, outline: 'none' }}
            />
            {form.due_date && (
              <button type="button" onClick={() => setForm(f => ({ ...f, due_date: '' }))}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--ink-mute)', padding: '4px' }}>✕</button>
            )}
          </div>

          {/* Assignee chips */}
          <div style={{ display: 'flex', gap: 6 }}>
            {([['하경', '🐬'], ['창희', '🦆'], ['둘다', '💞']] as [FormData['assignee'], string][]).map(([v, emoji]) => (
              <button
                key={v}
                type="button"
                onClick={() => setForm((f) => ({ ...f, assignee: v }))}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', borderRadius: 12, cursor: 'pointer',
                  fontFamily: 'Jua, sans-serif', fontSize: 13,
                  background: form.assignee === v
                    ? (v === '창희' ? 'var(--duck)' : v === '하경' ? 'var(--dolphin)' : 'linear-gradient(135deg, var(--pink), var(--peach))')
                    : 'var(--card-alt)',
                  color: form.assignee === v && v === '하경' ? '#fff' : 'var(--ink)',
                  boxShadow: form.assignee === v ? 'var(--shadow-soft)' : 'none',
                }}
              >{emoji} {v}</button>
            ))}
          </div>

          {/* Category chips */}
          <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {(['', ...CATEGORIES, ...customCategories] as string[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: c }))}
                style={{
                  padding: '5px 12px', border: 'none', borderRadius: 100, cursor: 'pointer',
                  fontFamily: 'Jua, sans-serif', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0,
                  background: form.category === c ? 'var(--accent)' : 'var(--card-alt)',
                  color: form.category === c ? '#fff' : 'var(--ink-soft)',
                }}
              >{c === '' ? '없음' : c}</button>
            ))}
            {/* 커스텀 카테고리 추가 버튼 */}
            {showNewCat ? (
              <input
                ref={newCatRef}
                value={newCatInput}
                onChange={e => setNewCatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomCategory(); } if (e.key === 'Escape') setShowNewCat(false); }}
                onBlur={() => { if (!newCatInput.trim()) setShowNewCat(false); }}
                placeholder="카테고리명"
                style={{ width: 90, padding: '5px 10px', border: '1.5px solid var(--accent)', borderRadius: 100, fontFamily: 'Jua, sans-serif', fontSize: 12, background: 'var(--bg)', color: 'var(--ink)', outline: 'none', flexShrink: 0 }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowNewCat(true)}
                aria-label="카테고리 추가"
                style={{ padding: '5px 10px', border: '1.5px dashed var(--ink-mute)', borderRadius: 100, cursor: 'pointer', fontFamily: 'Jua, sans-serif', fontSize: 12, background: 'none', color: 'var(--ink-mute)', whiteSpace: 'nowrap', flexShrink: 0 }}
              >+ 추가</button>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" className="flex-1 border border-ink/15 rounded-pill py-2 text-sm text-ink-soft" onClick={handleClose}>취소</button>
            <button type="submit" className="flex-1 bg-duck text-ink font-jua rounded-pill py-2 text-sm hover:bg-duck-deep transition-colors">
              {editing ? "수정" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

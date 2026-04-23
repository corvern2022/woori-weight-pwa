"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, Task } from "./types";

type FormData = {
  title: string;
  description: string;
  due_date: string;
  noDue: boolean;
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
  title: "", description: "", due_date: "", noDue: false,
  assignee: "둘다", category: "",
};

export function TaskForm({ open, editing, onClose, onSubmit, onUpdate }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description || "",
        due_date: editing.due_date || "",
        noDue: !editing.due_date,
        assignee: editing.assignee,
        category: editing.category || "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [editing, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      due_date: form.noDue ? null : form.due_date || null,
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
    <div className="fixed inset-0 bg-ink/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card rounded-t-3xl sm:rounded-3xl shadow-card w-full sm:max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-jua text-ink">{editing ? "아젠다 수정" : "새 아젠다"}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border border-ink/15 bg-card-alt text-ink placeholder:text-ink-mute rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-duck/40"
            placeholder="제목 *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            autoFocus
          />

          <textarea
            className="w-full border border-ink/15 bg-card-alt text-ink placeholder:text-ink-mute rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-duck/40"
            placeholder="설명 (선택)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <div className="flex items-center gap-2">
            <input
              type="date"
              className="flex-1 border border-ink/15 bg-card-alt text-ink rounded-xl px-3 py-2 text-sm disabled:opacity-40"
              value={form.due_date}
              disabled={form.noDue}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
            />
            <label className="font-gaegu flex items-center gap-1 text-sm text-ink-soft flex-shrink-0">
              <input
                type="checkbox"
                checked={form.noDue}
                onChange={(e) => setForm((f) => ({ ...f, noDue: e.target.checked, due_date: e.target.checked ? "" : f.due_date }))}
              />
              기한없음
            </label>
          </div>

          <select
            className="w-full border border-ink/15 bg-card-alt text-ink rounded-xl px-3 py-2 text-sm"
            value={form.assignee}
            onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value as FormData["assignee"] }))}
          >
            <option value="하경">하경</option>
            <option value="창희">창희</option>
            <option value="둘다">둘다</option>
          </select>

          <select
            className="w-full border border-ink/15 bg-card-alt text-ink placeholder:text-ink-mute rounded-xl px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="">카테고리 선택</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex gap-2 pt-2">
            <button type="button" className="flex-1 border border-ink/15 rounded-pill py-2 text-sm text-ink-soft" onClick={onClose}>취소</button>
            <button type="submit" className="flex-1 bg-duck text-ink font-jua rounded-pill py-2 text-sm hover:bg-duck-deep transition-colors">
              {editing ? "수정" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
        <div key={item.id} className="flex items-center gap-2 text-sm">
          {editingId === item.id ? (
            <form onSubmit={(e) => handleUpdate(e, item.id)} className="flex gap-1 flex-1">
              <input
                className="flex-1 border rounded px-2 py-1 text-sm"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <input
                type="date"
                className="border rounded px-2 py-1 text-sm"
                value={editDue}
                onChange={(e) => setEditDue(e.target.value)}
              />
              <button type="submit" className="text-green-600 text-xs">저장</button>
              <button type="button" className="text-gray-400 text-xs" onClick={() => setEditingId(null)}>취소</button>
            </form>
          ) : (
            <>
              <button
                className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                style={{ background: item.done ? "#22c55e" : "white", borderColor: item.done ? "#22c55e" : "#d1d5db" }}
                onClick={() => onToggle(taskId, item.id, item.done)}
              >
                {item.done && <span className="text-white text-xs">✓</span>}
              </button>
              <span className={`flex-1 ${item.done ? "line-through text-gray-400" : "text-gray-700"}`}>{item.content}</span>
              {item.due_date && item.due_date !== CHECKLIST_NO_DUE_SENTINEL && (
                <span className="text-xs text-gray-400">{item.due_date}</span>
              )}
              <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => startEdit(item)}>수정</button>
              <button className="text-xs text-red-300 hover:text-red-500" onClick={() => onDelete(item.id)}>✕</button>
            </>
          )}
        </div>
      ))}

      <form onSubmit={handleAdd} className="flex gap-1 mt-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm placeholder:text-gray-300"
          placeholder="체크리스트 항목 추가..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm text-gray-500"
          value={newDue}
          onChange={(e) => setNewDue(e.target.value)}
        />
        <button type="submit" className="bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-sm">+</button>
      </form>
    </div>
  );
}

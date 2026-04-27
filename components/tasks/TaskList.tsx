"use client";

import { useMemo } from "react";
import { TaskCard } from "./TaskCard";
import { Task, TaskEvent, TaskItem, FilterTab, CATEGORIES, UiSettings } from "./types";

type Props = {
  tasks: Task[];
  itemsByTask: Record<string, TaskItem[]>;
  eventsByTask: Record<string, TaskEvent[]>;
  uiSettings: UiSettings;
  actor: string;
  filter: FilterTab;
  category: string;
  onFilterChange: (f: FilterTab) => void;
  onCategoryChange: (c: string) => void;
  onToggleDone: (id: string, current: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string, title: string) => void;
  onAddComment: (taskId: string, text: string) => void;
  onAddChecklistItem: (taskId: string, content: string, dueDate: string | null) => void;
  onToggleChecklistItem: (taskId: string, itemId: string, current: boolean) => void;
  onUpdateChecklistItem: (taskId: string, itemId: string, content: string, dueDate: string | null) => void;
  onDeleteChecklistItem: (itemId: string) => void;
};

const TABS: { label: string; value: FilterTab }[] = [
  { label: "전체", value: "all" },
  { label: "하경", value: "하경" },
  { label: "창희", value: "창희" },
  { label: "둘다", value: "둘다" },
  { label: "완료", value: "done" },
];

export function TaskList({ tasks, itemsByTask, eventsByTask, uiSettings, actor, filter, category, onFilterChange, onCategoryChange, onToggleDone, onEdit, onDelete, onAddComment, onAddChecklistItem, onToggleChecklistItem, onUpdateChecklistItem, onDeleteChecklistItem }: Props) {
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "done") return t.completed;
      if (t.completed) return false;
      if (filter !== "all" && t.assignee !== filter) return false;
      if (category !== "all" && t.category !== category) return false;
      return true;
    });
  }, [tasks, filter, category]);

  return (
    <div>
      {/* 필터 탭 */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4, marginBottom: 8 }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onFilterChange(tab.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 14,
              flexShrink: 0,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: filter === tab.value
                ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))'
                : 'var(--card)',
              color: filter === tab.value ? '#fff' : 'var(--ink-soft)',
              boxShadow: filter === tab.value ? 'var(--shadow-soft)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div style={{ marginBottom: 12 }}>
        <select
          style={{ border: '1.5px solid var(--accent-soft)', borderRadius: 8, padding: '6px 8px', fontSize: 14, color: 'var(--ink-soft)', background: 'var(--card)' }}
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">전체 카테고리</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--ink-mute)', padding: '64px 0', fontSize: 14 }}>할일이 없어요 🎉</div>
      ) : (
        filtered.map((task) => (
          <TaskCard
            key={task.id}
            t={task}
            events={eventsByTask[task.id] || []}
            onOpen={() => onEdit(task)}
            onToggle={() => onToggleDone(task.id, task.completed)}
          />
        ))
      )}
    </div>
  );
}

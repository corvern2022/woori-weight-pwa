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
      <div className="flex gap-1 overflow-x-auto pb-1 mb-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`px-3 py-1.5 rounded-full text-sm flex-shrink-0 font-medium transition-colors ${
              filter === tab.value ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => onFilterChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-3">
        <select
          className="border rounded-lg px-2 py-1.5 text-sm text-gray-600"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">전체 카테고리</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16 text-sm">할일이 없어요 🎉</div>
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

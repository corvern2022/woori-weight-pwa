"use client";

import { useState } from "react";
import { ChecklistPanel } from "./ChecklistPanel";
import { ThreadPanel } from "./ThreadPanel";
import { Task, TaskEvent, TaskItem, UiSettings } from "./types";

type Props = {
  task: Task;
  items: TaskItem[];
  events: TaskEvent[];
  uiSettings: UiSettings;
  actor: string;
  onToggleDone: (id: string, current: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string, title: string) => void;
  onAddComment: (taskId: string, text: string) => void;
  onAddChecklistItem: (taskId: string, content: string, dueDate: string | null) => void;
  onToggleChecklistItem: (taskId: string, itemId: string, current: boolean) => void;
  onUpdateChecklistItem: (taskId: string, itemId: string, content: string, dueDate: string | null) => void;
  onDeleteChecklistItem: (itemId: string) => void;
};

function dday(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function ddayLabel(d: number | null): string {
  if (d === null) return "";
  if (d === 0) return "D-Day";
  if (d > 0) return `D-${d}`;
  return `D+${Math.abs(d)}`;
}

export function TaskCard({ task, items, events, uiSettings, actor, onToggleDone, onEdit, onDelete, onAddComment, onAddChecklistItem, onToggleChecklistItem, onUpdateChecklistItem, onDeleteChecklistItem }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);

  const d = dday(task.due_date);
  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;

  const assigneeColor =
    task.assignee === "하경" ? "bg-dolphin-soft text-dolphin-deep"
    : task.assignee === "창희" ? "bg-duck-soft text-duck-deep"
    : "bg-pink/20 text-pink";

  return (
    <div className={`rounded-2xl bg-card shadow-soft p-4 mb-3 border border-ink/5 ${task.completed ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-2">
        <button
          className="mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
          style={{ borderColor: task.completed ? "var(--mint-deep)" : "var(--ink-mute)", background: task.completed ? "var(--mint-deep)" : "transparent" }}
          onClick={() => onToggleDone(task.id, task.completed)}
        >
          {task.completed && <span className="text-white text-xs">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${assigneeColor}`}>{task.assignee}</span>
            {task.category && <span className="text-xs px-2 py-0.5 rounded-full bg-card-alt text-ink-mute">{task.category}</span>}
            {d !== null && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d < 0 ? "bg-peach/20 text-peach-deep" : d === 0 ? "bg-duck-soft text-duck-deep" : "bg-mint/20 text-mint-deep"}`}>
                {ddayLabel(d)}
              </span>
            )}
          </div>

          <p className={`font-gaegu text-ink ${task.completed ? "line-through" : ""}`}>{task.title}</p>

          {uiSettings.showDescription && task.description && (
            <p className="text-sm text-ink-soft mt-0.5 line-clamp-2">{task.description}</p>
          )}

          {totalCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full" style={{ width: `${(doneCount / totalCount) * 100}%` }} />
              </div>
              <span className="text-xs text-gray-400">{doneCount}/{totalCount}</span>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "▲ 접기" : "▼ 체크리스트"}
            </button>
            <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setThreadOpen((v) => !v)}>
              💬 {events.filter((e) => e.event_type === "comment_added").length}
            </button>
            <button className="text-xs text-gray-400 hover:text-gray-600 ml-auto" onClick={() => onEdit(task)}>수정</button>
            <button className="text-xs text-red-300 hover:text-red-500" onClick={() => onDelete(task.id, task.title)}>삭제</button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 border-t pt-3">
          <ChecklistPanel
            taskId={task.id}
            items={items}
            onAdd={onAddChecklistItem}
            onToggle={onToggleChecklistItem}
            onUpdate={onUpdateChecklistItem}
            onDelete={onDeleteChecklistItem}
          />
        </div>
      )}

      {threadOpen && (
        <div className="mt-3 border-t pt-3">
          <ThreadPanel taskId={task.id} events={events} actor={actor} onAddComment={onAddComment} />
        </div>
      )}
    </div>
  );
}

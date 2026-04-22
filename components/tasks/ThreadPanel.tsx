"use client";

import { useState } from "react";
import { TaskEvent } from "./types";

type Props = {
  taskId: string;
  events: TaskEvent[];
  actor: string;
  onAddComment: (taskId: string, text: string) => void;
};

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ThreadPanel({ taskId, events, actor, onAddComment }: Props) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(taskId, text.trim());
    setText("");
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {events.map((ev) => (
          <div key={ev.id} className="text-sm">
            {ev.event_type === "comment_added" ? (
              <div className="flex gap-2">
                <span className="font-medium text-gray-600 flex-shrink-0">{ev.actor}</span>
                <span className="text-gray-700">{(ev.payload as { text?: string }).text}</span>
                <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{formatDateTime(ev.created_at)}</span>
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">
                {ev.actor} · {(ev.payload as { action?: string }).action} · {formatDateTime(ev.created_at)}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-1 mt-2">
        <span className="text-xs text-gray-500 self-center">{actor}</span>
        <input
          className="flex-1 border rounded px-2 py-1 text-sm placeholder:text-gray-300"
          placeholder="댓글 추가..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-sm">전송</button>
      </form>
    </div>
  );
}

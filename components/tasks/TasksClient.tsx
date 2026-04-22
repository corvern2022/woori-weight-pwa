"use client";

import { useState } from "react";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import { useTasks } from "./useTasks";
import { FilterTab, Task } from "./types";
import { BottomNav, Confetti } from "@/components/ui";

export function TasksClient() {
  const {
    tasks, itemsByTask, eventsByTask, uiSettings, loading, toast,
    addTask, updateTask, deleteTask, toggleDone,
    addComment, addChecklistItem, toggleChecklistItem, updateChecklistItem, deleteChecklistItem,
  } = useTasks();

  const [filter, setFilter] = useState<FilterTab>("all");
  const [category, setCategory] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const actor = typeof window !== "undefined"
    ? localStorage.getItem("ori_ranger_actor") || "하경"
    : "하경";

  function handleToggleDone(id: string, current: boolean) {
    toggleDone(id, current);
    if (!current) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
  }

  function handleAddComment(taskId: string, text: string) {
    return addComment(taskId, text, actor);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function handleDelete(id: string, title: string) {
    setDeleteTarget({ id, title });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteTask(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-card border-b border-ink/10 shadow-soft sticky top-0 z-10 safe-top">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-jua text-ink">우리 할일</h1>
          <button
            className="bg-duck text-ink font-jua rounded-pill px-4 py-2 text-sm shadow-soft hover:bg-duck-deep transition-colors"
            onClick={() => { setEditingTask(null); setFormOpen(true); }}
          >
            추가
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 pb-20">
        {loading ? (
          <div className="flex justify-center items-center py-20 gap-1">
            {[0,1,2].map((i) => (
              <span key={i} className="w-2 h-2 bg-duck rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            itemsByTask={itemsByTask}
            eventsByTask={eventsByTask}
            uiSettings={uiSettings}
            actor={actor}
            filter={filter}
            category={category}
            onFilterChange={setFilter}
            onCategoryChange={setCategory}
            onToggleDone={handleToggleDone}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddComment={handleAddComment}
            onAddChecklistItem={addChecklistItem}
            onToggleChecklistItem={toggleChecklistItem}
            onUpdateChecklistItem={updateChecklistItem}
            onDeleteChecklistItem={deleteChecklistItem}
          />
        )}
      </main>

      <TaskForm
        open={formOpen}
        editing={editingTask}
        onClose={() => { setFormOpen(false); setEditingTask(null); }}
        onSubmit={addTask}
        onUpdate={updateTask}
      />

      {deleteTarget && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-ink/10 p-6 mx-4 w-full max-w-sm space-y-4">
            <p className="text-sm text-ink">
              <strong>&quot;{deleteTarget.title}&quot;</strong>을(를) 삭제할까요?
            </p>
            <div className="flex gap-2">
              <button className="flex-1 border border-ink/10 rounded-lg py-2 text-sm text-ink-soft" onClick={() => setDeleteTarget(null)}>취소</button>
              <button className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm font-medium" onClick={confirmDelete}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white text-sm rounded-full px-4 py-2 shadow-lg z-50">
          {toast}
        </div>
      )}

      <Confetti trigger={showConfetti} />
      <BottomNav active="tasks" />
    </div>
  );
}

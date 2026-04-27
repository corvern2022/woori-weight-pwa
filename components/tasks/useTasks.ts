"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { sendPushToPartner } from "@/lib/usePush";
import {
  AppConfig,
  CHECKLIST_NO_DUE_SENTINEL,
  DEFAULT_UI_SETTINGS,
  Task,
  TaskEvent,
  TaskItem,
  UiSettings,
} from "./types";

const POLL_INTERVAL = 10000;

async function getPartnerUserId(supabase: ReturnType<typeof getSupabaseClient>): Promise<string | null> {
  const myId = typeof window !== 'undefined' ? localStorage.getItem('woori_weight_user_id') : null;
  if (!myId) return null;
  const { data } = await supabase.from('household_members').select('user_id').neq('user_id', myId);
  return data?.[0]?.user_id ?? null;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [itemsByTask, setItemsByTask] = useState<Record<string, TaskItem[]>>({});
  const [eventsByTask, setEventsByTask] = useState<Record<string, TaskEvent[]>>({});
  const [uiSettings, setUiSettings] = useState<UiSettings>({ ...DEFAULT_UI_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const supabase = useMemo(() => getSupabaseClient(), []);

  const loadUiSettings = useCallback(async () => {
    const { data } = await supabase
      .from("app_config")
      .select("*")
      .eq("key", "ui_settings")
      .single();
    if (data) {
      const raw = (data as AppConfig).value as Partial<UiSettings>;
      setUiSettings({ ...DEFAULT_UI_SETTINGS, ...raw });
    }
  }, [supabase]);

  const loadAll = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const { data: taskData, error } = await supabase
        .from("tasks")
        .select("*")
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) {
        showToast("불러오기 실패. 다시 시도해주세요.");
        return;
      }
      const loadedTasks = (taskData || []) as Task[];
      setTasks(loadedTasks);

      const ids = loadedTasks.map((t) => t.id);
      if (!ids.length) {
        setItemsByTask({});
        setEventsByTask({});
        return;
      }

      const [{ data: items }, { data: events }] = await Promise.all([
        supabase
          .from("task_items")
          .select("*")
          .in("task_id", ids)
          .order("position", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("task_events")
          .select("*")
          .in("task_id", ids)
          .order("created_at", { ascending: true }),
      ]);

      const grouped: Record<string, TaskItem[]> = {};
      (items || []).forEach((item: TaskItem) => {
        if (!grouped[item.task_id]) grouped[item.task_id] = [];
        grouped[item.task_id].push(item);
      });
      setItemsByTask(grouped);

      const evGrouped: Record<string, TaskEvent[]> = {};
      (events || []).forEach((ev: TaskEvent) => {
        if (!evGrouped[ev.task_id]) evGrouped[ev.task_id] = [];
        evGrouped[ev.task_id].push(ev);
      });
      setEventsByTask(evGrouped);
    } finally {
      isLoadingRef.current = false;
    }
  }, [supabase, showToast]);

  const reload = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadAll(), loadUiSettings()]);
      setLoading(false);
    })();
  }, [loadAll, loadUiSettings]);

  // 폴링
  useEffect(() => {
    const tick = () => {
      loadAll();
      pollRef.current = setTimeout(tick, POLL_INTERVAL);
    };
    pollRef.current = setTimeout(tick, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [loadAll]);

  // CRUD actions
  async function addTask(payload: Omit<Task, "id" | "created_at" | "completed_at" | "completed">) {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ ...payload, completed: false }])
      .select("id")
      .limit(1);
    if (error) { showToast("추가에 실패했어요."); return; }
    const id = data?.[0]?.id;
    if (id) await addTaskEvent(id, "status_changed", { scope: "task", action: "created" });
    showToast("➕ 상위 아젠다 추가 완료");
    await reload();
  }

  async function updateTask(id: string, payload: Partial<Task>, before?: Task | null) {
    const { error } = await supabase.from("tasks").update(payload).eq("id", id);
    if (error) { showToast("수정에 실패했어요."); return; }
    await addTaskEvent(id, "status_changed", {
      scope: "task", action: "updated",
      title_before: before?.title || "", title_after: payload.title || "",
    });
    showToast("✏️ 아젠다 수정 완료");
    await reload();
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) { showToast("삭제에 실패했어요."); return; }
    showToast("🗑️ 삭제 완료");
    await reload();
  }

  async function toggleDone(id: string, current: boolean) {
    // 즉시 낙관적 업데이트
    setTasks(prev => prev.map(t => t.id === id
      ? { ...t, completed: !current, completed_at: !current ? new Date().toISOString() : null }
      : t
    ));

    const now = new Date().toISOString();
    const { error } = await supabase.from("tasks").update({
      completed: !current,
      completed_at: !current ? now : null,
    }).eq("id", id);
    if (error) {
      // 실패 시 롤백
      setTasks(prev => prev.map(t => t.id === id
        ? { ...t, completed: current, completed_at: current ? now : null }
        : t
      ));
      showToast("상태 변경 실패.");
      return;
    }
    const actor = typeof window !== 'undefined' ? (localStorage.getItem('ori_ranger_actor') ?? '하경') : '하경';
    const task = tasks.find(t => t.id === id);
    await addTaskEvent(id, "status_changed", {
      scope: "task", action: !current ? "completed" : "reopened",
    });
    if (!current) {
      // 할 일 완료 시 파트너에게 푸시 알림
      const partnerUid = await getPartnerUserId(supabase);
      if (partnerUid && task) {
        sendPushToPartner(partnerUid, `${actor}이(가) 완료했어요 ✅`, task.title);
      }
    }
    // 백그라운드 reload (UI는 이미 업데이트됨)
    reload();
  }

  async function addTaskEvent(taskId: string, eventType: TaskEvent["event_type"], payload: Record<string, unknown>, actor?: string) {
    const resolvedActor = actor ?? (typeof window !== 'undefined' ? (localStorage.getItem('ori_ranger_actor') ?? '하경') : '하경');
    await supabase.from("task_events").insert([{ task_id: taskId, event_type: eventType, actor: resolvedActor, payload }]);
  }

  async function addComment(taskId: string, text: string, actor: string) {
    if (!text.trim()) return;
    await addTaskEvent(taskId, "comment_added", { text }, actor);
    // 댓글 작성 시 파트너에게 푸시 알림
    const task = tasks.find(t => t.id === taskId);
    const partnerUid = await getPartnerUserId(supabase);
    if (partnerUid && task) {
      sendPushToPartner(partnerUid, `${actor}이(가) 댓글을 남겼어요 💬`, `"${text.slice(0, 40)}" — ${task.title}`);
    }
    await reload();
  }

  async function addChecklistItem(taskId: string, content: string, dueDate: string | null) {
    const items = itemsByTask[taskId] || [];
    const position = items.length ? Math.max(...items.map((i) => i.position)) + 1 : 0;
    const due = dueDate === CHECKLIST_NO_DUE_SENTINEL ? null : dueDate;
    const { error } = await supabase.from("task_items").insert([{ task_id: taskId, content, due_date: due, position }]);
    if (error) { showToast("체크리스트 추가 실패."); return; }
    await reload();
  }

  async function toggleChecklistItem(taskId: string, itemId: string, current: boolean) {
    const now = new Date().toISOString();
    await supabase.from("task_items").update({ done: !current, done_at: !current ? now : null }).eq("id", itemId);
    await addTaskEvent(taskId, "status_changed", { scope: "item", action: !current ? "completed" : "reopened" });
    await reload();
  }

  async function updateChecklistItem(taskId: string, itemId: string, content: string, dueDate: string | null) {
    const due = dueDate === CHECKLIST_NO_DUE_SENTINEL ? null : dueDate;
    await supabase.from("task_items").update({ content, due_date: due }).eq("id", itemId);
    await reload();
  }

  async function deleteChecklistItem(itemId: string) {
    await supabase.from("task_items").delete().eq("id", itemId);
    await reload();
  }

  async function saveUiSettings(next: UiSettings) {
    setUiSettings(next);
    await supabase.from("app_config").upsert({ key: "ui_settings", value: next, updated_at: new Date().toISOString() });
  }

  return {
    tasks, itemsByTask, eventsByTask, uiSettings,
    loading, toast,
    addTask, updateTask, deleteTask, toggleDone,
    addComment, addChecklistItem, toggleChecklistItem, updateChecklistItem, deleteChecklistItem,
    saveUiSettings, reload,
  };
}

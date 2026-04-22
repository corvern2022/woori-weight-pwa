export type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  assignee: "하경" | "창희" | "둘다";
  category: string | null;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
};

export type TaskItem = {
  id: string;
  task_id: string;
  content: string;
  due_date: string | null;
  done: boolean;
  position: number;
  created_at: string;
  done_at: string | null;
};

export type TaskEvent = {
  id: string;
  task_id: string;
  event_type: "comment_added" | "status_changed";
  actor: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type AppConfig = {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
};

export type UiSettings = {
  compact: boolean;
  showDescription: boolean;
  tint: string;
  radius: number;
};

export const DEFAULT_UI_SETTINGS: UiSettings = {
  compact: false,
  showDescription: true,
  tint: "blue",
  radius: 14,
};

export type FilterTab = "all" | "하경" | "창희" | "둘다" | "done";

export const CATEGORIES = [
  "이사", "결혼준비", "대출/금융", "부모님",
  "청소/정리", "쇼핑", "건강", "일/업무", "여행", "기타",
] as const;

export const CHECKLIST_NO_DUE_SENTINEL = "9999-12-31";

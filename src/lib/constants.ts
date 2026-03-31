export const PROJECT_STATUS_LABELS = {
  PREPARING: "준비중",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
  ON_HOLD: "보류",
} as const;

export const PROJECT_STATUS_COLORS = {
  PREPARING: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  IN_PROGRESS: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  COMPLETED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  ON_HOLD: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
} as const;

export const PROGRESS_STATUS_LABELS = {
  NOT_STARTED: "미시작",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
  BLOCKED: "블로킹",
} as const;

export const PROGRESS_STATUS_COLORS = {
  NOT_STARTED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  IN_PROGRESS: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  COMPLETED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  BLOCKED: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
} as const;

export const ASSIGNMENT_ROLE_LABELS = {
  PRIMARY: "주담당",
  SECONDARY: "부담당",
} as const;

export const DISCIPLINE_LABELS = {
  PT: "PT",
  VIDEO: "영상",
} as const;

export type ProgressStatusKey = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";

export function getAggregateStatus(statuses: ProgressStatusKey[]): ProgressStatusKey {
  if (statuses.length === 0) return "NOT_STARTED";
  if (statuses.every((s) => s === "COMPLETED")) return "COMPLETED";
  if (statuses.some((s) => s === "BLOCKED")) return "BLOCKED";
  if (statuses.some((s) => s === "IN_PROGRESS")) return "IN_PROGRESS";
  return "NOT_STARTED";
}

export const GANTT_BAR_COLORS = {
  NOT_STARTED: "bg-gray-300 dark:bg-gray-600",
  IN_PROGRESS: "bg-sky-400 dark:bg-sky-500",
  COMPLETED: "bg-emerald-400 dark:bg-emerald-500",
  BLOCKED: "bg-rose-400 dark:bg-rose-500",
} as const;

// ─── Task (Flow 스타일) ─────────────────────────────────

export const TASK_STATUS_LABELS = {
  WAITING: "대기",
  IN_PROGRESS: "진행",
  FEEDBACK: "피드백",
  COMPLETE: "완료",
} as const;

export const TASK_STATUS_COLORS = {
  WAITING: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  IN_PROGRESS: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  FEEDBACK: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  COMPLETE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
} as const;

export const TASK_GANTT_BAR_COLORS = {
  WAITING: "bg-gray-300 dark:bg-gray-600",
  IN_PROGRESS: "bg-sky-400 dark:bg-sky-500",
  FEEDBACK: "bg-violet-400 dark:bg-violet-500",
  COMPLETE: "bg-emerald-400 dark:bg-emerald-500",
} as const;

export type TaskStatusKey = "WAITING" | "IN_PROGRESS" | "FEEDBACK" | "COMPLETE";

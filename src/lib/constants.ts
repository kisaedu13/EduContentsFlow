export const PROJECT_STATUS_LABELS = {
  PREPARING: "준비중",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
  ON_HOLD: "보류",
} as const;

export const PROJECT_STATUS_COLORS = {
  PREPARING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
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
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  BLOCKED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
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
  IN_PROGRESS: "bg-blue-400 dark:bg-blue-500",
  COMPLETED: "bg-green-400 dark:bg-green-500",
  BLOCKED: "bg-red-400 dark:bg-red-500",
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
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  FEEDBACK: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  COMPLETE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
} as const;

export const TASK_GANTT_BAR_COLORS = {
  WAITING: "bg-gray-300 dark:bg-gray-600",
  IN_PROGRESS: "bg-blue-400 dark:bg-blue-500",
  FEEDBACK: "bg-purple-400 dark:bg-purple-500",
  COMPLETE: "bg-green-400 dark:bg-green-500",
} as const;

export type TaskStatusKey = "WAITING" | "IN_PROGRESS" | "FEEDBACK" | "COMPLETE";

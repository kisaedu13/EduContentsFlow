"use client";

import { useState } from "react";
import {
  format,
  addDays,
  differenceInDays,
  startOfDay,
  isToday,
  isWeekend,
  subDays,
  min,
  max,
} from "date-fns";
import { ChevronRight, ChevronDown, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { TASK_GANTT_BAR_COLORS, type TaskStatusKey } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface TaskItem {
  id: string;
  parentId: string | null;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  depth: number;
  sortOrder: number;
}

interface TaskGanttChartProps {
  tasks: TaskItem[];
}

function buildFlatList(tasks: TaskItem[]): TaskItem[] {
  const childrenMap = new Map<string | null, TaskItem[]>();
  for (const t of tasks) {
    if (!childrenMap.has(t.parentId)) childrenMap.set(t.parentId, []);
    childrenMap.get(t.parentId)!.push(t);
  }
  for (const arr of childrenMap.values()) {
    arr.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const result: TaskItem[] = [];
  function dfs(parentId: string | null) {
    for (const child of childrenMap.get(parentId) || []) {
      result.push(child);
      dfs(child.id);
    }
  }
  dfs(null);
  return result;
}

function hasChildren(taskId: string, tasks: TaskItem[]): boolean {
  return tasks.some((t) => t.parentId === taskId);
}

const DAY_WIDTH = 36;
const VISIBLE_DAYS = 42; // 6주

export function TaskGanttChart({ tasks }: TaskGanttChartProps) {
  // 타임라인 범위 계산
  const dates: Date[] = [];
  for (const t of tasks) {
    if (t.startDate) dates.push(new Date(t.startDate));
    if (t.endDate) dates.push(new Date(t.endDate));
  }

  const today = startOfDay(new Date());
  const defaultStart = dates.length > 0 ? startOfDay(subDays(min(dates), 3)) : subDays(today, 7);

  const [timelineStart, setTimelineStart] = useState(defaultStart);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(tasks.map((t) => t.id)));

  const flatList = buildFlatList(tasks);
  const visibleTasks = flatList.filter((task) => {
    let current = task.parentId;
    while (current) {
      if (!expandedIds.has(current)) return false;
      const parent = tasks.find((t) => t.id === current);
      current = parent?.parentId ?? null;
    }
    return true;
  });

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // 일별 컬럼 생성
  const dayCols: Date[] = [];
  for (let i = 0; i < VISIBLE_DAYS; i++) {
    dayCols.push(addDays(timelineStart, i));
  }

  // 월 헤더 계산
  const monthHeaders: { label: string; span: number }[] = [];
  let currentMonth = "";
  for (const d of dayCols) {
    const m = format(d, "yyyy년 M월");
    if (m === currentMonth) {
      monthHeaders[monthHeaders.length - 1].span++;
    } else {
      currentMonth = m;
      monthHeaders.push({ label: m, span: 1 });
    }
  }

  const timelineEnd = addDays(timelineStart, VISIBLE_DAYS);
  const totalDays = VISIBLE_DAYS;

  // 오늘 위치
  const todayOffset = differenceInDays(today, timelineStart);
  const showToday = todayOffset >= 0 && todayOffset < VISIBLE_DAYS;

  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm">
        업무를 추가하면 간트차트가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* 네비게이션 */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTimelineStart((prev) => subDays(prev, 14))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setTimelineStart(subDays(today, 3));
          }}
        >
          오늘
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTimelineStart((prev) => addDays(prev, 14))}
        >
          <ChevronRight className="size-4" />
        </Button>
        <span className="text-[13px] text-muted-foreground">
          {format(timelineStart, "yyyy.MM.dd")} ~ {format(addDays(timelineStart, VISIBLE_DAYS - 1), "yyyy.MM.dd")}
        </span>
      </div>

      <div className="bg-card rounded-[10px] shadow-[var(--shadow-card)] overflow-x-auto border border-border">
        <div style={{ minWidth: 280 + DAY_WIDTH * VISIBLE_DAYS }}>
          {/* 월 헤더 */}
          <div className="flex border-b bg-muted/50">
            <div className="w-[280px] shrink-0 border-r" />
            <div className="flex">
              {monthHeaders.map((m, i) => (
                <div
                  key={i}
                  className="border-r text-center text-xs font-medium py-1 text-muted-foreground"
                  style={{ width: m.span * DAY_WIDTH }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* 일 헤더 */}
          <div className="flex border-b bg-muted/30">
            <div className="w-[280px] shrink-0 border-r px-3 py-1.5 text-xs font-medium text-muted-foreground">
              업무
            </div>
            <div className="flex relative">
              {dayCols.map((d, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-center text-xs py-1.5 border-r",
                    isToday(d) && "bg-indigo-50 dark:bg-indigo-500/10 font-bold text-indigo-600 dark:text-indigo-400",
                    isWeekend(d) && !isToday(d) && "bg-muted/50 text-muted-foreground/60",
                  )}
                  style={{ width: DAY_WIDTH }}
                >
                  <div>{format(d, "d")}</div>
                  <div className="text-[10px]">{format(d, "EEE").charAt(0)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 행 */}
          {visibleTasks.map((task) => {
            const hasChild = hasChildren(task.id, tasks);
            const isExpanded = expandedIds.has(task.id);

            let barStyle: { left: number; width: number } | null = null;
            if (task.startDate && task.endDate) {
              const start = startOfDay(new Date(task.startDate));
              const end = startOfDay(new Date(task.endDate));
              const leftDays = differenceInDays(start, timelineStart);
              const duration = differenceInDays(end, start) + 1;
              barStyle = {
                left: leftDays * DAY_WIDTH,
                width: Math.max(duration, 1) * DAY_WIDTH,
              };
            }

            return (
              <div key={task.id} className="flex border-b last:border-0 hover:bg-muted/20">
                {/* 업무명 */}
                <div className="w-[280px] shrink-0 border-r px-2 py-1.5 flex items-center gap-1" style={{ paddingLeft: 8 + task.depth * 16 }}>
                  {hasChild ? (
                    <button
                      type="button"
                      onClick={() => toggleExpand(task.id)}
                      className="p-0.5 rounded hover:bg-muted flex-shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                      )}
                    </button>
                  ) : (
                    <span className="w-4.5 flex-shrink-0" />
                  )}
                  <span className="text-[13px] truncate">{task.name}</span>
                </div>

                {/* 타임라인 */}
                <div className="flex relative" style={{ height: 32 }}>
                  {/* 일별 격자 */}
                  {dayCols.map((d, i) => (
                    <div
                      key={i}
                      className={cn(
                        "border-r border-border/20",
                        isToday(d) && "bg-indigo-50/50 dark:bg-indigo-500/5",
                        isWeekend(d) && !isToday(d) && "bg-muted/30",
                      )}
                      style={{ width: DAY_WIDTH, height: 32 }}
                    />
                  ))}

                  {/* 오늘 선 */}
                  {showToday && (
                    <div
                      className="absolute top-0 bottom-0 z-10 w-[3px] bg-primary/60"
                      style={{ left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2 }}
                    />
                  )}

                  {/* 바 */}
                  {barStyle && (
                    <div
                      className={cn(
                        "absolute top-1.5 z-20 rounded",
                        hasChild ? "h-2 top-3.5" : "h-5",
                        TASK_GANTT_BAR_COLORS[task.status as TaskStatusKey],
                      )}
                      style={{
                        left: barStyle.left,
                        width: barStyle.width,
                      }}
                      title={`${task.name}: ${task.startDate} ~ ${task.endDate}`}
                    >
                      {!hasChild && task.progress > 0 && (
                        <div
                          className="h-full rounded bg-black/15 dark:bg-white/15"
                          style={{ width: `${task.progress}%` }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

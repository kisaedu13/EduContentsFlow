"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  getWeeksInRange,
  formatWeekLabel,
  isCurrentWeek,
  calcBarPosition,
  getTodayPosition,
} from "@/lib/week-utils";
import { GANTT_BAR_COLORS } from "@/lib/constants";
import { DateEditPopover } from "./date-edit-popover";
import type { ProgressStatus } from "@/generated/prisma/client";

interface GanttPart {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  progressStatus: ProgressStatus;
}

interface GanttProject {
  id: string;
  name: string;
  parts: GanttPart[];
}

interface GanttChartProps {
  projects: GanttProject[];
  timelineStart: string;
  timelineEnd: string;
}

export function GanttChart({
  projects,
  timelineStart,
  timelineEnd,
}: GanttChartProps) {
  const tlStart = new Date(timelineStart);
  const tlEnd = new Date(timelineEnd);
  const weeks = getWeeksInRange(tlStart, tlEnd);
  const todayPercent = getTodayPosition(tlStart, tlEnd);
  const showToday = todayPercent >= 0 && todayPercent <= 100;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="min-w-[800px]">
        {/* 헤더: 파트명 컬럼 + 주 단위 타임라인 */}
        <div className="flex border-b bg-muted/50">
          <div className="w-[200px] shrink-0 border-r px-3 py-2 text-xs font-medium">
            업무
          </div>
          <div className="relative flex-1">
            <div className="flex">
              {weeks.map((week) => (
                <div
                  key={week.toISOString()}
                  className={cn(
                    "flex-1 border-r px-1 py-2 text-center text-[10px] text-muted-foreground",
                    isCurrentWeek(week) && "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                  )}
                >
                  {formatWeekLabel(week)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 본문: 프로젝트별 파트 행 */}
        {projects.map((project) => (
          <div key={project.id}>
            {/* 프로젝트 그룹 헤더 (복수 프로젝트일 때만) */}
            {projects.length > 1 && (
              <div className="flex border-b bg-muted/30">
                <div className="w-[200px] shrink-0 border-r px-3 py-1.5 text-xs font-semibold">
                  {project.name}
                </div>
                <div className="flex-1" />
              </div>
            )}

            {/* 파트 행 */}
            {project.parts.map((part) => {
              const hasSchedule = part.startDate && part.endDate;
              let bar: { leftPercent: number; widthPercent: number } | null = null;
              if (hasSchedule) {
                bar = calcBarPosition(
                  new Date(part.startDate!),
                  new Date(part.endDate!),
                  tlStart,
                  tlEnd,
                );
              }

              return (
                <div key={part.id} className="flex border-b last:border-0 hover:bg-muted/20">
                  {/* 파트명 */}
                  <div className="w-[200px] shrink-0 border-r px-3 py-2">
                    <DateEditPopover
                      projectId={project.id}
                      partId={part.id}
                      partName={part.name}
                      startDate={part.startDate}
                      endDate={part.endDate}
                    >
                      <span className="text-sm hover:text-primary">
                        {part.name}
                      </span>
                    </DateEditPopover>
                    {hasSchedule && (
                      <div className="text-[10px] text-muted-foreground">
                        {format(new Date(part.startDate!), "M/d")} ~ {format(new Date(part.endDate!), "M/d")}
                      </div>
                    )}
                  </div>

                  {/* 타임라인 바 */}
                  <div className="relative flex-1">
                    {/* 주 경계선 */}
                    <div className="absolute inset-0 flex">
                      {weeks.map((week) => (
                        <div
                          key={week.toISOString()}
                          className={cn(
                            "flex-1 border-r border-border/30",
                            isCurrentWeek(week) && "bg-blue-50/50 dark:bg-blue-950/30",
                          )}
                        />
                      ))}
                    </div>

                    {/* 오늘 표시선 */}
                    {showToday && (
                      <div
                        className="absolute top-0 bottom-0 z-10 w-px bg-red-500"
                        style={{ left: `${todayPercent}%` }}
                      />
                    )}

                    {/* 바 */}
                    {bar && (
                      <DateEditPopover
                        projectId={project.id}
                        partId={part.id}
                        partName={part.name}
                        startDate={part.startDate}
                        endDate={part.endDate}
                      >
                        <div
                          className={cn(
                            "absolute top-1.5 z-20 h-5 rounded-sm transition-colors hover:opacity-80",
                            GANTT_BAR_COLORS[part.progressStatus],
                          )}
                          style={{
                            left: `${bar.leftPercent}%`,
                            width: `${bar.widthPercent}%`,
                          }}
                          title={`${part.name}: ${format(new Date(part.startDate!), "yyyy.MM.dd")} ~ ${format(new Date(part.endDate!), "yyyy.MM.dd")}`}
                        />
                      </DateEditPopover>
                    )}

                    {/* 빈 공간 (높이 확보) */}
                    <div className="h-8" />
                  </div>
                </div>
              );
            })}

            {project.parts.length === 0 && (
              <div className="flex border-b">
                <div className="w-[200px] shrink-0 border-r px-3 py-2 text-xs text-muted-foreground">
                  파트 없음
                </div>
                <div className="flex-1" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


import {
  startOfWeek,
  addWeeks,
  format,
  isWithinInterval,
  endOfWeek,
  startOfDay,
  differenceInDays,
  min,
  max,
  subWeeks,
} from "date-fns";
import { ko } from "date-fns/locale";

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function getWeeksInRange(start: Date, end: Date): Date[] {
  const weeks: Date[] = [];
  let current = getWeekStart(start);
  const endWeek = getWeekStart(end);

  while (current <= endWeek) {
    weeks.push(current);
    current = addWeeks(current, 1);
  }

  return weeks;
}

export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return `${format(weekStart, "M/d")}~${format(weekEnd, "M/d")}`;
}

export function isCurrentWeek(weekStart: Date): boolean {
  const now = new Date();
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return isWithinInterval(now, { start: weekStart, end: weekEnd });
}

export function formatDate(date: Date): string {
  return format(date, "yyyy.MM.dd", { locale: ko });
}

// ─── 간트차트 유틸 ──────────────────────────────────────

export function calcBarPosition(
  partStart: Date,
  partEnd: Date,
  timelineStart: Date,
  timelineEnd: Date,
): { leftPercent: number; widthPercent: number } {
  const totalDays = differenceInDays(timelineEnd, timelineStart) || 1;
  const left = differenceInDays(startOfDay(partStart), startOfDay(timelineStart));
  const width = differenceInDays(startOfDay(partEnd), startOfDay(partStart)) + 1;

  return {
    leftPercent: (left / totalDays) * 100,
    widthPercent: (Math.max(width, 1) / totalDays) * 100,
  };
}

export function getTimelineBounds(
  parts: { startDate: Date | null; endDate: Date | null }[],
  projectStart?: Date | null,
  projectEnd?: Date | null,
): { start: Date; end: Date } {
  const dates: Date[] = [];

  if (projectStart) dates.push(projectStart);
  if (projectEnd) dates.push(projectEnd);

  for (const part of parts) {
    if (part.startDate) dates.push(part.startDate);
    if (part.endDate) dates.push(part.endDate);
  }

  if (dates.length === 0) {
    const now = new Date();
    return { start: subWeeks(now, 1), end: addWeeks(now, 8) };
  }

  const earliest = min(dates);
  const latest = max(dates);

  return {
    start: startOfWeek(subWeeks(earliest, 1), { weekStartsOn: 1 }),
    end: endOfWeek(addWeeks(latest, 1), { weekStartsOn: 1 }),
  };
}

export function getTodayPosition(
  timelineStart: Date,
  timelineEnd: Date,
): number {
  const totalDays = differenceInDays(timelineEnd, timelineStart) || 1;
  const todayOffset = differenceInDays(startOfDay(new Date()), startOfDay(timelineStart));
  return (todayOffset / totalDays) * 100;
}

"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, type TaskStatusKey } from "@/lib/constants";

const STATUS_OPTIONS: TaskStatusKey[] = ["WAITING", "IN_PROGRESS", "FEEDBACK", "COMPLETE"];

interface TaskStatusBadgeProps {
  status: TaskStatusKey;
  onChange: (status: TaskStatusKey) => void;
}

export function TaskStatusBadge({ status, onChange }: TaskStatusBadgeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors",
          TASK_STATUS_COLORS[status],
        )}
      >
        {TASK_STATUS_LABELS[status]}
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[100px] rounded-lg border bg-popover p-1 shadow-md">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent",
                status === s && "bg-accent",
              )}
            >
              <span
                className={cn(
                  "inline-block rounded-full px-2 py-0.5 font-medium",
                  TASK_STATUS_COLORS[s],
                )}
              >
                {TASK_STATUS_LABELS[s]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

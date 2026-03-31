"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, type TaskStatusKey } from "@/lib/constants";

const STATUS_OPTIONS: TaskStatusKey[] = ["WAITING", "IN_PROGRESS", "FEEDBACK", "COMPLETE"];

interface TaskStatusBadgeProps {
  status: TaskStatusKey;
  onChange: (status: TaskStatusKey) => void;
}

export function TaskStatusBadge({ status, onChange }: TaskStatusBadgeProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, openUp: false });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 180;
    setPos({
      top: openUp ? rect.top : rect.bottom + 4,
      left: rect.left,
      openUp,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    function handleClickOutside(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", () => setOpen(false), true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", () => setOpen(false), true);
    };
  }, [open, updatePos]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          updatePos();
          setOpen(!open);
        }}
        className={cn(
          "rounded-full px-2.5 py-0.5 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors",
          TASK_STATUS_COLORS[status],
        )}
      >
        {TASK_STATUS_LABELS[status]}
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          className="fixed z-[9999] min-w-[120px] rounded-lg border bg-popover p-1 shadow-lg"
          style={{
            left: pos.left,
            ...(pos.openUp
              ? { bottom: window.innerHeight - pos.top + 4 }
              : { top: pos.top }),
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
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
        </div>,
        document.body,
      )}
    </>
  );
}

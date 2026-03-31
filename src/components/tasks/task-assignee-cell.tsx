"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface Profile {
  id: string;
  name: string;
}

interface TaskAssigneeCellProps {
  assigneeId: string | null;
  assigneeName: string | null;
  profiles: Profile[];
  onChange: (assigneeId: string | null) => void;
}

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-cyan-100 text-cyan-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function TaskAssigneeCell({
  assigneeId,
  assigneeName,
  profiles,
  onChange,
}: TaskAssigneeCellProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
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
        onClick={() => { updatePos(); setOpen(!open); }}
        className="flex items-center gap-2 py-0.5 px-1 rounded hover:bg-muted/50 cursor-pointer"
      >
        {assigneeName ? (
          <>
            <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(assigneeName)}`}>
              {assigneeName.slice(0, 1)}
            </div>
            <span className="text-sm truncate max-w-[70px]">{assigneeName}</span>
          </>
        ) : (
          <>
            <div className="size-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs shrink-0">—</div>
            <span className="text-sm text-muted-foreground">-</span>
          </>
        )}
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          className="fixed z-[9999] min-w-[160px] rounded-lg border bg-popover p-1 shadow-lg"
          style={{ top: pos.top, left: pos.left }}
        >
          <button
            type="button"
            onClick={() => { onChange(null); setOpen(false); }}
            className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent ${!assigneeId ? "bg-accent" : ""}`}
          >
            <div className="size-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs">—</div>
            <span className="text-muted-foreground">미배정</span>
          </button>
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onChange(p.id); setOpen(false); }}
              className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent ${assigneeId === p.id ? "bg-accent" : ""}`}
            >
              <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(p.name)}`}>
                {p.name.slice(0, 1)}
              </div>
              {p.name}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}

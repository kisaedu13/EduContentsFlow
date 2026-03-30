"use client";

import { useState, useRef, useEffect } from "react";

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

export function TaskAssigneeCell({
  assigneeId,
  assigneeName,
  profiles,
  onChange,
}: TaskAssigneeCellProps) {
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
        className="text-sm py-0.5 px-1.5 rounded hover:bg-muted/50 cursor-pointer truncate max-w-[100px] text-left"
      >
        {assigneeName || <span className="text-muted-foreground">-</span>}
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[140px] rounded-lg border bg-popover p-1 shadow-md">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={`w-full text-left rounded-md px-2 py-1 text-sm hover:bg-accent ${!assigneeId ? "bg-accent" : ""}`}
          >
            <span className="text-muted-foreground">미배정</span>
          </button>
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onChange(p.id);
                setOpen(false);
              }}
              className={`w-full text-left rounded-md px-2 py-1 text-sm hover:bg-accent ${assigneeId === p.id ? "bg-accent" : ""}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

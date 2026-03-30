"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from "@/lib/constants";
import { updateProject } from "@/actions/projects";
import type { ProjectStatus } from "@/generated/prisma/client";

const STATUS_OPTIONS: ProjectStatus[] = ["PREPARING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"];

interface ProjectStatusSelectorProps {
  projectId: string;
  status: ProjectStatus;
  name: string;
}

export function ProjectStatusSelector({ projectId, status, name }: ProjectStatusSelectorProps) {
  const [, startTransition] = useTransition();
  const [current, setCurrent] = useState(status);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleSelect(s: ProjectStatus) {
    setCurrent(s);
    setOpen(false);
    startTransition(async () => {
      await updateProject(projectId, { name, status: s });
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors",
          PROJECT_STATUS_COLORS[current],
        )}
      >
        {PROJECT_STATUS_LABELS[current]}
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[100px] rounded-lg border bg-popover p-1 shadow-md">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSelect(s)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent",
                current === s && "bg-accent",
              )}
            >
              <span className={cn("inline-block rounded-full px-2 py-0.5 font-medium", PROJECT_STATUS_COLORS[s])}>
                {PROJECT_STATUS_LABELS[s]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

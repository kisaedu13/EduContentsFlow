import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/generated/prisma/client";

const STATUS_CARD_BORDERS: Record<ProjectStatus, string> = {
  PREPARING: "border-l-[3px] border-l-[var(--status-ready-dot)]",
  IN_PROGRESS: "border-l-[3px] border-l-[var(--status-progress-dot)]",
  COMPLETED: "border-l-[3px] border-l-[var(--status-done-dot)]",
  ON_HOLD: "border-l-[3px] border-l-[var(--status-hold-dot)]",
};

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    startDate: Date | null;
    endDate: Date | null;
    _count: { tasks: number };
  };
}

export function ProjectBoardCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} prefetch={false}>
      <div className={cn(
        "rounded-lg bg-card p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-150",
        STATUS_CARD_BORDERS[project.status],
      )}>
        <h3 className="text-[15px] font-semibold text-foreground leading-snug">
          {project.name}
        </h3>
        {project.description && (
          <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
            {project.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-[12px] text-muted-foreground">
          {project.startDate && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {format(project.startDate, "yyyy.MM.dd")}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <ListChecks className="size-3.5" />
            업무 {project._count.tasks}개
          </span>
        </div>
      </div>
    </Link>
  );
}

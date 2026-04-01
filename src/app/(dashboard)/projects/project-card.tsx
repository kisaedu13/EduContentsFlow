import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, ListChecks } from "lucide-react";
import type { ProjectStatus } from "@/generated/prisma/client";

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
      <div className="rounded-lg bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-150 border border-[#F0F0F0]">
        <h3 className="text-[14px] font-semibold text-foreground leading-snug">
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
              <CalendarDays className="size-3.5 text-[#A1A1AA]" />
              {format(project.startDate, "yyyy.MM.dd")}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <ListChecks className="size-3.5 text-[#A1A1AA]" />
            업무 {project._count.tasks}개
          </span>
        </div>
      </div>
    </Link>
  );
}

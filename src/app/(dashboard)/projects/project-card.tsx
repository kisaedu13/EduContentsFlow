import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from "@/lib/constants";
import type { ProjectStatus } from "@/generated/prisma/client";

const STATUS_BORDER_COLORS: Record<ProjectStatus, string> = {
  PREPARING: "border-l-amber-400",
  IN_PROGRESS: "border-l-sky-400",
  COMPLETED: "border-l-emerald-400",
  ON_HOLD: "border-l-gray-300 dark:border-l-gray-600",
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

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} prefetch={false}>
      <Card className={cn(
        "border-l-[3px] transition-all hover:shadow-md hover:border-l-[3px]",
        STATUS_BORDER_COLORS[project.status],
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{project.name}</CardTitle>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-sm font-medium",
                PROJECT_STATUS_COLORS[project.status],
              )}
            >
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {project.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>업무: {project._count.tasks}개</span>
            {project.startDate && (
              <span>
                {format(project.startDate, "yyyy.MM.dd")}
                {project.endDate && ` ~ ${format(project.endDate, "yyyy.MM.dd")}`}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

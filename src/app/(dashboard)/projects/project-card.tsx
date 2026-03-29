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

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    startDate: Date | null;
    endDate: Date | null;
    template: { name: string } | null;
    _count: { parts: number };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base">{project.name}</CardTitle>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
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
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {project.template && (
              <span>템플릿: {project.template.name}</span>
            )}
            <span>파트: {project._count.parts}개</span>
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

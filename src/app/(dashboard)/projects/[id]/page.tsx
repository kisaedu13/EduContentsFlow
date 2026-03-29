import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PROGRESS_STATUS_LABELS,
  PROGRESS_STATUS_COLORS,
} from "@/lib/constants";
import { PartList } from "./part-list";
import { ProgressBoard } from "@/components/progress/progress-board";
import { GanttChart } from "@/components/schedule/gantt-chart";
import { getTimelineBounds } from "@/lib/week-utils";
import { getAggregateStatus } from "@/lib/constants";
import type { ProgressStatus } from "@/generated/prisma/client";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getCurrentProfile();
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      template: { select: { name: true } },
      tracks: {
        include: {
          phases: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { sortOrder: "asc" },
      },
      parts: {
        include: {
          progress: {
            include: {
              track: { select: { name: true } },
              phase: { select: { name: true } },
            },
          },
          assignments: {
            include: { profile: { select: { name: true } } },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!project) notFound();

  const isAdmin = profile.role === "ADMIN";

  // 진행 현황 요약
  const totalProgress = project.parts.flatMap((p) => p.progress);
  const completedCount = totalProgress.filter((p) => p.status === "COMPLETED").length;
  const totalCount = totalProgress.length;

  return (
    <>
      <Header title={project.name} />
      <main className="flex-1 p-6 space-y-6">
        {/* 프로젝트 정보 */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  PROJECT_STATUS_COLORS[project.status],
                )}
              >
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
            <div className="flex gap-4 text-xs text-muted-foreground">
              {project.template && <span>템플릿: {project.template.name}</span>}
              {project.startDate && (
                <span>
                  {format(project.startDate, "yyyy.MM.dd")}
                  {project.endDate && ` ~ ${format(project.endDate, "yyyy.MM.dd")}`}
                </span>
              )}
              {totalCount > 0 && (
                <span>
                  진행률: {completedCount}/{totalCount} ({Math.round((completedCount / totalCount) * 100)}%)
                </span>
              )}
            </div>
          </div>
          {isAdmin && (
            <Button variant="outline" size="sm" render={<Link href={`/projects/${project.id}/edit`} />}>
              <Pencil className="size-4" />
              편집
            </Button>
          )}
        </div>

        {/* 진행 보드 */}
        {project.parts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">진행 보드</h3>
            <ProgressBoard
              projectId={project.id}
              tracks={project.tracks.map((t) => ({
                id: t.id,
                name: t.name,
                phases: t.phases.map((p) => ({
                  id: p.id,
                  name: p.name,
                  sortOrder: p.sortOrder,
                })),
              }))}
              parts={project.parts.map((part) => ({
                id: part.id,
                name: part.name,
                progress: part.progress.map((p) => ({
                  id: p.id,
                  trackId: p.trackId,
                  trackName: p.track.name,
                  currentPhaseId: p.currentPhaseId,
                  currentPhaseName: p.phase?.name ?? null,
                  status: p.status,
                  note: p.note,
                })),
              }))}
            />
          </div>
        )}

        {/* 간트 차트 */}
        {project.parts.length > 0 && (() => {
          const bounds = getTimelineBounds(
            project.parts.map((p) => ({ startDate: p.startDate, endDate: p.endDate })),
            project.startDate,
            project.endDate,
          );
          return (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">일정</h3>
              <GanttChart
                projects={[{
                  id: project.id,
                  name: project.name,
                  parts: project.parts.map((part) => ({
                    id: part.id,
                    name: part.name,
                    startDate: part.startDate ? format(part.startDate, "yyyy-MM-dd") : null,
                    endDate: part.endDate ? format(part.endDate, "yyyy-MM-dd") : null,
                    progressStatus: getAggregateStatus(
                      part.progress.map((p) => p.status as ProgressStatus),
                    ),
                  })),
                }]}
                timelineStart={format(bounds.start, "yyyy-MM-dd")}
                timelineEnd={format(bounds.end, "yyyy-MM-dd")}
              />
            </div>
          );
        })()}

        {/* 파트 목록 */}
        <PartList
          projectId={project.id}
          parts={project.parts.map((part) => ({
            id: part.id,
            name: part.name,
            sortOrder: part.sortOrder,
            hasPt: part.hasPt,
            hasVideo: part.hasVideo,
            designDuration: part.designDuration,
            finalDuration: part.finalDuration,
            progress: part.progress.map((p) => ({
              trackName: p.track.name,
              phaseName: p.phase?.name ?? null,
              status: p.status,
            })),
            assignments: part.assignments.map((a) => ({
              name: a.profile.name,
              discipline: a.discipline,
            })),
          }))}
          isAdmin={isAdmin}
        />
      </main>
    </>
  );
}

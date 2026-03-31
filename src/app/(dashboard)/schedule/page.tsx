import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { GanttChart } from "@/components/schedule/gantt-chart";
import { getAggregateStatus } from "@/lib/constants";
import { getTimelineBounds } from "@/lib/week-utils";
import { format } from "date-fns";
import type { ProgressStatus } from "@/generated/prisma/client";

export default async function SchedulePage() {
  await getCurrentProfile();

  const projects = await prisma.project.findMany({
    where: { status: { in: ["PREPARING", "IN_PROGRESS"] } },
    include: {
      parts: {
        include: {
          progress: { select: { status: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const allParts = projects.flatMap((p) => p.parts);
  const bounds = getTimelineBounds(
    allParts.map((p) => ({
      startDate: p.startDate,
      endDate: p.endDate,
    })),
  );

  const ganttProjects = projects.map((project) => ({
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
  }));

  return (
    <>
      <Header breadcrumb={[{ label: "일정" }]} />
      <main className="flex-1 p-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          진행 중인 프로젝트의 파트별 일정을 확인합니다.
        </p>

        {ganttProjects.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
            진행 중인 프로젝트가 없습니다.
          </div>
        ) : (
          <GanttChart
            projects={ganttProjects}
            timelineStart={format(bounds.start, "yyyy-MM-dd")}
            timelineEnd={format(bounds.end, "yyyy-MM-dd")}
          />
        )}
      </main>
    </>
  );
}

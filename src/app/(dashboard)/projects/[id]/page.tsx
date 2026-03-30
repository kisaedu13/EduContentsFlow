import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ProjectTabs } from "./project-tabs";
import { TaskGanttChart } from "@/components/tasks/task-gantt-chart";
import { ProjectStatusSelector } from "@/components/projects/project-status-selector";

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
      tasks: {
        include: {
          assignee: { select: { name: true } },
        },
        orderBy: [{ depth: "asc" }, { sortOrder: "asc" }],
      },
      announcements: {
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) notFound();

  const isAdmin = profile.role === "ADMIN";
  const profiles = await prisma.profile.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Task 데이터를 직렬화
  const tasks = project.tasks.map((t) => ({
    id: t.id,
    parentId: t.parentId,
    name: t.name,
    status: t.status,
    assigneeId: t.assigneeId,
    startDate: t.startDate ? format(t.startDate, "yyyy-MM-dd") : null,
    endDate: t.endDate ? format(t.endDate, "yyyy-MM-dd") : null,
    progress: t.progress,
    depth: t.depth,
    sortOrder: t.sortOrder,
    assignee: t.assignee,
  }));

  // 공지 데이터 직렬화
  const announcements = project.announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    authorName: a.author.name,
    authorId: a.author.id,
    createdAt: a.createdAt.toISOString(),
  }));

  // 업무 통계
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETE").length;

  return (
    <>
      <Header title={project.name} />
      <main className="flex-1 p-6 space-y-6">
        {/* 프로젝트 정보 */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <ProjectStatusSelector
                projectId={project.id}
                status={project.status}
                name={project.name}
              />
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
            <div className="flex gap-4 text-xs text-muted-foreground">
              {project.startDate && (
                <span>
                  {format(project.startDate, "yyyy.MM.dd")}
                  {project.endDate && ` ~ ${format(project.endDate, "yyyy.MM.dd")}`}
                </span>
              )}
              {totalTasks > 0 && (
                <span>
                  업무: {completedTasks}/{totalTasks} ({Math.round((completedTasks / totalTasks) * 100)}%)
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

        {/* 탭: 업무 / 일정 / 알림방 */}
        <ProjectTabs
          projectId={project.id}
          tasks={tasks}
          announcements={announcements}
          profiles={profiles}
          currentUserId={profile.id}
          isAdmin={isAdmin}
          ganttChart={
            <TaskGanttChart tasks={tasks} />
          }
        />
      </main>
    </>
  );
}

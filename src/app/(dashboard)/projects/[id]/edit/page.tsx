import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectTaskEditor } from "@/components/projects/project-task-editor";
import { ProjectDeleteButton } from "@/components/projects/project-delete-button";

interface TaskItem {
  name: string;
  children: TaskItem[];
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: [{ depth: "asc" }, { sortOrder: "asc" }],
      },
    },
  });

  if (!project) notFound();

  // 플랫 리스트를 재귀 트리로 변환
  function buildTree(parentId: string | null): TaskItem[] {
    return project!.tasks
      .filter((t) => t.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((t) => ({
        name: t.name,
        children: buildTree(t.id),
      }));
  }

  const taskTree = buildTree(null);

  return (
    <>
      <Header breadcrumb={[{ label: "프로젝트" }, { label: project.name }, { label: "편집" }]} />
      <main className="flex-1 p-6 space-y-8">
        <div className="mx-auto max-w-2xl">
          <h3 className="text-lg font-semibold mb-4">프로젝트 기본 정보</h3>
          <ProjectForm
            projectId={project.id}
            initialData={{
              name: project.name,
              description: project.description,
              status: project.status,
              startDate: project.startDate
                ? format(project.startDate, "yyyy-MM-dd")
                : null,
              endDate: project.endDate
                ? format(project.endDate, "yyyy-MM-dd")
                : null,
            }}
          />
        </div>

        <div className="mx-auto max-w-2xl">
          <h3 className="text-lg font-semibold mb-4">업무 구조</h3>
          <ProjectTaskEditor
            projectId={project.id}
            initialTasks={taskTree}
          />
        </div>

        <div className="mx-auto max-w-2xl border-t pt-6">
          <h3 className="text-lg font-semibold mb-2 text-destructive">위험 영역</h3>
          <p className="text-sm text-muted-foreground mb-4">프로젝트를 삭제하면 모든 업무와 공지사항이 함께 삭제됩니다.</p>
          <ProjectDeleteButton projectId={project.id} projectName={project.name} />
        </div>
      </main>
    </>
  );
}

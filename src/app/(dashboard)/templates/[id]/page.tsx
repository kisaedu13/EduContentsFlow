import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { WorkflowEditor } from "@/components/templates/workflow-editor";

interface TaskItem {
  name: string;
  children: TaskItem[];
}

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const template = await prisma.workflowTemplate.findUnique({
    where: { id },
    include: {
      templateTasks: {
        orderBy: [{ depth: "asc" }, { sortOrder: "asc" }],
      },
    },
  });

  if (!template) notFound();

  // DB의 플랫 리스트를 재귀 트리로 변환
  function buildTree(parentId: string | null): TaskItem[] {
    return template!.templateTasks
      .filter((t) => t.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((t) => ({
        name: t.name,
        children: buildTree(t.id),
      }));
  }

  const tasks = buildTree(null);

  return (
    <>
      <Header title={`${template.name} 편집`} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <WorkflowEditor
            templateId={template.id}
            initialData={{
              name: template.name,
              description: template.description,
              tasks: tasks.length > 0 ? tasks : [{ name: "", children: [] }],
            }}
          />
        </div>
      </main>
    </>
  );
}

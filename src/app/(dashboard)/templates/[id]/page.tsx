import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { WorkflowEditor } from "@/components/templates/workflow-editor";

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
      tracks: {
        include: { phases: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!template) notFound();

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
              tracks: template.tracks.map((t) => ({
                name: t.name,
                sortOrder: t.sortOrder,
                phases: t.phases.map((p) => ({
                  name: p.name,
                  sortOrder: p.sortOrder,
                })),
              })),
            }}
          />
        </div>
      </main>
    </>
  );
}

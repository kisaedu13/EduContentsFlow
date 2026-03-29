import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { ProjectForm } from "@/components/projects/project-form";

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
  });

  if (!project) notFound();

  const templates = await prisma.workflowTemplate.findMany({
    include: {
      tracks: {
        include: { phases: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Header title={`${project.name} 편집`} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <ProjectForm
            templates={templates}
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
      </main>
    </>
  );
}

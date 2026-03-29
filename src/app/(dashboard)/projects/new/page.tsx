import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { ProjectForm } from "@/components/projects/project-form";

export default async function NewProjectPage() {
  const profile = await getCurrentProfile();
  if (profile.role !== "ADMIN") redirect("/dashboard");

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
      <Header title="새 프로젝트 만들기" />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <ProjectForm templates={templates} />
        </div>
      </main>
    </>
  );
}

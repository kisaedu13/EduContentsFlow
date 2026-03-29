import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "./template-card";

export default async function TemplatesPage() {
  const profile = await getCurrentProfile();
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const templates = await prisma.workflowTemplate.findMany({
    include: {
      tracks: {
        include: { phases: true },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header title="워크플로우 템플릿" />
      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            프로젝트 생성 시 사용할 워크플로우 템플릿을 관리합니다.
          </p>
          <Button render={<Link href="/templates/new" />}>
            <Plus className="size-4" />
            새 템플릿
          </Button>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              아직 생성된 템플릿이 없습니다.
            </p>
            <Button
              render={<Link href="/templates/new" />}
              variant="outline"
              className="mt-4"
            >
              <Plus className="size-4" />
              첫 번째 템플릿 만들기
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

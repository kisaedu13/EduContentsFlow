import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Layers } from "lucide-react";
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
      templateTasks: {
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { projects: true, templateTasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header breadcrumb={[{ label: "템플릿" }]} />
      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            프로젝트 생성 시 사용할 업무 템플릿을 관리합니다.
          </p>
          <Button render={<Link href="/templates/new" />}>
            <Plus className="size-4" />
            새 템플릿
          </Button>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-xl bg-muted">
              <Layers className="size-7 text-muted-foreground" />
            </div>
            <p className="font-medium">템플릿이 없습니다</p>
            <p className="mt-1 text-muted-foreground">
              반복 사용하는 업무 구조를 템플릿으로 저장하세요.
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

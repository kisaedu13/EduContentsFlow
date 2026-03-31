import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { unstable_cache } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./project-card";

const getProjectList = unstable_cache(
  async () => {
    return prisma.project.findMany({
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["project-list"],
  { revalidate: 10 },
);

export default async function ProjectsPage() {
  const [profile, projects] = await Promise.all([
    getCurrentProfile(),
    getProjectList(),
  ]);

  const isAdmin = profile.role === "ADMIN";

  return (
    <>
      <Header title="프로젝트" />
      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            교육 콘텐츠 제작 프로젝트를 관리합니다.
          </p>
          {isAdmin && (
            <Button render={<Link href="/projects/new" />}>
              <Plus className="size-4" />
              새 프로젝트
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted">
              <FolderKanban className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              아직 생성된 프로젝트가 없습니다.
            </p>
            {isAdmin && (
              <Button
                render={<Link href="/projects/new" />}
                variant="outline"
                className="mt-4"
              >
                <Plus className="size-4" />
                첫 번째 프로젝트 만들기
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

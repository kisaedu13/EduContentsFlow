import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { unstable_cache } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ProjectBoardCard } from "./project-card";
import type { ProjectStatus } from "@/generated/prisma/client";
import {
  PROJECT_STATUS_LABELS,
  STATUS_DOT_COLORS,
} from "@/lib/constants";

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

const BOARD_COLUMNS: ProjectStatus[] = [
  "PREPARING",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
];

export default async function ProjectsPage() {
  const [profile, projects] = await Promise.all([
    getCurrentProfile(),
    getProjectList(),
  ]);

  const isAdmin = profile.role === "ADMIN";

  const grouped: Partial<Record<ProjectStatus, typeof projects>> = {};
  for (const p of projects) {
    (grouped[p.status] ??= []).push(p);
  }
  // ON_HOLD 열은 해당 프로젝트가 있을 때만 표시
  const visibleColumns = BOARD_COLUMNS.filter(
    (s) => s !== "ON_HOLD" || (grouped[s]?.length ?? 0) > 0,
  );

  return (
    <>
      <Header breadcrumb={[{ label: "프로젝트" }]} />
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

        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: `repeat(${visibleColumns.length}, minmax(0, 1fr))` }}
        >
          {visibleColumns.map((status) => {
            const items = grouped[status] ?? [];
            return (
              <div
                key={status}
                className="flex flex-col rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] min-h-[calc(100vh-200px)]"
              >
                {/* 컬럼 헤더 */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E4E4E7]">
                  <div className="flex items-center gap-2.5">
                    <span className={`size-2.5 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                    <span className="text-[15px] font-semibold text-foreground">
                      {PROJECT_STATUS_LABELS[status]}
                    </span>
                    <span className="flex items-center justify-center size-5 rounded-full bg-[#E4E4E7] text-[11px] font-semibold text-[#52525B]">
                      {items.length}
                    </span>
                  </div>
                </div>
                {/* 카드 목록 */}
                <div className="flex flex-col gap-3 p-3 flex-1">
                  {items.map((project) => (
                    <ProjectBoardCard key={project.id} project={project} />
                  ))}
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center flex-1">
                      <FolderKanban className="size-8 text-[#D4D4D8] mb-2" />
                      <p className="text-[13px] text-muted-foreground">
                        프로젝트가 없습니다
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

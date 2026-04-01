import Link from "next/link";
import { format } from "date-fns";
import { unstable_cache } from "next/cache";
import {
  FolderKanban,
  PlayCircle,
  CheckCircle2,
  PauseCircle,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from "@/lib/constants";
import type { ProjectStatus } from "@/generated/prisma/client";

const getDashboardData = unstable_cache(
  async () => {
    const projectStatusCounts = await prisma.project.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    return { projectStatusCounts };
  },
  ["dashboard-data"],
  { revalidate: 10 },
);

const STATUS_BORDER_COLORS: Record<string, string> = {
  PREPARING: "border-l-amber-400",
  IN_PROGRESS: "border-l-sky-400",
  COMPLETED: "border-l-emerald-400",
  ON_HOLD: "border-l-gray-300 dark:border-l-gray-600",
};

export default async function DashboardPage() {
  const [profile, { projectStatusCounts }] = await Promise.all([
    getCurrentProfile(),
    getDashboardData(),
  ]);

  // 내가 담당자인 프로젝트 조회 (캐싱 불가 - 사용자별 데이터)
  const myProjects = await prisma.project.findMany({
    where: {
      tasks: {
        some: { assigneeId: profile.id },
      },
    },
    include: {
      _count: { select: { tasks: true } },
      tasks: {
        where: { assigneeId: profile.id },
        select: { id: true, status: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const statusCounts = {
    PREPARING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    ON_HOLD: 0,
  };
  let totalProjects = 0;
  for (const row of projectStatusCounts) {
    statusCounts[row.status as keyof typeof statusCounts] = row._count._all;
    totalProjects += row._count._all;
  }

  const statCards = [
    { label: "전체 프로젝트", value: totalProjects, icon: FolderKanban, color: "text-primary", bg: "bg-accent", numColor: "", borderColor: "border-t-primary" },
    { label: "진행중", value: statusCounts.IN_PROGRESS, icon: PlayCircle, color: "text-[var(--status-progress-text)]", bg: "bg-[var(--status-progress-bg)]", numColor: "text-[var(--status-progress-text)]", borderColor: "border-t-[var(--status-progress-dot)]" },
    { label: "완료", value: statusCounts.COMPLETED, icon: CheckCircle2, color: "text-[var(--status-done-text)]", bg: "bg-[var(--status-done-bg)]", numColor: "text-[var(--status-done-text)]", borderColor: "border-t-[var(--status-done-dot)]" },
    { label: "보류", value: statusCounts.ON_HOLD, icon: PauseCircle, color: "text-[var(--status-hold-text)]", bg: "bg-[var(--status-hold-bg)]", numColor: "", borderColor: "border-t-[var(--status-hold-dot)]" },
  ];

  return (
    <>
      <Header breadcrumb={[{ label: "대시보드" }]} />
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ letterSpacing: '-0.3px' }}>안녕하세요, {profile.name}님</h1>
          <p className="text-[15px] text-muted-foreground mt-1">
            교육 콘텐츠 제작 현황을 한눈에 확인하세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className={cn("bg-card rounded-[10px] p-[18px] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-150 border-t-2", card.borderColor)}>
              <div className={cn("flex size-10 items-center justify-center rounded-lg mb-3", card.bg)}>
                <card.icon className={cn("size-5", card.color)} />
              </div>
              <div className="text-[13px] font-medium text-muted-foreground mb-1">{card.label}</div>
              <div className={cn("text-[28px] font-bold tracking-tight", card.numColor)} style={{ letterSpacing: '-0.5px' }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* 내 담당 프로젝트 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-semibold">내 담당 프로젝트</h3>
            <Button variant="ghost" size="sm" render={<Link href="/projects" />}>
              전체 보기 <ArrowRight className="size-4" />
            </Button>
          </div>

          {myProjects.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FolderKanban className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  담당 업무가 배정된 프로젝트가 없습니다.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {myProjects.map((project) => {
                const myTasks = project.tasks;
                const myCompleted = myTasks.filter((t) => t.status === "COMPLETE").length;

                return (
                  <Link key={project.id} href={`/projects/${project.id}`} prefetch={false}>
                    <Card className={cn(
                      "border-l-[3px] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-150",
                      STATUS_BORDER_COLORS[project.status] ?? "",
                    )}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          <span className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                            PROJECT_STATUS_COLORS[project.status as ProjectStatus],
                          )}>
                            {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>내 업무: {myCompleted}/{myTasks.length}건 완료</span>
                          <span>전체: {project._count.tasks}건</span>
                        </div>
                        {myTasks.length > 0 && (
                          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${Math.round((myCompleted / myTasks.length) * 100)}%` }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

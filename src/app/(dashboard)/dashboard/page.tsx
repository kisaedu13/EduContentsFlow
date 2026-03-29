import Link from "next/link";
import { format } from "date-fns";
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
  PROGRESS_STATUS_LABELS,
  PROGRESS_STATUS_COLORS,
} from "@/lib/constants";
import type { ProgressStatus } from "@/generated/prisma/client";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  // 프로젝트 통계
  const projects = await prisma.project.findMany({
    include: {
      parts: {
        include: {
          progress: { select: { status: true } },
        },
      },
    },
  });

  const statusCounts = {
    PREPARING: projects.filter((p) => p.status === "PREPARING").length,
    IN_PROGRESS: projects.filter((p) => p.status === "IN_PROGRESS").length,
    COMPLETED: projects.filter((p) => p.status === "COMPLETED").length,
    ON_HOLD: projects.filter((p) => p.status === "ON_HOLD").length,
  };

  const totalParts = projects.reduce((sum, p) => sum + p.parts.length, 0);
  const allProgress = projects.flatMap((p) => p.parts.flatMap((pt) => pt.progress));
  const completedProgress = allProgress.filter((p) => p.status === "COMPLETED").length;
  const overallPercent = allProgress.length > 0
    ? Math.round((completedProgress / allProgress.length) * 100)
    : 0;

  // 최근 업데이트된 파트 (마감 임박 or 최근 수정)
  const recentParts = await prisma.projectPart.findMany({
    where: {
      project: { status: { in: ["PREPARING", "IN_PROGRESS"] } },
    },
    include: {
      project: { select: { id: true, name: true } },
      progress: {
        select: { status: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  const statCards = [
    { label: "전체 프로젝트", value: projects.length, icon: FolderKanban, color: "text-foreground" },
    { label: "진행중", value: statusCounts.IN_PROGRESS, icon: PlayCircle, color: "text-blue-500" },
    { label: "완료", value: statusCounts.COMPLETED, icon: CheckCircle2, color: "text-green-500" },
    { label: "보류", value: statusCounts.ON_HOLD, icon: PauseCircle, color: "text-gray-400" },
  ];

  return (
    <>
      <Header title="대시보드" />
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">안녕하세요, {profile.name}님</h2>
          <p className="text-sm text-muted-foreground">
            교육 콘텐츠 제작 현황을 한눈에 확인하세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <card.icon className={cn("size-5", card.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 전체 진행률 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 진행률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium w-16 text-right">
                {overallPercent}%
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              전체 {totalParts}개 파트 중 {completedProgress}/{allProgress.length} 트랙 완료
            </p>
          </CardContent>
        </Card>

        {/* 최근 업데이트 파트 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">최근 업데이트</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/projects" />}>
              전체 보기 <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentParts.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 파트가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {recentParts.map((part) => {
                  const latestStatus = (part.progress[0]?.status ?? "NOT_STARTED") as ProgressStatus;
                  return (
                    <Link
                      key={part.id}
                      href={`/projects/${part.project.id}`}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            PROGRESS_STATUS_COLORS[latestStatus],
                          )}
                        >
                          {PROGRESS_STATUS_LABELS[latestStatus]}
                        </span>
                        <span className="truncate font-medium">{part.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {part.project.name}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {format(part.updatedAt, "MM.dd")}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

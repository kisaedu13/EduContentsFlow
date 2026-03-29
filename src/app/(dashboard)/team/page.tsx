import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { TeamList } from "./team-list";

export default async function TeamPage() {
  const profile = await getCurrentProfile();
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const members = await prisma.profile.findMany({
    include: {
      _count: { select: { assignments: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <Header title="팀 관리" />
      <main className="flex-1 p-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          팀원을 추가하고 역할을 관리합니다.
        </p>
        <TeamList
          members={members.map((m) => ({
            id: m.id,
            email: m.email,
            name: m.name,
            role: m.role,
            assignmentCount: m._count.assignments,
            createdAt: m.createdAt.toISOString(),
          }))}
          currentUserId={profile.id}
        />
      </main>
    </>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { error: string };

const UpdateProgressSchema = z.object({
  progressId: z.string(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "BLOCKED"]).optional(),
  currentPhaseId: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export async function updateProgress(
  projectId: string,
  input: z.input<typeof UpdateProgressSchema>,
): Promise<ActionResult> {
  try {
    await getCurrentProfile();

    const parsed = UpdateProgressSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { progressId, status, currentPhaseId, note } = parsed.data;

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (currentPhaseId !== undefined) data.currentPhaseId = currentPhaseId;
    if (note !== undefined) data.note = note;

    await prisma.partProgress.update({
      where: { id: progressId },
      data,
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: null };
  } catch {
    return { error: "진행상황 업데이트에 실패했습니다" };
  }
}

// 단계를 다음으로 진행 (현재 단계 → 다음 단계 + IN_PROGRESS, 마지막이면 COMPLETED)
export async function advancePhase(
  projectId: string,
  progressId: string,
): Promise<ActionResult> {
  try {
    await getCurrentProfile();

    const progress = await prisma.partProgress.findUnique({
      where: { id: progressId },
      include: {
        track: {
          include: {
            phases: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    if (!progress) return { error: "진행 데이터를 찾을 수 없습니다" };

    const phases = progress.track.phases;
    const currentIdx = phases.findIndex((p) => p.id === progress.currentPhaseId);

    if (currentIdx === -1) {
      // 아직 시작 안 됨 → 첫 단계로
      await prisma.partProgress.update({
        where: { id: progressId },
        data: {
          currentPhaseId: phases[0]?.id ?? null,
          status: "IN_PROGRESS",
        },
      });
    } else if (currentIdx < phases.length - 1) {
      // 다음 단계로
      await prisma.partProgress.update({
        where: { id: progressId },
        data: {
          currentPhaseId: phases[currentIdx + 1].id,
          status: "IN_PROGRESS",
        },
      });
    } else {
      // 마지막 단계 → 완료
      await prisma.partProgress.update({
        where: { id: progressId },
        data: { status: "COMPLETED" },
      });
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: null };
  } catch {
    return { error: "단계 진행에 실패했습니다" };
  }
}

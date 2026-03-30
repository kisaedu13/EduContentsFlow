"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getVerifiedProfile } from "@/lib/auth";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { error: string };

const UpdateDatesSchema = z.object({
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export async function updatePartDates(
  projectId: string,
  partId: string,
  input: z.input<typeof UpdateDatesSchema>,
): Promise<ActionResult> {
  try {
    await getVerifiedProfile();

    const parsed = UpdateDatesSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { startDate, endDate } = parsed.data;

    await prisma.projectPart.update({
      where: { id: partId },
      data: {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/schedule");
    return { success: true, data: null };
  } catch {
    return { error: "일정 업데이트에 실패했습니다" };
  }
}

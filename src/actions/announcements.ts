"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { error: string };

const CreateAnnouncementSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1, "제목을 입력하세요"),
  content: z.string().min(1, "내용을 입력하세요"),
});

export async function createAnnouncement(
  input: z.input<typeof CreateAnnouncementSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await getCurrentProfile();

    const parsed = CreateAnnouncementSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { projectId, title, content } = parsed.data;

    const announcement = await prisma.announcement.create({
      data: {
        projectId,
        authorId: profile.id,
        title,
        content,
      },
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { id: announcement.id } };
  } catch {
    return { error: "공지 작성에 실패했습니다" };
  }
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { projectId: true, authorId: true },
    });
    if (!announcement) return { error: "공지를 찾을 수 없습니다" };

    // ADMIN 또는 작성자만 삭제 가능
    if (profile.role !== "ADMIN" && profile.id !== announcement.authorId) {
      return { error: "삭제 권한이 없습니다" };
    }

    await prisma.announcement.delete({ where: { id } });

    revalidatePath(`/projects/${announcement.projectId}`);
    return { success: true, data: null };
  } catch {
    return { error: "공지 삭제에 실패했습니다" };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth";

const PhaseSchema = z.object({
  name: z.string().min(1, "단계 이름을 입력하세요"),
  sortOrder: z.number(),
});

const TrackSchema = z.object({
  name: z.string().min(1, "트랙 이름을 입력하세요"),
  sortOrder: z.number(),
  phases: z.array(PhaseSchema).min(1, "최소 1개 단계가 필요합니다"),
});

const TemplateSchema = z.object({
  name: z.string().min(1, "템플릿 이름을 입력하세요"),
  description: z.string().optional(),
  tracks: z.array(TrackSchema).min(1, "최소 1개 트랙이 필요합니다"),
});

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { error: string };

export async function createTemplate(
  input: z.input<typeof TemplateSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await getCurrentProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    const parsed = TemplateSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { name, description, tracks } = parsed.data;

    const template = await prisma.workflowTemplate.create({
      data: {
        name,
        description: description || null,
        tracks: {
          create: tracks.map((track) => ({
            name: track.name,
            sortOrder: track.sortOrder,
            phases: {
              create: track.phases.map((phase) => ({
                name: phase.name,
                sortOrder: phase.sortOrder,
              })),
            },
          })),
        },
      },
    });

    revalidatePath("/templates");
    return { success: true, data: { id: template.id } };
  } catch {
    return { error: "템플릿 생성에 실패했습니다" };
  }
}

export async function updateTemplate(
  id: string,
  input: z.input<typeof TemplateSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await getCurrentProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    const parsed = TemplateSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { name, description, tracks } = parsed.data;

    await prisma.$transaction(async (tx) => {
      // 기존 트랙/단계 삭제 후 새로 생성 (단순한 접근)
      await tx.workflowTrack.deleteMany({ where: { templateId: id } });

      await tx.workflowTemplate.update({
        where: { id },
        data: {
          name,
          description: description || null,
          tracks: {
            create: tracks.map((track) => ({
              name: track.name,
              sortOrder: track.sortOrder,
              phases: {
                create: track.phases.map((phase) => ({
                  name: phase.name,
                  sortOrder: phase.sortOrder,
                })),
              },
            })),
          },
        },
      });
    });

    revalidatePath("/templates");
    revalidatePath(`/templates/${id}`);
    return { success: true, data: { id } };
  } catch {
    return { error: "템플릿 수정에 실패했습니다" };
  }
}

export async function deleteTemplate(
  id: string,
): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    // 이 템플릿을 사용 중인 프로젝트가 있는지 확인
    const projectCount = await prisma.project.count({
      where: { templateId: id },
    });

    if (projectCount > 0) {
      return { error: `이 템플릿을 사용 중인 프로젝트가 ${projectCount}개 있습니다` };
    }

    await prisma.workflowTemplate.delete({ where: { id } });

    revalidatePath("/templates");
    return { success: true, data: null };
  } catch {
    return { error: "템플릿 삭제에 실패했습니다" };
  }
}

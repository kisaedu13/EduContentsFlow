"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { error: string };

const CreateProjectSchema = z.object({
  name: z.string().min(1, "프로젝트 이름을 입력하세요"),
  description: z.string().optional(),
  templateId: z.string().min(1, "템플릿을 선택하세요"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const UpdateProjectSchema = z.object({
  name: z.string().min(1, "프로젝트 이름을 입력하세요"),
  description: z.string().optional(),
  status: z.enum(["PREPARING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const PartSchema = z.object({
  name: z.string().min(1, "파트 이름을 입력하세요"),
  sortOrder: z.number(),
  designDuration: z.number().nullable().optional(),
  finalDuration: z.number().nullable().optional(),
  hasPt: z.boolean().default(true),
  hasVideo: z.boolean().default(true),
});

// 프로젝트 생성: 템플릿 → 스냅샷 복사
export async function createProject(
  input: z.input<typeof CreateProjectSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await getCurrentProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    const parsed = CreateProjectSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { name, description, templateId, startDate, endDate } = parsed.data;

    // 템플릿 + 트랙 + 단계 조회
    const template = await prisma.workflowTemplate.findUnique({
      where: { id: templateId },
      include: {
        tracks: {
          include: { phases: { orderBy: { sortOrder: "asc" } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!template) return { error: "템플릿을 찾을 수 없습니다" };

    // 트랜잭션: 프로젝트 + 트랙 스냅샷 + 단계 스냅샷
    const project = await prisma.$transaction(async (tx) => {
      const proj = await tx.project.create({
        data: {
          name,
          description: description || null,
          templateId,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
      });

      // 트랙/단계 스냅샷 복사
      for (const track of template.tracks) {
        await tx.projectTrack.create({
          data: {
            projectId: proj.id,
            name: track.name,
            sortOrder: track.sortOrder,
            phases: {
              create: track.phases.map((phase) => ({
                name: phase.name,
                sortOrder: phase.sortOrder,
              })),
            },
          },
        });
      }

      return proj;
    });

    revalidatePath("/projects");
    return { success: true, data: { id: project.id } };
  } catch {
    return { error: "프로젝트 생성에 실패했습니다" };
  }
}

export async function updateProject(
  id: string,
  input: z.input<typeof UpdateProjectSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await getCurrentProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    const parsed = UpdateProjectSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { name, description, status, startDate, endDate } = parsed.data;

    await prisma.project.update({
      where: { id },
      data: {
        name,
        description: description || null,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    return { success: true, data: { id } };
  } catch {
    return { error: "프로젝트 수정에 실패했습니다" };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    await prisma.project.delete({ where: { id } });

    revalidatePath("/projects");
    return { success: true, data: null };
  } catch {
    return { error: "프로젝트 삭제에 실패했습니다" };
  }
}

// 파트 추가 + PartProgress 자동 초기화
export async function addPart(
  projectId: string,
  input: z.input<typeof PartSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await getCurrentProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    const parsed = PartSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { name, sortOrder, designDuration, finalDuration, hasPt, hasVideo } = parsed.data;

    // 프로젝트의 트랙 조회
    const tracks = await prisma.projectTrack.findMany({
      where: { projectId },
      orderBy: { sortOrder: "asc" },
    });

    const part = await prisma.$transaction(async (tx) => {
      const newPart = await tx.projectPart.create({
        data: {
          projectId,
          name,
          sortOrder,
          designDuration: designDuration ?? null,
          finalDuration: finalDuration ?? null,
          hasPt,
          hasVideo,
        },
      });

      // 각 트랙에 대해 PartProgress 초기화
      const progressData = tracks
        .filter((track) => {
          if (track.name === "PT" && !hasPt) return false;
          if (track.name === "영상" && !hasVideo) return false;
          return true;
        })
        .map((track) => ({
          partId: newPart.id,
          trackId: track.id,
        }));

      if (progressData.length > 0) {
        await tx.partProgress.createMany({ data: progressData });
      }

      return newPart;
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { id: part.id } };
  } catch {
    return { error: "파트 추가에 실패했습니다" };
  }
}

export async function removePart(
  projectId: string,
  partId: string,
): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    await prisma.projectPart.delete({ where: { id: partId } });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: null };
  } catch {
    return { error: "파트 삭제에 실패했습니다" };
  }
}

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
  templateId: z.string().optional(),
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

// 프로젝트 생성 (템플릿 선택 시 업무 구조 복사)
export async function createProject(
  input: z.input<typeof CreateProjectSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await getCurrentProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    const parsed = CreateProjectSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { name, description, templateId, startDate, endDate } = parsed.data;

    const project = await prisma.$transaction(async (tx) => {
      const proj = await tx.project.create({
        data: {
          name,
          description: description || null,
          templateId: templateId || null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
      });

      // 템플릿 선택 시 업무 구조 복사
      if (templateId) {
        const templateTasks = await tx.templateTask.findMany({
          where: { templateId },
          orderBy: [{ depth: "asc" }, { sortOrder: "asc" }],
        });

        if (templateTasks.length > 0) {
          // 템플릿 업무 ID → 프로젝트 업무 ID 매핑
          const idMap = new Map<string, string>();

          for (const tt of templateTasks) {
            const task = await tx.task.create({
              data: {
                projectId: proj.id,
                parentId: tt.parentId ? idMap.get(tt.parentId) ?? null : null,
                name: tt.name,
                sortOrder: tt.sortOrder,
                depth: tt.depth,
              },
            });
            idMap.set(tt.id, task.id);
          }
        }
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

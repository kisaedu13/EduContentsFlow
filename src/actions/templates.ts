"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getVerifiedProfile } from "@/lib/auth";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { error: string };

// 재귀적 업무 구조
const TaskItemSchema: z.ZodType<{
  name: string;
  children: { name: string; children: unknown[] }[];
}> = z.lazy(() =>
  z.object({
    name: z.string().min(1, "업무 이름을 입력하세요"),
    children: z.array(TaskItemSchema).default([]),
  }),
);

const TemplateSchema = z.object({
  name: z.string().min(1, "템플릿 이름을 입력하세요"),
  description: z.string().optional(),
  tasks: z.array(TaskItemSchema).min(1, "최소 1개 업무가 필요합니다"),
});

type TaskItem = z.infer<typeof TaskItemSchema>;

export async function createTemplate(
  input: z.input<typeof TemplateSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await getVerifiedProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    const parsed = TemplateSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { name, description, tasks } = parsed.data;

    const template = await prisma.$transaction(async (tx) => {
      const tmpl = await tx.workflowTemplate.create({
        data: { name, description: description || null },
      });

      async function createTasks(items: TaskItem[], parentId: string | null, depth: number) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const task = await tx.templateTask.create({
            data: {
              templateId: tmpl.id,
              parentId,
              name: item.name,
              sortOrder: i,
              depth,
            },
          });
          if (item.children.length > 0) {
            await createTasks(item.children as TaskItem[], task.id, depth + 1);
          }
        }
      }

      await createTasks(tasks as TaskItem[], null, 0);
      return tmpl;
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
    const profile = await getVerifiedProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    const parsed = TemplateSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { name, description, tasks } = parsed.data;

    await prisma.$transaction(async (tx) => {
      // 기존 템플릿 업무 삭제 후 새로 생성
      await tx.templateTask.deleteMany({ where: { templateId: id } });

      await tx.workflowTemplate.update({
        where: { id },
        data: { name, description: description || null },
      });

      async function createTasks(items: TaskItem[], parentId: string | null, depth: number) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const task = await tx.templateTask.create({
            data: {
              templateId: id,
              parentId,
              name: item.name,
              sortOrder: i,
              depth,
            },
          });
          if (item.children.length > 0) {
            await createTasks(item.children as TaskItem[], task.id, depth + 1);
          }
        }
      }

      await createTasks(tasks as TaskItem[], null, 0);
    });

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
    const profile = await getVerifiedProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

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

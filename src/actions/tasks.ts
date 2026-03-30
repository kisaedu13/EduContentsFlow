"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getVerifiedProfile } from "@/lib/auth";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { error: string };

const CreateTaskSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, "업무명을 입력하세요"),
  parentId: z.string().nullable().optional(),
});

const UpdateTaskSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["WAITING", "IN_PROGRESS", "FEEDBACK", "COMPLETE"]).optional(),
  assigneeId: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
});

export async function createTask(
  input: z.input<typeof CreateTaskSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    await getVerifiedProfile();

    const parsed = CreateTaskSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { projectId, name, parentId } = parsed.data;

    let depth = 0;
    if (parentId) {
      const parent = await prisma.task.findUnique({
        where: { id: parentId },
        select: { depth: true },
      });
      if (!parent) return { error: "상위 업무를 찾을 수 없습니다" };
      depth = parent.depth + 1;
    }

    // 같은 부모 아래 마지막 sortOrder
    const lastSibling = await prisma.task.findFirst({
      where: { projectId, parentId: parentId ?? null },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const sortOrder = (lastSibling?.sortOrder ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        projectId,
        parentId: parentId ?? null,
        name,
        depth,
        sortOrder,
      },
    });

    revalidatePath(`/projects/${projectId}`);

    return { success: true, data: { id: task.id } };
  } catch {
    return { error: "업무 생성에 실패했습니다" };
  }
}

export async function updateTask(
  taskId: string,
  input: z.input<typeof UpdateTaskSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    await getVerifiedProfile();

    const parsed = UpdateTaskSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const data: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.progress !== undefined) data.progress = parsed.data.progress;

    if (parsed.data.assigneeId !== undefined) {
      data.assigneeId = parsed.data.assigneeId || null;
    }
    if (parsed.data.startDate !== undefined) {
      data.startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : null;
    }
    if (parsed.data.endDate !== undefined) {
      data.endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data,
      select: { id: true, projectId: true },
    });

    revalidatePath(`/projects/${task.projectId}`);

    return { success: true, data: { id: task.id } };
  } catch {
    return { error: "업무 수정에 실패했습니다" };
  }
}

// 프로젝트 업무 구조 전체 교체 (편집 페이지용)
const TaskItemSchema: z.ZodType<{
  name: string;
  children: { name: string; children: unknown[] }[];
}> = z.lazy(() =>
  z.object({
    name: z.string().min(1, "업무 이름을 입력하세요"),
    children: z.array(TaskItemSchema).default([]),
  }),
);

type TaskItem = z.infer<typeof TaskItemSchema>;

export async function replaceProjectTasks(
  projectId: string,
  tasks: unknown[],
): Promise<ActionResult> {
  try {
    const profile = await getVerifiedProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    const parsed = z.array(TaskItemSchema).safeParse(tasks);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await prisma.$transaction(async (tx) => {
      // 기존 업무 삭제
      await tx.task.deleteMany({ where: { projectId } });

      // 새 업무 구조 생성
      async function createTasks(items: TaskItem[], parentId: string | null, depth: number) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item.name.trim()) continue;
          const task = await tx.task.create({
            data: {
              projectId,
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

      await createTasks(parsed.data as TaskItem[], null, 0);
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: null };
  } catch {
    return { error: "업무 구조 저장에 실패했습니다" };
  }
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  try {
    await getVerifiedProfile();

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });
    if (!task) return { error: "업무를 찾을 수 없습니다" };

    await prisma.task.delete({ where: { id: taskId } });

    revalidatePath(`/projects/${task.projectId}`);

    return { success: true, data: null };
  } catch {
    return { error: "업무 삭제에 실패했습니다" };
  }
}

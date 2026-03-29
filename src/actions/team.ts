"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { error: string };

const CreateUserSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
  name: z.string().min(1, "이름을 입력하세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

// Supabase Admin 클라이언트 (service_role 키 사용)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function createUser(
  input: z.input<typeof CreateUserSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await getCurrentProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    const parsed = CreateUserSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { email, name, password, role } = parsed.data;

    // 이미 존재하는 이메일인지 확인
    const existing = await prisma.profile.findUnique({ where: { email } });
    if (existing) return { error: "이미 등록된 이메일입니다" };

    // Supabase Auth에 사용자 생성
    const admin = getAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error) return { error: `사용자 생성 실패: ${error.message}` };

    // 트리거가 profiles를 자동 생성하므로, role만 업데이트
    if (role === "ADMIN") {
      await prisma.profile.update({
        where: { id: data.user.id },
        data: { role: "ADMIN" },
      });
    }

    revalidatePath("/team");
    return { success: true, data: { id: data.user.id } };
  } catch {
    return { error: "사용자 생성에 실패했습니다" };
  }
}

export async function updateUserRole(
  userId: string,
  role: "ADMIN" | "MEMBER",
): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };
    if (profile.id === userId) return { error: "자신의 역할은 변경할 수 없습니다" };

    await prisma.profile.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/team");
    return { success: true, data: null };
  } catch {
    return { error: "역할 변경에 실패했습니다" };
  }
}

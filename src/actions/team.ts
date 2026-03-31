"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getVerifiedProfile } from "@/lib/auth";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { error: string };

const EMAIL_DOMAIN = "educontents.kr";

const CreateUserSchema = z.object({
  username: z.string().min(1, "아이디를 입력하세요").regex(/^[a-zA-Z0-9_]+$/, "영문, 숫자, 밑줄만 사용 가능합니다"),
  name: z.string().min(1, "이름을 입력하세요"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
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
    const profile = await getVerifiedProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };

    const parsed = CreateUserSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { username, name, password, role } = parsed.data;
    const email = `${username}@${EMAIL_DOMAIN}`;

    // 이미 존재하는 아이디인지 확인
    const existing = await prisma.profile.findUnique({ where: { email } });
    if (existing) return { error: "이미 등록된 아이디입니다" };

    const admin = getAdminClient();
    let userId: string;

    // Supabase Auth에 사용자 생성 시도
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error) {
      // Auth에 이미 있지만 profiles에 없는 경우 → 기존 Auth 유저 활용
      if (error.message.includes("already been registered")) {
        const { data: list } = await admin.auth.admin.listUsers();
        const existing = list?.users.find((u) => u.email === email);
        if (!existing) return { error: "사용자 생성 실패" };
        userId = existing.id;
      } else {
        return { error: `사용자 생성 실패: ${error.message}` };
      }
    } else {
      userId = data.user.id;
    }

    // profiles 테이블에 직접 생성
    await prisma.profile.create({
      data: {
        id: userId,
        email,
        name,
        role,
      },
    });

    revalidatePath("/team");
    return { success: true, data: { id: data.user.id } };
  } catch (e) {
    console.error("createUser error:", e);
    return { error: `사용자 생성에 실패했습니다: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    const profile = await getVerifiedProfile();
    if (profile.role !== "ADMIN") return { error: "권한이 없습니다" };
    if (profile.id === userId) return { error: "자신은 삭제할 수 없습니다" };

    // profiles 테이블에서 삭제
    await prisma.profile.delete({ where: { id: userId } });

    // Supabase Auth에서도 삭제
    const admin = getAdminClient();
    await admin.auth.admin.deleteUser(userId);

    revalidatePath("/team");
    return { success: true, data: null };
  } catch (e) {
    console.error("deleteUser error:", e);
    return { error: "팀원 삭제에 실패했습니다" };
  }
}

export async function updateUserRole(
  userId: string,
  role: "ADMIN" | "MEMBER",
): Promise<ActionResult> {
  try {
    const profile = await getVerifiedProfile();
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

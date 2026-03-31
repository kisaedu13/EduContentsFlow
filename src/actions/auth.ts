"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changePassword(newPassword: string): Promise<{ error?: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 합니다" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: "비밀번호 변경에 실패했습니다" };
  }

  return {};
}

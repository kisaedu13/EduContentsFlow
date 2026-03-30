import { cache } from "react";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Prisma 프로필 조회를 캐싱 (60초)
const getCachedProfile = unstable_cache(
  async (userId: string) => {
    return prisma.profile.findUnique({
      where: { id: userId },
    });
  },
  ["profile"],
  { revalidate: 60 },
);

// 페이지 렌더링용: getSession()은 JWT 쿠키만 읽음 (네트워크 호출 없음)
// JWT 서명 검증은 로컬에서 수행되므로 위변조 불가
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) redirect("/login");

  const profile = await getCachedProfile(session.user.id);

  if (!profile) redirect("/login");

  return profile;
});

// 서버 액션용: getUser()로 Supabase 서버에서 토큰 유효성 검증
export const getVerifiedProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getCachedProfile(user.id);

  if (!profile) redirect("/login");

  return profile;
});

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

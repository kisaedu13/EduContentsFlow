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

export const getCurrentProfile = cache(async () => {
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

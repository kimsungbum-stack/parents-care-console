import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { UserRole } from "@/types/supabase";

export type CurrentUser = {
  id: string;
  email: string | null;
  role: UserRole;
  organizationId: string;
};

/**
 * 현재 로그인한 사용자의 정보 + 역할을 가져온다.
 * 조직이 없으면 null 반환.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const plain = createSupabasePlainClient();
    const { data: userRow } = await plain
      .from("users")
      .select("organization_id, role")
      .eq("id", user.id)
      .limit(1)
      .single();

    if (!userRow) {
      // MVP 폴백: 첫 번째 조직의 admin으로 취급
      const { data: org } = await plain
        .from("organizations")
        .select("id")
        .limit(1)
        .single();

      return org
        ? { id: user.id, email: user.email ?? null, role: "admin", organizationId: org.id }
        : null;
    }

    return {
      id: user.id,
      email: user.email ?? null,
      role: userRow.role as UserRole,
      organizationId: userRow.organization_id,
    };
  } catch {
    return null;
  }
}

/**
 * 관리자 권한 확인
 */
export async function requireAdmin(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

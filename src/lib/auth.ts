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
 * 현재 로그인한 사용자의 조직/역할을 반환한다.
 * 인증되지 않았거나 users 레코드가 없으면 null — fail closed.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const plain = createSupabasePlainClient();
    const { data: userRow, error } = await plain
      .from("users")
      .select("organization_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !userRow) return null;

    return {
      id: user.id,
      email: user.email ?? null,
      role: userRow.role as UserRole,
      organizationId: userRow.organization_id,
    };
  } catch (err) {
    console.error("getCurrentUser error:", err);
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

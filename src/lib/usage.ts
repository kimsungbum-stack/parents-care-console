import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { PlanTier } from "@/types/domain";
import { PLAN_LEAD_LIMITS } from "@/types/domain";

export type OrgUsage = {
  plan: PlanTier;
  orgName: string;
  usedThisMonth: number;
  limit: number | null;
  isAtLimit: boolean;
  isNearLimit: boolean;
};

async function getUserOrg() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createSupabasePlainClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, plan, leads_count_this_month")
    .eq("id", user.organizationId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getOrgUsage(): Promise<OrgUsage | null> {
  const org = await getUserOrg();
  if (!org) return null;

  const plan = org.plan as PlanTier;
  const rawLimit = PLAN_LEAD_LIMITS[plan];
  const limit = rawLimit === Infinity ? null : rawLimit;

  // 이번 달 1일 기준으로 실제 리드 개수 카운트 (캐시된 컬럼 대신)
  const supabase = createSupabasePlainClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", org.id)
    .gte("created_at", monthStart.toISOString());

  const used = count ?? 0;

  return {
    plan,
    orgName: org.name,
    usedThisMonth: used,
    limit,
    isAtLimit: limit !== null && used >= limit,
    isNearLimit: limit !== null && used >= Math.floor(limit * 0.8),
  };
}

// 더 이상 카운터 컬럼을 사용하지 않음 — getOrgUsage가 leads 테이블에서 직접 카운트
export async function incrementLeadCount(): Promise<void> {
  // no-op: 실제 카운트는 leads 테이블 기준
}

export async function resetMonthlyCount(organizationId: string): Promise<void> {
  if (!organizationId) {
    throw new Error("resetMonthlyCount requires an organizationId");
  }

  const supabase = createSupabasePlainClient();
  await supabase
    .from("organizations")
    .update({
      leads_count_this_month: 0,
      ai_analysis_count_this_month: 0,
      usage_reset_at: new Date().toISOString(),
    })
    .eq("id", organizationId);
}

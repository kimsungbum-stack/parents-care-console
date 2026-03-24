import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { PlanTier } from "@/types/domain";
import { PLAN_LEAD_LIMITS } from "@/types/domain";

export type OrgUsage = {
  plan: PlanTier;
  usedThisMonth: number;
  limit: number | null;
  isAtLimit: boolean;
  isNearLimit: boolean;
};

async function getUserOrg() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("organizations")
        .select("id, plan, leads_count_this_month")
        .limit(1)
        .single();

      if (data) return data;
    }
  } catch {
    // auth not available (e.g., external API call) — fall through
  }

  // Fallback: MVP 모드 (인증 없이 첫 번째 조직 사용)
  const supabase = createSupabasePlainClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, plan, leads_count_this_month")
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getOrgUsage(): Promise<OrgUsage | null> {
  const org = await getUserOrg();
  if (!org) return null;

  const plan = org.plan as PlanTier;
  const used = org.leads_count_this_month;
  const rawLimit = PLAN_LEAD_LIMITS[plan];
  const limit = rawLimit === Infinity ? null : rawLimit;

  return {
    plan,
    usedThisMonth: used,
    limit,
    isAtLimit: limit !== null && used >= limit,
    isNearLimit: limit !== null && used >= Math.floor(limit * 0.8),
  };
}

export async function incrementLeadCount(): Promise<void> {
  const org = await getUserOrg();
  if (!org) return;

  const supabase = createSupabasePlainClient();
  await supabase
    .from("organizations")
    .update({ leads_count_this_month: org.leads_count_this_month + 1 })
    .eq("id", org.id);
}

export async function resetMonthlyCount(): Promise<void> {
  const supabase = createSupabasePlainClient();
  await supabase
    .from("organizations")
    .update({ leads_count_this_month: 0, usage_reset_at: new Date().toISOString() });
}

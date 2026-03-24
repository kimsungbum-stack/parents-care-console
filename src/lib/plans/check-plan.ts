import { createSupabasePlainClient } from "@/lib/supabase/plain";
import {
  PLAN_FEATURES,
  PLAN_LEAD_LIMITS,
  type PlanFeature,
  type PlanTier,
} from "@/types/domain";

type PlanCheckResult =
  | { allowed: true; plan: PlanTier }
  | { allowed: false; plan: PlanTier; reason: string };

const DEFAULT_PLAN: PlanTier = "free";

export async function getOrganizationPlan(
  organizationId: string,
): Promise<PlanTier> {
  try {
    const supabase = createSupabasePlainClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("plan")
      .eq("id", organizationId)
      .single();

    if (error || !data) {
      return DEFAULT_PLAN;
    }

    return data.plan;
  } catch {
    return DEFAULT_PLAN;
  }
}

export function hasFeature(plan: PlanTier, feature: PlanFeature): boolean {
  return PLAN_FEATURES[plan].includes(feature);
}

export function getLeadLimit(plan: PlanTier): number {
  return PLAN_LEAD_LIMITS[plan];
}

export async function checkFeatureAccess(
  organizationId: string,
  feature: PlanFeature,
): Promise<PlanCheckResult> {
  const plan = await getOrganizationPlan(organizationId);

  if (hasFeature(plan, feature)) {
    return { allowed: true, plan };
  }

  return {
    allowed: false,
    plan,
    reason: `이 기능은 현재 요금제(${plan})에서 쓸 수 없어요. 요금제를 올리면 이용할 수 있어요.`,
  };
}

export async function checkLeadLimit(
  organizationId: string,
  currentLeadCount: number,
): Promise<PlanCheckResult> {
  const plan = await getOrganizationPlan(organizationId);
  const limit = getLeadLimit(plan);

  if (currentLeadCount < limit) {
    return { allowed: true, plan };
  }

  return {
    allowed: false,
    plan,
    reason: `이번 달 케이스 등록 한도(${limit}건)에 도달했어요. 요금제를 올리면 계속 쓸 수 있어요.`,
  };
}

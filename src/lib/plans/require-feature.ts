import { NextResponse } from "next/server";

import { checkFeatureAccess } from "@/lib/plans/check-plan";
import type { PlanFeature } from "@/types/domain";

/**
 * Guard for API routes that require a specific plan feature.
 * Returns null if access is allowed, or a NextResponse with 403 if denied.
 */
export async function requireFeature(
  organizationId: string | null,
  feature: PlanFeature,
): Promise<NextResponse | null> {
  if (!organizationId) {
    return NextResponse.json(
      { message: "조직 정보가 필요합니다." },
      { status: 401 },
    );
  }

  const result = await checkFeatureAccess(organizationId, feature);

  if (result.allowed) {
    return null;
  }

  return NextResponse.json(
    { message: result.reason, plan: result.plan },
    { status: 403 },
  );
}

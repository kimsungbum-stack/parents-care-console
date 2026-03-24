import { NextResponse } from "next/server";

import { createSupabasePlainClient } from "@/lib/supabase/plain";
import { LEAD_STATUS_ORDER, type LeadStatus } from "@/types/domain";

type FunnelStage = {
  stage: string;
  count: number;
  conversion_rate: number | null;
};

export async function GET() {
  try {
    const supabase = createSupabasePlainClient();

    const { data, error } = await supabase
      .from("leads")
      .select("status, next_contact_date");

    if (error) {
      return NextResponse.json(
        { message: "통계 데이터를 불러오지 못했습니다." },
        { status: 500 },
      );
    }

    const rows = data ?? [];
    const today = new Date().toISOString().slice(0, 10);

    // Count by status
    const statusCounts: Record<string, number> = {};
    for (const status of LEAD_STATUS_ORDER) {
      statusCounts[status] = 0;
    }

    let urgentCount = 0;

    for (const row of rows) {
      const status = row.status as LeadStatus;
      statusCounts[status] = (statusCounts[status] ?? 0) + 1;

      const d = row.next_contact_date as string | null;
      if (d !== null && d <= today) {
        urgentCount++;
      }
    }

    // Build funnel (excluding "보류")
    const funnelStatuses = LEAD_STATUS_ORDER.filter((s) => s !== "보류");
    const funnel: FunnelStage[] = funnelStatuses.map((stage, i) => {
      const count = statusCounts[stage] ?? 0;
      let conversionRate: number | null = null;

      if (i > 0) {
        const prevCount = statusCounts[funnelStatuses[i - 1]] ?? 0;
        conversionRate =
          prevCount > 0 ? Math.round((count / prevCount) * 100) : null;
      }

      return { stage, count, conversion_rate: conversionRate };
    });

    return NextResponse.json({
      status_counts: statusCounts,
      funnel,
      total: rows.length,
      urgent_count: urgentCount,
    });
  } catch {
    return NextResponse.json(
      { message: "통계 조회 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}

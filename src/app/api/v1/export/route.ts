import { NextResponse } from "next/server";

import { createSupabasePlainClient } from "@/lib/supabase/plain";
import { getOrgUsage } from "@/lib/usage";

export async function GET() {
  try {
    const usage = await getOrgUsage();

    if (!usage) {
      return NextResponse.json(
        { message: "조직 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (usage.plan === "free") {
      return NextResponse.json(
        {
          error: "CSV 내보내기는 스탠다드 이상 플랜에서 사용할 수 있어요.",
          code: "PLAN_RESTRICTED",
        },
        { status: 403 },
      );
    }

    const supabase = createSupabasePlainClient();
    const { data, error } = await supabase
      .from("leads")
      .select(
        "guardian_name, phone, status, source, next_contact_date, current_situation_summary, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { message: "데이터를 불러오지 못했습니다." },
        { status: 500 },
      );
    }

    const rows = data ?? [];

    const header =
      "보호자명,전화번호,상태,유입경로,다음연락일,현재상황요약,등록일";

    const csvRows = rows.map((row) => {
      const fields = [
        row.guardian_name,
        row.phone,
        row.status,
        row.source,
        row.next_contact_date ?? "",
        `"${(row.current_situation_summary ?? "").replace(/"/g, '""')}"`,
        row.created_at,
      ];
      return fields.join(",");
    });

    const csv = [header, ...csvRows].join("\n");
    const bom = "\uFEFF";

    return new Response(bom + csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="leads_export.csv"',
      },
    });
  } catch {
    return NextResponse.json(
      { message: "내보내기 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}

import { mapLeadRowsToLeadDetail } from "@/lib/mappers/lead-mappers";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { LeadDetail } from "@/types/domain";

type LeadDetailPageResult =
  | {
      status: "success";
      lead: LeadDetail;
    }
  | {
      status: "not_found";
    }
  | {
      status: "error";
      message: string;
    };

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getLeadDetailPageData(
  leadId: string,
): Promise<LeadDetailPageResult> {
  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "데이터 연결이 아직 완료되지 않아 상세 정보를 불러올 수 없어요.",
    };
  }

  try {
    const supabase = createSupabasePlainClient();
    const { data: leadRow, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError) {
      return {
        status: "error",
        message:
          "케이스 상세 정보를 불러오지 못했어요. 연결 상태를 확인해 주세요.",
      };
    }

    if (!leadRow) {
      return { status: "not_found" };
    }

    const [{ data: consultations, error: consultationsError }, { data: report, error: reportError }, { data: notes, error: notesError }] =
      await Promise.all([
        supabase
          .from("consultations")
          .select("*")
          .eq("lead_id", leadId)
          .order("consulted_at", { ascending: false }),
        supabase.from("reports").select("*").eq("lead_id", leadId).maybeSingle(),
        supabase
          .from("notes")
          .select("*")
          .eq("lead_id", leadId)
          .order("created_at", { ascending: false }),
      ]);

    if (consultationsError || reportError || notesError) {
      return {
        status: "error",
        message:
          "상담, 리포트, 메모 데이터를 불러오지 못했어요.",
      };
    }

    return {
      status: "success",
      lead: mapLeadRowsToLeadDetail({
        lead: leadRow,
        consultations: consultations ?? [],
        report: report ?? null,
        notes: notes ?? [],
      }),
    };
  } catch {
    return {
      status: "error",
      message:
        "케이스 상세 조회 중 문제가 발생했어요. 연결 상태를 확인해 주세요.",
    };
  }
}

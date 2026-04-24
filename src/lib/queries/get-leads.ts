import { getCurrentUser } from "@/lib/auth";
import { mapLeadRowToLeadListItem } from "@/lib/mappers/lead-mappers";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { LeadListItem } from "@/types/domain";

type LeadsPageResult = {
  leads: LeadListItem[];
  notice?: {
    tone: "info" | "error";
    message: string;
  };
};

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getLeadsPageData(): Promise<LeadsPageResult> {
  if (!isSupabaseConfigured()) {
    return {
      leads: [],
      notice: {
        tone: "info",
        message:
          "데이터 연결이 아직 완료되지 않아 빈 목록으로 표시합니다.",
      },
    };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return {
      leads: [],
      notice: {
        tone: "info",
        message: "로그인하면 케이스 목록이 보여요.",
      },
    };
  }

  try {
    const supabase = createSupabasePlainClient();
    const { data: leadRows, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("organization_id", currentUser.organizationId)
      .order("updated_at", { ascending: false });

    if (leadsError) {
      return {
        leads: [],
        notice: {
          tone: "error",
          message:
            "케이스 목록을 불러오지 못했어요. 연결 상태를 확인해 주세요.",
        },
      };
    }

    if (!leadRows || leadRows.length === 0) {
      return { leads: [] };
    }

    const leadIds = leadRows.map((lead) => lead.id);
    const { data: consultationRows } = await supabase
      .from("consultations")
      .select("lead_id, consulted_at")
      .in("lead_id", leadIds)
      .order("consulted_at", { ascending: false });

    const latestConsultationByLead = new Map<string, string>();
    consultationRows?.forEach((consultation) => {
      if (!latestConsultationByLead.has(consultation.lead_id)) {
        latestConsultationByLead.set(
          consultation.lead_id,
          consultation.consulted_at,
        );
      }
    });

    return {
      leads: leadRows.map((lead) =>
        mapLeadRowToLeadListItem(lead, {
          latestConsultationDate:
            latestConsultationByLead.get(lead.id) ?? lead.updated_at,
        }),
      ),
    };
  } catch {
    return {
      leads: [],
      notice: {
        tone: "error",
        message:
          "케이스 목록 조회 중 문제가 발생했어요. 연결 상태를 확인해 주세요.",
      },
    };
  }
}

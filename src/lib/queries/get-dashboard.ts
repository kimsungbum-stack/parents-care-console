import { getCurrentUser } from "@/lib/auth";
import {
  createEmptyDashboardStatusSummary,
  mapConsultationRowToRecentConsultationItem,
  mapLeadRowToUpcomingContactItem,
  mapLeadRowsToDashboardStatusSummary,
} from "@/lib/mappers/dashboard-mappers";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type {
  DashboardStatusSummaryItem,
  RecentConsultationItem,
  UpcomingContactItem,
} from "@/types/domain";

type DashboardPageResult = {
  statusSummary: DashboardStatusSummaryItem[];
  upcomingContacts: UpcomingContactItem[];
  recentConsultations: RecentConsultationItem[];
  notice?: {
    tone: "info" | "error";
    message: string;
  };
};

const UPCOMING_CONTACT_LIMIT = 5;
const RECENT_CONSULTATION_LIMIT = 5;

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getDashboardPageData(): Promise<DashboardPageResult> {
  if (!isSupabaseConfigured()) {
    return {
      statusSummary: createEmptyDashboardStatusSummary(),
      upcomingContacts: [],
      recentConsultations: [],
      notice: {
        tone: "info",
        message:
          "데이터 연결이 아직 완료되지 않아 대시보드를 빈 상태로 표시합니다.",
      },
    };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return {
      statusSummary: createEmptyDashboardStatusSummary(),
      upcomingContacts: [],
      recentConsultations: [],
    };
  }

  try {
    const supabase = createSupabasePlainClient();

    const { data: leadRows, error: leadsError } = await supabase
      .from("leads")
      .select(
        "id, guardian_name, status, next_contact_date, current_situation_summary, consultation_memo",
      )
      .eq("organization_id", currentUser.organizationId)
      .order("updated_at", { ascending: false });

    if (leadsError) {
      return {
        statusSummary: createEmptyDashboardStatusSummary(),
        upcomingContacts: [],
        recentConsultations: [],
        notice: {
          tone: "error",
          message:
            "대시보드 데이터를 불러오지 못했어요. 연결 상태를 확인해 주세요.",
        },
      };
    }

    const statusSummary = mapLeadRowsToDashboardStatusSummary(leadRows ?? []);
    const guardianNameByLeadId = new Map(
      (leadRows ?? []).map((row) => [row.id, row.guardian_name]),
    );
    const upcomingContacts = (leadRows ?? [])
      .filter(
        (
          row,
        ): row is (typeof leadRows)[number] & {
          next_contact_date: string;
        } => Boolean(row.next_contact_date),
      )
      .sort((left, right) =>
        left.next_contact_date.localeCompare(right.next_contact_date),
      )
      .slice(0, UPCOMING_CONTACT_LIMIT)
      .map(mapLeadRowToUpcomingContactItem);

    const orgLeadIds = (leadRows ?? []).map((row) => row.id);
    const { data: consultationRows, error: consultationsError } =
      orgLeadIds.length === 0
        ? { data: [], error: null }
        : await supabase
            .from("consultations")
            .select("id, lead_id, channel, consulted_at, summary")
            .in("lead_id", orgLeadIds)
            .order("consulted_at", { ascending: false })
            .limit(RECENT_CONSULTATION_LIMIT);

    if (consultationsError) {
      return {
        statusSummary,
        upcomingContacts,
        recentConsultations: [],
        notice: {
          tone: "error",
          message:
            "최근 상담 기록을 불러오지 못했어요.",
        },
      };
    }

    const recentConsultations = (consultationRows ?? []).map((row) =>
      mapConsultationRowToRecentConsultationItem(
        row,
        guardianNameByLeadId.get(row.lead_id),
      ),
    );

    return {
      statusSummary,
      upcomingContacts,
      recentConsultations,
    };
  } catch {
    return {
      statusSummary: createEmptyDashboardStatusSummary(),
      upcomingContacts: [],
      recentConsultations: [],
      notice: {
        tone: "error",
        message:
          "대시보드 조회 중 문제가 발생했어요. 연결 상태를 확인해 주세요.",
      },
    };
  }
}

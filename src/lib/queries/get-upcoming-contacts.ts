import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { UpcomingContactItem } from "@/types/domain";

type UpcomingContactsResult = {
  contacts: UpcomingContactItem[];
  error?: string;
};

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getUpcomingContacts(): Promise<UpcomingContactsResult> {
  if (!isSupabaseConfigured()) {
    return { contacts: [], error: "데이터 연결이 설정되지 않았습니다." };
  }

  try {
    const supabase = createSupabasePlainClient();
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, guardian_name, next_contact_date, consultation_memo, current_situation_summary",
      )
      .not("next_contact_date", "is", null)
      .lte("next_contact_date", today)
      .order("next_contact_date", { ascending: true });

    if (error) {
      return {
        contacts: [],
        error: "알림 데이터를 불러오지 못했습니다.",
      };
    }

    const contacts: UpcomingContactItem[] = (data ?? []).map((row) => ({
      id: row.id,
      guardianName: row.guardian_name,
      scheduledDate: row.next_contact_date!,
      note: row.consultation_memo ?? row.current_situation_summary,
    }));

    return { contacts };
  } catch {
    return {
      contacts: [],
      error: "알림 조회 중 문제가 발생했습니다.",
    };
  }
}

import Link from "next/link";
import { Phone, Users, FileText, CheckCircle } from "lucide-react";

import { LeadStatusBadge } from "@/components/leads/status-badge";
import { getUpcomingContacts } from "@/lib/queries/get-upcoming-contacts";
import type { Database } from "@/types/supabase";
import type { LeadStatus, UpcomingContactItem } from "@/types/domain";

type LeadRow = Pick<
  Database["public"]["Tables"]["leads"]["Row"],
  | "id"
  | "guardian_name"
  | "care_recipient_name"
  | "care_recipient_age_group"
  | "hospital_name"
  | "current_situation_summary"
  | "status"
  | "next_contact_date"
  | "created_at"
>;

const statusKeys: LeadStatus[] = ["신규", "1차답장", "인터뷰예정", "인터뷰완료", "소개대기", "보류"];

function daysSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "미정";
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
}

function isOverdue(dateStr: string | null) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

function isToday(dateStr: string | null) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function buildDiagnosis(lead: LeadRow) {
  return [lead.care_recipient_name, lead.care_recipient_age_group, lead.hospital_name]
    .filter(Boolean)
    .join(" · ");
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "좋은 아침이에요 ☀️";
  if (hour < 18) return "좋은 오후예요 🌤️";
  return "수고 많으셨어요 🌙";
}

function getSummaryLine(totalCount: number, urgentCount: number) {
  if (totalCount === 0) {
    return "아직 케이스가 없어요. 첫 케이스를 등록해볼까요?";
  }

  if (urgentCount > 0) {
    return `오늘 연락이 필요한 ${urgentCount}건만 먼저 처리하면 돼요.`;
  }

  return "급한 후속 연락은 없어요. 신규 케이스 정리부터 천천히 시작하면 돼요.";
}

export const dynamic = "force-dynamic";

async function fetchLeads(): Promise<LeadRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const params = new URLSearchParams({
    select: "id,guardian_name,care_recipient_name,care_recipient_age_group,hospital_name,current_situation_summary,status,next_contact_date,created_at",
    order: "next_contact_date.asc.nullslast",
    limit: "20",
  });

  const res = await fetch(`${url}/rest/v1/leads?${params}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Dashboard fetch error:", res.status, await res.text());
    return [];
  }

  return res.json() as Promise<LeadRow[]>;
}

export default async function DashboardPage() {
  let allLeads: LeadRow[] = [];

  try {
    allLeads = await fetchLeads();
  } catch (err) {
    console.error("Dashboard exception:", err);
  }

  const totalCount = allLeads.length;
  const statusCounts = Object.fromEntries(
    statusKeys.map((key) => [key, allLeads.filter((lead) => lead.status === key).length]),
  );
  const recentLeads = [...allLeads].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 3);

  let upcomingContacts: UpcomingContactItem[] = [];
  try {
    const contactResult = await getUpcomingContacts();
    upcomingContacts = contactResult.contacts;
  } catch (err) {
    console.error("Upcoming contacts exception:", err);
  }
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[15px] text-[#78716C]">{today}</p>
          <h1 className="mt-1 text-[24px] font-bold tracking-tight text-[#292524]">{getGreeting()}</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-[1.6] text-[#78716C]">
            {getSummaryLine(totalCount, upcomingContacts.length)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/leads"
            className="control-button-secondary inline-flex text-[14px]"
          >
            케이스 목록
          </Link>
          <Link
            href="/leads/new"
            className="control-button-primary inline-flex text-[14px]"
          >
            + 신규 케이스
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="전체 케이스" value={totalCount} sub={totalCount > 0 ? `이번 주 신규 ${recentLeads.length}건 확인` : "등록된 케이스 없음"} tone="default" icon={<Users size={18} />} />
        <MetricCard label="오늘 연락 필요" value={upcomingContacts.length} sub={upcomingContacts.length > 0 ? `${upcomingContacts.length}건 연락 대기` : "오늘 연락 우선순위 없음"} tone="amber" icon={<Phone size={18} />} />
        <MetricCard label="리포트 발송 대기" value={statusCounts["소개대기"] ?? 0} sub="설명 후 리포트 정리 대상" tone="default" icon={<FileText size={18} />} />
        <MetricCard label="서비스 연계 완료" value={statusCounts["인터뷰완료"] ?? 0} sub="인터뷰 완료 기준" tone="success" icon={<CheckCircle size={18} />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-xl border border-[#E7E0D5] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#E7E0D5] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-[#292524]">케이스 현황</h2>
              <p className="mt-1 text-[13px] text-[#78716C]">운영 중인 케이스를 한눈에 보고, 필요한 리드부터 바로 들어가면 돼요.</p>
            </div>
            <Link href="/leads" className="text-[14px] font-medium text-[#D97706] hover:text-[#B45309]">
              전체 보기 →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#E7E0D5] bg-[#FEFCF8] text-left text-[13px] text-[#78716C]">
                  <th className="px-5 py-3 font-medium">이름</th>
                  <th className="px-5 py-3 font-medium">케어 대상</th>
                  <th className="px-5 py-3 font-medium">경과일</th>
                  <th className="px-5 py-3 font-medium">다음 연락</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {allLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-[15px] text-[#78716C]">
                      아직 케이스가 없어요. 첫 케이스를 등록해볼까요?
                    </td>
                  </tr>
                ) : (
                  allLeads.map((lead) => {
                    const overdue = isOverdue(lead.next_contact_date);
                    const todayLabel = isToday(lead.next_contact_date);

                    return (
                      <tr key={lead.id} className="border-b border-[#E7E0D5]/60 transition-colors hover:bg-[#FEF3C7]/30">
                        <td className="px-5 py-4 align-top">
                          <Link href={`/leads/${lead.id}`} className="block">
                            <p className="text-[15px] font-semibold text-[#292524]">{lead.guardian_name}</p>
                            <p className="mt-1 line-clamp-2 text-[13px] leading-[1.6] text-[#78716C]">{lead.current_situation_summary}</p>
                          </Link>
                        </td>
                        <td className="px-5 py-4 align-top text-[15px] text-[#292524]">
                          {buildDiagnosis(lead) || "미입력"}
                        </td>
                        <td className="px-5 py-4 align-top text-[15px] font-semibold text-[#292524]">
                          D+{daysSince(lead.created_at)}
                        </td>
                        <td className="px-5 py-4 align-top text-[15px] font-medium">
                          <span className={overdue ? "text-[#DC2626]" : todayLabel ? "text-[#D97706]" : "text-[#78716C]"}>
                            {overdue ? "기한 초과" : todayLabel ? "오늘" : formatDate(lead.next_contact_date)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <LeadStatusBadge status={lead.status as LeadStatus} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <section className="overflow-hidden rounded-xl border border-[#E7E0D5] bg-white">
            <div className="flex items-center justify-between border-b border-[#E7E0D5] px-5 py-4">
              <h2 className="text-[16px] font-bold text-[#292524]">오늘 연락 필요</h2>
              {upcomingContacts.length > 0 && (
                <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[13px] font-bold text-[#D97706]">{upcomingContacts.length}</span>
              )}
            </div>
            {upcomingContacts.length === 0 ? (
              <div className="px-5 py-10 text-[15px] leading-[1.6] text-[#78716C]">
                오늘 급한 후속은 없어요. 신규 문의 정리나 리포트 업데이트부터 시작하면 돼요.
              </div>
            ) : (
              <div>
                {upcomingContacts.slice(0, 4).map((contact) => {
                  const contactOverdue = isOverdue(contact.scheduledDate);
                  return (
                    <Link href={`/leads/${contact.id}`} key={contact.id} className="flex items-center gap-3 border-b border-[#E7E0D5]/60 px-5 py-4 transition-colors hover:bg-[#FEF3C7]/30">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${contactOverdue ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#FEF3C7] text-[#D97706]"}`}>
                        {contact.guardianName.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-[#292524]">{contact.guardianName} 보호자</p>
                        <p className="mt-0.5 truncate text-[13px] text-[#78716C]">{contact.note || "메모 없음"}</p>
                      </div>
                      <span className={`text-[13px] font-semibold ${contactOverdue ? "text-[#DC2626]" : "text-[#D97706]"}`}>{contactOverdue ? "초과" : "오늘"}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[#E7E0D5] bg-white px-5 py-5">
            <h2 className="text-[16px] font-bold text-[#292524]">이렇게 쓰면 돼요</h2>
            <div className="mt-4 space-y-3">
              {[
                { step: "01", title: "신규 케이스 등록", desc: "전화나 문의가 들어오면 보호자명, 연락처, 현재 상황만 먼저 저장해요." },
                { step: "02", title: "상태와 다음 연락일 정리", desc: "상세 화면에서 현재 단계와 다음 연락일만 정리해도 운영 흐름이 바로 생겨요." },
                { step: "03", title: "상담 기록과 메모 남기기", desc: "후속 통화 뒤에는 상담 기록, 운영 메모, 보호자 리포트를 차례대로 남기면 돼요." },
              ].map((item) => (
                <div key={item.step} className="rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#D97706] px-2 py-0.5 text-[13px] font-bold text-white">{item.step}</span>
                    <p className="text-[15px] font-semibold text-[#292524]">{item.title}</p>
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.6] text-[#78716C]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#E7E0D5] bg-white px-5 py-5">
            <h2 className="text-[16px] font-bold text-[#292524]">최근 등록 케이스</h2>
            <div className="mt-4 space-y-3">
              {recentLeads.length === 0 ? (
                <p className="text-[15px] leading-[1.6] text-[#78716C]">아직 등록된 케이스가 없어요.</p>
              ) : (
                recentLeads.map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`} className="block rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-3 transition-colors hover:bg-[#FEF3C7]/30">
                    <p className="text-[15px] font-semibold text-[#292524]">{lead.guardian_name}</p>
                    <p className="mt-1 text-[13px] leading-[1.6] text-[#78716C]">{lead.current_situation_summary}</p>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, tone, icon }: { label: string; value: number; sub: string; tone: "default" | "amber" | "success"; icon: React.ReactNode }) {
  const barColor =
    tone === "amber"
      ? "bg-[#D97706]"
      : tone === "success"
        ? "bg-[#16A34A]"
        : "bg-[#A8A29E]";

  const valueColor =
    tone === "amber"
      ? "text-[#D97706]"
      : tone === "success"
        ? "text-[#16A34A]"
        : "text-[#D97706]";

  return (
    <div className="flex overflow-hidden rounded-xl border border-[#E7E0D5] bg-white">
      <div className={`w-1 ${barColor}`} />
      <div className="flex-1 px-5 py-4">
        <div className="flex items-center gap-2 text-[#78716C]">
          {icon}
          <p className="text-[13px] font-medium">{label}</p>
        </div>
        <p className={`mt-2 text-[32px] font-bold leading-none ${valueColor}`}>{value}</p>
        <p className="mt-2 text-[13px] text-[#78716C]">{sub}</p>
      </div>
    </div>
  );
}

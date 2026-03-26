import Link from "next/link";
import { Phone, Users } from "lucide-react";
import { FunnelChart, type FunnelDataItem } from "@/components/dashboard/funnel-chart";
/* AI 기능 준비 중 - API 키 연동 후 활성화 */
// import { RecordingUploadButton } from "@/components/dashboard/recording-upload-button";
// import { UsageBanner } from "@/components/dashboard/usage-banner";
import { PilotBanner } from "@/components/dashboard/pilot-banner";
import { OnboardingGuide } from "@/components/onboarding/onboarding-guide";
import { DashboardFunnelToggle } from "@/components/dashboard/dashboard-funnel-toggle";

import { LeadStatusBadge } from "@/components/leads/status-badge";
import { getUpcomingContacts } from "@/lib/queries/get-upcoming-contacts";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { Database } from "@/types/supabase";
import { getStatusLabel, type LeadStatus, type UpcomingContactItem } from "@/types/domain";

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
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "좋은 오후예요";
  return "수고 많으셨어요";
}

function getTodaySummary(totalCount: number, urgentCount: number, overdueCount: number, newCount: number) {
  const parts: string[] = [];

  if (urgentCount > 0) {
    parts.push(`연락 ${urgentCount}건`);
  }
  if (overdueCount > 0) {
    parts.push(`기한 초과 ${overdueCount}건`);
  }
  if (newCount > 0) {
    parts.push(`신규 정리 ${newCount}건`);
  }

  if (parts.length === 0) {
    if (totalCount === 0) return "첫 케이스를 등록하면 오늘 할 일이 여기 나와요.";
    return "오늘 급한 건 없어요. 여유 있게 시작하세요.";
  }

  return `오늘 할 일: ${parts.join(", ")}`;
}

export const dynamic = "force-dynamic";

async function fetchLeads(): Promise<LeadRow[]> {
  try {
    const supabase = createSupabasePlainClient();
    const { data, error } = await supabase
      .from("leads")
      .select("id,guardian_name,care_recipient_name,care_recipient_age_group,hospital_name,current_situation_summary,status,next_contact_date,created_at")
      .order("next_contact_date", { ascending: true, nullsFirst: false })
      .limit(20);

    if (error) {
      console.error("Dashboard fetch error:", error);
      return [];
    }
    return (data ?? []) as LeadRow[];
  } catch (err) {
    console.error("Dashboard exception:", err);
    return [];
  }
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
  const newCount = statusCounts["신규"] ?? 0;
  const recentLeads = [...allLeads].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 3);

  let upcomingContacts: UpcomingContactItem[] = [];
  try {
    const contactResult = await getUpcomingContacts();
    upcomingContacts = contactResult.contacts;
  } catch (err) {
    console.error("Upcoming contacts exception:", err);
  }
  const overdueCount = upcomingContacts.filter((c) => isOverdue(c.scheduledDate)).length;

  const funnelStages: { label: string; status: LeadStatus; color: string }[] = [
    { label: getStatusLabel("신규"), status: "신규", color: "#3B82F6" },
    { label: getStatusLabel("1차답장"), status: "1차답장", color: "#F59E0B" },
    { label: getStatusLabel("인터뷰예정"), status: "인터뷰예정", color: "#8B5CF6" },
    { label: getStatusLabel("인터뷰완료"), status: "인터뷰완료", color: "#10B981" },
    { label: getStatusLabel("소개대기"), status: "소개대기", color: "#6B7280" },
  ];
  const funnelData: FunnelDataItem[] = funnelStages.map((stage, i, arr) => {
    const count = statusCounts[stage.status] ?? 0;
    const prevCount = i === 0 ? null : statusCounts[arr[i - 1].status] ?? 0;
    const conversion = prevCount === null ? null : prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
    return {
      label: stage.label,
      count,
      color: stage.color,
      displayLabel: conversion !== null ? `${count}건 (${conversion}%)` : `${count}건`,
    };
  });

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8">
      <PilotBanner />
      <OnboardingGuide />
      {/* AI 기능 준비 중 - API 키 연동 후 활성화 */}
      {/* <UsageBanner /> */}

      {/* 1. 인사 + 오늘 할 일 요약 */}
      <div className="mb-5">
        <p className="text-[14px] text-[#78716C]">{today}</p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight text-[#292524]">{getGreeting()}</h1>
        <p className="mt-2 text-[15px] font-medium leading-[1.6] text-[#44403C]">
          {getTodaySummary(totalCount, upcomingContacts.length, overdueCount, newCount)}
        </p>
      </div>

      {/* AI 기능 준비 중 - API 키 연동 후 활성화 */}
      {/* <div className="mb-5">
        <RecordingUploadButton />
      </div> */}

      {/* 3. 오늘 연락 필요 — 바로 아래 */}
      {upcomingContacts.length > 0 && (
        <section className="mb-5 overflow-hidden rounded-xl border border-[#E7E0D5] bg-white">
          <div className="flex items-center justify-between border-b border-[#E7E0D5] px-5 py-3">
            <div className="flex items-center gap-2">
              <Phone size={16} className={overdueCount > 0 ? "text-[#DC2626]" : "text-[#D97706]"} />
              <h2 className="text-[15px] font-bold text-[#292524]">오늘 연락 필요</h2>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${overdueCount > 0 ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#FEF3C7] text-[#D97706]"}`}>
              {upcomingContacts.length}건
            </span>
          </div>
          <div className="divide-y divide-[#E7E0D5]/60">
            {upcomingContacts.slice(0, 5).map((contact) => {
              const contactOverdue = isOverdue(contact.scheduledDate);
              return (
                <Link href={`/leads/${contact.id}`} key={contact.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#FEF3C7]/30">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${contactOverdue ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#FEF3C7] text-[#D97706]"}`}>
                    {contact.guardianName.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[#292524]">{contact.guardianName} 보호자</p>
                    <p className="mt-0.5 truncate text-[13px] text-[#78716C]">{contact.note || "메모 없음"}</p>
                  </div>
                  <span className={`text-[13px] font-bold ${contactOverdue ? "text-[#DC2626]" : "text-[#D97706]"}`}>
                    {contactOverdue ? "기한 초과" : "오늘"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. 핵심 숫자 2개만 — 전체 케이스 + 신규 */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Link href="/leads" className="rounded-xl border border-[#E7E0D5] bg-white p-4 transition-colors hover:bg-[#FEF3C7]/30">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#78716C]" />
            <span className="text-[13px] font-medium text-[#78716C]">전체 케이스</span>
          </div>
          <p className="mt-2 text-[28px] font-bold leading-none text-[#292524]">{totalCount}</p>
        </Link>
        <Link href="/pipeline" className="rounded-xl border border-[#E7E0D5] bg-white p-4 transition-colors hover:bg-[#FEF3C7]/30">
          <div className="flex items-center gap-2">
            <Phone size={16} className={upcomingContacts.length > 0 ? "text-[#D97706]" : "text-[#78716C]"} />
            <span className="text-[13px] font-medium text-[#78716C]">오늘 연락</span>
          </div>
          <p className={`mt-2 text-[28px] font-bold leading-none ${upcomingContacts.length > 0 ? "text-[#D97706]" : "text-[#292524]"}`}>
            {upcomingContacts.length}
          </p>
        </Link>
      </div>

      {/* 5. 퍼널 차트 — 접이식 */}
      {totalCount > 0 && (
        <div className="mb-5">
          <DashboardFunnelToggle funnelData={funnelData} />
        </div>
      )}

      {/* 6. 케이스 현황 + 최근 등록 — 그리드 */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-xl border border-[#E7E0D5] bg-white">
          <div className="flex items-center justify-between border-b border-[#E7E0D5] px-5 py-4">
            <h2 className="text-[16px] font-bold text-[#292524]">케이스 현황</h2>
            <div className="flex items-center gap-2">
              <Link href="/leads/new" className="rounded-lg bg-[#D97706] px-3 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-[#B45309]">
                + 신규
              </Link>
              <Link href="/leads" className="text-[13px] font-medium text-[#D97706] hover:text-[#B45309]">
                전체 보기 →
              </Link>
            </div>
          </div>

          {allLeads.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-[16px] font-semibold text-[#292524]">아직 케이스가 없어요</p>
              <p className="mt-1 text-[14px] text-[#78716C]">전화 끝나고 녹음을 올리거나, 직접 등록하면 돼요.</p>
              <Link href="/leads/new" className="mt-4 inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-[#D97706] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309]">
                + 첫 케이스 등록하기
              </Link>
            </div>
          ) : (
            <>
              {/* 모바일: 카드형 */}
              <div className="divide-y divide-[#E7E0D5]/60 lg:hidden">
                {allLeads.slice(0, 8).map((lead) => {
                  const overdue = isOverdue(lead.next_contact_date);
                  const todayLabel = isToday(lead.next_contact_date);
                  return (
                    <Link key={lead.id} href={`/leads/${lead.id}`} className="block px-5 py-3.5 transition-colors hover:bg-[#FEF3C7]/30">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[15px] font-semibold text-[#292524]">{lead.guardian_name}</p>
                            {(overdue || todayLabel) && (
                              <span className={`text-[12px] font-bold ${overdue ? "text-[#DC2626]" : "text-[#D97706]"}`}>
                                {overdue ? "기한 초과" : "오늘"}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[13px] text-[#78716C]">{buildDiagnosis(lead) || lead.current_situation_summary || "미입력"}</p>
                        </div>
                        <LeadStatusBadge status={lead.status as LeadStatus} />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* 데스크탑: 테이블형 */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[#E7E0D5] bg-[#FEFCF8] text-left text-[13px] text-[#78716C]">
                      <th className="px-5 py-3 font-medium">이름</th>
                      <th className="px-5 py-3 font-medium">케어 대상</th>
                      <th className="px-5 py-3 font-medium">다음 연락</th>
                      <th className="px-5 py-3 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLeads.map((lead) => {
                      const overdue = isOverdue(lead.next_contact_date);
                      const todayLabel = isToday(lead.next_contact_date);
                      return (
                        <tr key={lead.id} className="border-b border-[#E7E0D5]/60 transition-colors hover:bg-[#FEF3C7]/30">
                          <td className="px-5 py-3.5 align-top">
                            <Link href={`/leads/${lead.id}`} className="block">
                              <p className="text-[15px] font-semibold text-[#292524]">{lead.guardian_name}</p>
                              <p className="mt-0.5 line-clamp-1 text-[13px] text-[#78716C]">{lead.current_situation_summary}</p>
                            </Link>
                          </td>
                          <td className="px-5 py-3.5 align-top text-[14px] text-[#292524]">{buildDiagnosis(lead) || "미입력"}</td>
                          <td className="px-5 py-3.5 align-top text-[14px] font-medium">
                            <span className={overdue ? "text-[#DC2626]" : todayLabel ? "text-[#D97706]" : "text-[#78716C]"}>
                              {overdue ? "기한 초과" : todayLabel ? "오늘" : formatDate(lead.next_contact_date)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 align-top"><LeadStatusBadge status={lead.status as LeadStatus} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <div className="flex flex-col gap-5">
          <section className="rounded-xl border border-[#E7E0D5] bg-white px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#292524]">최근 등록</h2>
            {recentLeads.length === 0 ? (
              <p className="mt-3 text-[14px] text-[#78716C]">첫 문의가 들어오면 여기에 바로 나타나요.</p>
            ) : (
              <div className="mt-2 divide-y divide-[#F5F0E8]">
                {recentLeads.map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`} className="flex items-center justify-between py-2.5 transition-colors hover:text-[#D97706]">
                    <div className="min-w-0 pr-3">
                      <p className="text-[14px] font-semibold text-[#292524]">{lead.guardian_name}</p>
                      <p className="mt-0.5 line-clamp-1 text-[13px] text-[#78716C]">{lead.current_situation_summary}</p>
                    </div>
                    <span className="flex-shrink-0 text-[13px] text-[#A8A29E]">→</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* 빠른 링크 */}
          <div className="grid grid-cols-2 gap-2">
            <Link href="/leads/new" className="rounded-xl border border-[#E7E0D5] bg-white px-4 py-3 text-center text-[14px] font-medium text-[#292524] transition-colors hover:bg-[#FEF3C7]/30">
              + 신규 등록
            </Link>
            <Link href="/pipeline" className="rounded-xl border border-[#E7E0D5] bg-white px-4 py-3 text-center text-[14px] font-medium text-[#292524] transition-colors hover:bg-[#FEF3C7]/30">
              진행 현황
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowDown, ArrowUp, Calendar, CheckCircle2, FileText, Mic, Minus, Phone, Sparkles, UserPlus, Users } from "lucide-react";
import { type FunnelDataItem } from "@/components/dashboard/funnel-chart";
import { PilotBanner } from "@/components/dashboard/pilot-banner";
import { OnboardingGuide } from "@/components/onboarding/onboarding-guide";
import { DashboardFunnelToggle } from "@/components/dashboard/dashboard-funnel-toggle";
import { RecordingUploadButton } from "@/components/dashboard/recording-upload-button";

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
      .limit(500);

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
  const interviewScheduledCount = statusCounts["인터뷰예정"] ?? 0;
  const introductionWaitingCount = statusCounts["소개대기"] ?? 0;
  const recentLeads = [...allLeads].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 3);

  // 주간 신규 등록 비교 (이번주 vs 지난주)
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  twoWeeksAgo.setHours(0, 0, 0, 0);

  const newThisWeek = allLeads.filter((l) => new Date(l.created_at) >= weekAgo).length;
  const newLastWeek = allLeads.filter((l) => {
    const d = new Date(l.created_at);
    return d >= twoWeeksAgo && d < weekAgo;
  }).length;
  const weekTrend = newThisWeek - newLastWeek;

  // 최근 7일 일별 신규 등록 (스파크라인용)
  const last7Days: Array<{ label: string; count: number; isToday: boolean }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = allLeads.filter((l) => {
      const ld = new Date(l.created_at);
      return ld >= d && ld < next;
    }).length;
    last7Days.push({
      label: d.toLocaleDateString("ko-KR", { weekday: "short" }),
      count,
      isToday: i === 0,
    });
  }
  const maxDailyCount = Math.max(1, ...last7Days.map((d) => d.count));

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

      {/* 1. 인사 + 오늘 할 일 요약 */}
      <div className="mb-7">
        <p className="text-[13px] font-medium uppercase tracking-wider text-[#A3A3A3]">{today}</p>
        <h1 className="mt-2 text-[32px] font-bold tracking-tight text-[#0A0A0A] lg:text-[40px]">{getGreeting()}</h1>
        <p className="mt-2 text-[16px] font-medium leading-[1.6] text-[#262626]">
          {getTodaySummary(totalCount, upcomingContacts.length, overdueCount, newCount)}
        </p>
      </div>

      {/* 2. AI 자동화 섹션 — 메인 hero */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-[#0A0A0A] bg-[#0A0A0A] text-white">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
          {/* 왼쪽: 설명 + 기능 카드 */}
          <div className="p-6 lg:p-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] font-semibold text-white/80">
              <Sparkles size={12} className="text-[#FCD34D]" />
              AI 자동화
            </div>
            <h2 className="mt-3 text-[24px] font-bold leading-tight tracking-tight lg:text-[28px]">
              전화 끊고 녹음만 올리면<br />
              <span className="text-[#FCD34D]">AI가 케이스를 만들어줘요</span>
            </h2>
            <p className="mt-3 text-[14px] leading-[1.6] text-white/60">
              수기 입력은 이제 그만. 통화 녹음이나 메모를 붙여넣으면 보호자 정보, 상황 요약, 다음 행동까지 자동 정리돼요.
            </p>

            {/* 기능 리스트 */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Mic size={15} className="text-[#FCD34D]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">통화 녹음 분석</p>
                  <p className="mt-0.5 text-[12px] text-white/55">음성 → 텍스트 → 케이스 자동 생성</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <FileText size={15} className="text-[#FCD34D]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">상담 메모 AI 요약</p>
                  <p className="mt-0.5 text-[12px] text-white/55">핵심 이슈, 긴급도, 추천 행동 추출</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Sparkles size={15} className="text-[#FCD34D]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">보호자 리포트 자동 생성</p>
                  <p className="mt-0.5 text-[12px] text-white/55">케이스 상세에서 한 번의 클릭으로 전달 문안 완성</p>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 실제 업로드 위젯 */}
          <div className="border-t border-white/10 bg-[#FAFAFA] p-5 text-[#0A0A0A] lg:border-l lg:border-t-0 lg:p-6">
            <RecordingUploadButton />
          </div>
        </div>
      </section>

      {/* 3. 오늘 연락 필요 — 바로 아래 */}
      {upcomingContacts.length > 0 && (
        <section className="mb-5 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-3">
            <div className="flex items-center gap-2">
              <Phone size={16} className={overdueCount > 0 ? "text-[#DC2626]" : "text-[#D97706]"} />
              <h2 className="text-[15px] font-bold text-[#0A0A0A]">오늘 연락 필요</h2>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${overdueCount > 0 ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#FFEDD5] text-[#D97706]"}`}>
              {upcomingContacts.length}건
            </span>
          </div>
          <div className="divide-y divide-[#E5E5E5]/60">
            {upcomingContacts.slice(0, 5).map((contact) => {
              const contactOverdue = isOverdue(contact.scheduledDate);
              return (
                <Link href={`/leads/${contact.id}`} key={contact.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#FFEDD5]/30">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${contactOverdue ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#FFEDD5] text-[#D97706]"}`}>
                    {contact.guardianName.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[#0A0A0A]">{contact.guardianName} 보호자</p>
                    <p className="mt-0.5 truncate text-[13px] text-[#737373]">{contact.note || "메모 없음"}</p>
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

      {/* 4. 4개 핵심 지표 — 전체 / 이번주 신규 / 인터뷰 예정 / 소개 대기 */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link href="/leads" className="card-hover group rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#737373]">전체 케이스</span>
            <Users size={18} className="text-[#A3A3A3] transition-colors group-hover:text-[#D97706]" />
          </div>
          <p className="mt-4 text-[40px] font-bold leading-none tracking-tight text-[#0A0A0A]">{totalCount}</p>
          <p className="mt-2 text-[12px] text-[#A3A3A3]">등록된 케이스 수</p>
        </Link>

        <Link href="/leads" className="card-hover group rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#737373]">이번 주 신규</span>
            <UserPlus size={18} className="text-[#A3A3A3] transition-colors group-hover:text-[#D97706]" />
          </div>
          <p className="mt-4 text-[40px] font-bold leading-none tracking-tight text-[#0A0A0A]">{newThisWeek}</p>
          <div className="mt-2 flex items-center gap-1 text-[12px]">
            {weekTrend > 0 ? (
              <>
                <ArrowUp size={12} className="text-[#16A34A]" />
                <span className="font-semibold text-[#16A34A]">+{weekTrend}</span>
              </>
            ) : weekTrend < 0 ? (
              <>
                <ArrowDown size={12} className="text-[#DC2626]" />
                <span className="font-semibold text-[#DC2626]">{weekTrend}</span>
              </>
            ) : (
              <>
                <Minus size={12} className="text-[#A3A3A3]" />
                <span className="text-[#A3A3A3]">동일</span>
              </>
            )}
            <span className="text-[#A3A3A3]">지난주 대비</span>
          </div>
        </Link>

        <Link href="/pipeline" className="card-hover group rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#737373]">인터뷰 예정</span>
            <Calendar size={18} className="text-[#A3A3A3] transition-colors group-hover:text-[#D97706]" />
          </div>
          <p className={`mt-4 text-[40px] font-bold leading-none tracking-tight ${interviewScheduledCount > 0 ? "text-[#D97706]" : "text-[#0A0A0A]"}`}>
            {interviewScheduledCount}
          </p>
          <p className="mt-2 text-[12px] text-[#A3A3A3]">진행 대기 중</p>
        </Link>

        <Link href="/pipeline" className="card-hover group rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#737373]">소개 대기</span>
            <CheckCircle2 size={18} className="text-[#A3A3A3] transition-colors group-hover:text-[#D97706]" />
          </div>
          <p className="mt-4 text-[40px] font-bold leading-none tracking-tight text-[#0A0A0A]">{introductionWaitingCount}</p>
          <p className="mt-2 text-[12px] text-[#A3A3A3]">센터 연계 대기</p>
        </Link>
      </div>

      {/* 4.5 주간 신규 등록 추이 — 스파크라인 */}
      <section className="mb-5 rounded-xl border border-[#E5E5E5] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-[#0A0A0A]">주간 신규 등록 추이</h2>
            <p className="mt-0.5 text-[13px] text-[#737373]">최근 7일 동안 등록된 케이스</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[22px] font-bold tracking-tight text-[#0A0A0A]">{newThisWeek}</span>
            <span className="text-[13px] text-[#737373]">건</span>
          </div>
        </div>
        <div className="mt-5 flex h-28 items-end justify-between gap-2">
          {last7Days.map((day, i) => {
            const heightPct = (day.count / maxDailyCount) * 100;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex h-20 w-full items-end justify-center">
                  <div
                    className={`w-full rounded-t-md transition-all ${day.isToday ? "bg-[#D97706]" : "bg-[#D97706]/25"}`}
                    style={{ height: `${Math.max(heightPct, day.count > 0 ? 8 : 2)}%`, minHeight: "2px" }}
                  />
                  {day.count > 0 && (
                    <span className={`absolute -top-5 text-[11px] font-bold ${day.isToday ? "text-[#D97706]" : "text-[#737373]"}`}>
                      {day.count}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] ${day.isToday ? "font-bold text-[#0A0A0A]" : "text-[#A3A3A3]"}`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. 퍼널 차트 — 접이식 */}
      {totalCount > 0 && (
        <div className="mb-5">
          <DashboardFunnelToggle funnelData={funnelData} />
        </div>
      )}

      {/* 6. 케이스 현황 + 최근 등록 — 그리드 */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4">
            <h2 className="text-[16px] font-bold text-[#0A0A0A]">케이스 현황</h2>
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
              <p className="text-[16px] font-semibold text-[#0A0A0A]">아직 케이스가 없어요</p>
              <p className="mt-1 text-[14px] text-[#737373]">전화 끝나고 녹음을 올리거나, 직접 등록하면 돼요.</p>
              <Link href="/leads/new" className="mt-4 inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-[#D97706] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309]">
                + 첫 케이스 등록하기
              </Link>
            </div>
          ) : (
            <>
              {/* 모바일: 카드형 */}
              <div className="divide-y divide-[#E5E5E5]/60 lg:hidden">
                {allLeads.slice(0, 8).map((lead) => {
                  const overdue = isOverdue(lead.next_contact_date);
                  const todayLabel = isToday(lead.next_contact_date);
                  return (
                    <Link key={lead.id} href={`/leads/${lead.id}`} className="block px-5 py-3.5 transition-colors hover:bg-[#FFEDD5]/30">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[15px] font-semibold text-[#0A0A0A]">{lead.guardian_name}</p>
                            {(overdue || todayLabel) && (
                              <span className={`text-[12px] font-bold ${overdue ? "text-[#DC2626]" : "text-[#D97706]"}`}>
                                {overdue ? "기한 초과" : "오늘"}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[13px] text-[#737373]">{buildDiagnosis(lead) || lead.current_situation_summary || "미입력"}</p>
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
                    <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-left text-[13px] text-[#737373]">
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
                        <tr key={lead.id} className="border-b border-[#E5E5E5]/60 transition-colors hover:bg-[#FFEDD5]/30">
                          <td className="px-5 py-3.5 align-top">
                            <Link href={`/leads/${lead.id}`} className="block">
                              <p className="text-[15px] font-semibold text-[#0A0A0A]">{lead.guardian_name}</p>
                              <p className="mt-0.5 line-clamp-1 text-[13px] text-[#737373]">{lead.current_situation_summary}</p>
                            </Link>
                          </td>
                          <td className="px-5 py-3.5 align-top text-[14px] text-[#0A0A0A]">{buildDiagnosis(lead) || "미입력"}</td>
                          <td className="px-5 py-3.5 align-top text-[14px] font-medium">
                            <span className={overdue ? "text-[#DC2626]" : todayLabel ? "text-[#D97706]" : "text-[#737373]"}>
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
          <section className="rounded-xl border border-[#E5E5E5] bg-white px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#0A0A0A]">최근 등록</h2>
            {recentLeads.length === 0 ? (
              <p className="mt-3 text-[14px] text-[#737373]">첫 문의가 들어오면 여기에 바로 나타나요.</p>
            ) : (
              <div className="mt-2 divide-y divide-[#EEEEEE]">
                {recentLeads.map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`} className="flex items-center justify-between py-2.5 transition-colors hover:text-[#D97706]">
                    <div className="min-w-0 pr-3">
                      <p className="text-[14px] font-semibold text-[#0A0A0A]">{lead.guardian_name}</p>
                      <p className="mt-0.5 line-clamp-1 text-[13px] text-[#737373]">{lead.current_situation_summary}</p>
                    </div>
                    <span className="flex-shrink-0 text-[13px] text-[#A3A3A3]">→</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* 빠른 링크 */}
          <div className="grid grid-cols-2 gap-2">
            <Link href="/leads/new" className="rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-center text-[14px] font-medium text-[#0A0A0A] transition-colors hover:bg-[#FFEDD5]/30">
              + 신규 등록
            </Link>
            <Link href="/pipeline" className="rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-center text-[14px] font-medium text-[#0A0A0A] transition-colors hover:bg-[#FFEDD5]/30">
              진행 현황
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

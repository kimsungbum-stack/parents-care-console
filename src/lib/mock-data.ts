import type {
  LeadConsultation,
  LeadDetail,
  LeadListItem,
  LeadNote,
  LeadStatus,
} from "@/types/domain";

export type { LeadConsultation, LeadDetail, LeadListItem, LeadStatus, LeadNote };

export const leadStatusSummary = [
  { label: "신규", count: 12 },
  { label: "1차답장", count: 7 },
  { label: "인터뷰예정", count: 4 },
  { label: "인터뷰완료", count: 9 },
  { label: "소개대기", count: 3 },
  { label: "보류", count: 2 },
] as const;

export const upcomingContacts = [
  { id: "lead-101", guardianName: "김OO", scheduledDate: "2026-03-08", note: "센터 연계 가능 여부 안내 예정" },
  { id: "lead-102", guardianName: "최OO", scheduledDate: "2026-03-09", note: "병원동행 서비스 범위 설명 필요" },
  { id: "lead-103", guardianName: "박OO", scheduledDate: "2026-03-10", note: "인터뷰 일정 확정 연락 대기" },
] as const;

export const recentConsultations = [
  { id: "consultation-201", guardianName: "정OO", channel: "전화", recordedAt: "2026-03-07 09:30", summary: "일정 정리 중심 상담 진행, 다음 주 사례 검토 예정" },
  { id: "consultation-202", guardianName: "최OO", channel: "카톡", recordedAt: "2026-03-06 17:10", summary: "센터 연계 조건 설명 후 소개대기 상태로 전환 예정" },
  { id: "consultation-203", guardianName: "송OO", channel: "전화", recordedAt: "2026-03-06 14:20", summary: "보호자 부담 요인 정리, 추가 자료 전달 요청" },
] as const;

export const leadStatusOptions: Array<"전체" | LeadStatus> = ["전체", "신규", "1차답장", "인터뷰예정", "인터뷰완료", "소개대기", "보류"];

export const mockLeads: LeadListItem[] = [
  { id: "lead-1001", guardianName: "김민정", phone: "010-4182-2231", careSummary: "79세 부친 · 병원동행 주 1회 문의", source: "지인 소개", status: "신규", nextContactDate: "2026-03-08", latestConsultationDate: "2026-03-07" },
  { id: "lead-1002", guardianName: "이소영", phone: "010-2721-8824", careSummary: "83세 모친 · 일정정리 및 복약관리 상담", source: "네이버 검색", status: "1차답장", nextContactDate: "2026-03-09", latestConsultationDate: "2026-03-06" },
  { id: "lead-1003", guardianName: "박정민", phone: "010-3381-1027", careSummary: "76세 부친 · 센터연계 가능 여부 검토", source: "카카오 문의", status: "인터뷰예정", nextContactDate: "2026-03-10", latestConsultationDate: "2026-03-05" },
  { id: "lead-1004", guardianName: "최지원", phone: "010-5294-6640", careSummary: "81세 모친 · 병원동행과 외래 일정 관리", source: "병원 관계자 소개", status: "인터뷰완료", nextContactDate: "2026-03-12", latestConsultationDate: "2026-03-07" },
  { id: "lead-1005", guardianName: "서지수", phone: "010-6103-9072", careSummary: "77세 부친 · 치매센터 연계 대기", source: "기존 고객 추천", status: "소개대기", nextContactDate: "2026-03-11", latestConsultationDate: "2026-03-04" },
  { id: "lead-1006", guardianName: "문선아", phone: "010-7445-3358", careSummary: "84세 모친 · 가족 내부 논의 후 재연락 예정", source: "지역 커뮤니티", status: "보류", nextContactDate: "2026-03-15", latestConsultationDate: "2026-03-03" },
];

export const mockLeadDetails: Record<string, LeadDetail> = {
  "lead-1001": {
    ...mockLeads[0],
    guardianRelationship: "딸",
    careRecipientName: "김정호",
    careRecipientAgeGroup: "70대 후반",
    currentSituationSummary: "최근 외래 진료 빈도가 늘면서 보호자가 병원동행과 복약 확인을 모두 맡고 있어 부담이 커진 상황입니다.",
    keyIssues: ["병원동행 부담", "일정 정리 필요", "가족 역할 분담 미정"],
    consultationMemo: "다음 연락 때 실제 병원 방문 빈도와 대기 시간대를 구체적으로 확인할 예정입니다.",
    hospitalName: "서울중앙병원",
    departmentInfo: "정형외과, 신경과",
    examinationRequired: true,
    mobilityLevel: "보행 보조 필요",
    paymentAssistanceRequired: true,
    transportMethod: "자가용",
    accompanimentScope: "접수, 진료 대기, 수납, 귀가 동행",
    isHighRisk: false,
    createdAt: "2026-03-05T16:00:00+09:00",
    updatedAt: "2026-03-07T11:20:00+09:00",
    careRecipientAge: 79,
    parentSituationSummary: "최근 외래 진료 빈도가 늘면서 보호자가 병원동행과 복약 확인을 모두 맡고 있어 부담이 커진 상황입니다.",
    overviewSummary: "보호자는 병원동행 지원과 진료 후 일정 정리를 가장 우선순위로 보고 있습니다.",
    progressStatus: "초기 문의 단계이며 서비스 범위 설명 후 1차 후속 연락 예정입니다.",
    guardianReport: "현재 보호자에게는 부친의 외래 진료 일정이 잦아 병원동행과 일정 정리 지원이 우선적으로 필요합니다. 다음 연락에서 실제 방문 빈도와 동행 필요 범위를 더 구체적으로 확인할 예정입니다.",
    consultations: [{ id: "consult-1001-1", leadId: "lead-1001", consultedAt: "2026-03-07 10:30", channel: "전화", summary: "초기 상담 진행, 병원동행 범위 확인", details: "보호자가 주 1회 이상 외래 진료 동행을 직접 수행 중이며 검사 예약과 수납 동선까지 부담이 크다고 설명했습니다.", createdAt: "2026-03-07 10:30" }],
    notes: [{ id: "note-1001-1", leadId: "lead-1001", type: "운영 메모", createdAt: "2026-03-07 11:10", content: "다음 연락 시 병원 방문 빈도와 평균 대기 시간을 확인할 것." }],
  },
};

export function getMockLeadDetail(leadId: string) {
  return mockLeadDetails[leadId] ?? null;
}

export type PlanTier = "free" | "standard" | "premium";

export type PlanFeature =
  | "ai_analysis"
  | "report_generation"
  | "unlimited_leads"
  | "notifications"
  | "csv_export";

export const PLAN_FEATURES: Record<PlanTier, PlanFeature[]> = {
  free: [],
  standard: ["ai_analysis", "notifications", "csv_export"],
  premium: ["ai_analysis", "report_generation", "unlimited_leads", "notifications", "csv_export"],
};

/** AI 분석 월간 제한 (Infinity = 무제한) */
export const PLAN_AI_LIMITS: Record<PlanTier, number> = {
  free: 0,
  standard: 5,
  premium: Infinity,
};

export const PLAN_LEAD_LIMITS: Record<PlanTier, number> = {
  free: 15,
  standard: Infinity,
  premium: Infinity,
};

export type Organization = {
  id: string;
  name: string;
  plan: PlanTier;
  maxLeads: number;
  createdAt: string;
  updatedAt: string;
};

export type LeadStatus =
  | "신규"
  | "1차답장"
  | "인터뷰예정"
  | "인터뷰완료"
  | "소개대기"
  | "보류";

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "신규",
  "1차답장",
  "인터뷰예정",
  "인터뷰완료",
  "소개대기",
  "보류",
];

/** DB 값 → 사용자에게 보여주는 레이블 */
export const STATUS_DISPLAY_LABELS: Record<LeadStatus, string> = {
  "신규": "신규",
  "1차답장": "첫 연락 완료",
  "인터뷰예정": "인터뷰 예정",
  "인터뷰완료": "인터뷰 완료",
  "소개대기": "설명 완료",
  "보류": "보류",
};

export function getStatusLabel(status: LeadStatus): string {
  return STATUS_DISPLAY_LABELS[status] ?? status;
}

export type NoteType = "운영 메모" | "파트너 메모";

export type LeadRecord = {
  id: string;
  guardianName: string;
  phone: string;
  guardianRelationship: string | null;
  careRecipientName: string | null;
  careRecipientAgeGroup: string | null;
  currentSituationSummary: string;
  source: string;
  status: LeadStatus;
  nextContactDate: string | null;
  keyIssues: string | null;
  consultationMemo: string | null;
  hospitalName: string | null;
  departmentInfo: string | null;
  examinationRequired: boolean | null;
  mobilityLevel: string | null;
  paymentAssistanceRequired: boolean | null;
  transportMethod: string | null;
  accompanimentScope: string | null;
  isHighRisk: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LeadListItem = Pick<
  LeadRecord,
  | "id"
  | "guardianName"
  | "phone"
  | "source"
  | "status"
  | "nextContactDate"
> & {
  careSummary: string;
  latestConsultationDate: string;
};

export type LeadConsultation = {
  id: string;
  leadId: string;
  consultedAt: string;
  channel: string;
  summary: string;
  details: string;
  createdAt: string;
};

export type GuardianReportRecord = {
  id: string;
  leadId: string;
  currentSituation: string;
  thisWeekTasks: string;
  hospitalSchedule: string;
  neededHelp: string;
  nextAction: string;
  updatedAt: string;
};

export type LeadNote = {
  id: string;
  leadId: string;
  type: NoteType;
  createdAt: string;
  content: string;
};

export type LeadDetail = LeadListItem &
  Omit<
    LeadRecord,
    | "id"
    | "guardianName"
    | "phone"
    | "source"
    | "status"
    | "nextContactDate"
    | "keyIssues"
  > & {
    careRecipientAge?: number;
    parentSituationSummary: string;
    keyIssues: string[];
    overviewSummary: string;
    progressStatus: string;
    guardianReport: string;
    reportRecord?: GuardianReportRecord | null;
    consultations: LeadConsultation[];
    notes: LeadNote[];
    aiAnalysis?: RecordingAiAnalysis | null;
    aiAnalyzedAt?: string | null;
  };

export type DashboardStatusSummaryItem = {
  label: LeadStatus;
  count: number;
};

export type UpcomingContactItem = {
  id: string;
  guardianName: string;
  scheduledDate: string;
  note: string;
};

export type RecentConsultationItem = {
  id: string;
  guardianName: string;
  channel: string;
  recordedAt: string;
  summary: string;
};

// AI 녹음 분석 결과 타입 (녹음 업로드 → 분석 → 케이스 생성)
export type RecordingAiAnalysis = {
  guardianName: string | null;
  phone: string | null;
  relationship: string | null;
  careRecipientName: string | null;
  careRecipientAge: string | null;
  currentSituation: string;
  urgency: "높음" | "보통" | "낮음";
  coreNeeds: string;
  recommendedNextContactDate: string | null;
  recommendedAction: string;
  summary: string;
};

// AI 상담 분석 타입
export type ConsultationAnalysisInput = {
  consultationText: string;
};

export type ConsultationAnalysis = {
  guardianName: string;
  careTarget: string | null;
  careTargetRelationship: string | null;
  situationSummary: string;
  keyIssues: string[];
  urgencyLevel: "높음" | "보통" | "낮음";
};

// AI 요약 리포트 타입
export type SummaryReportInput = {
  guardianName: string;
  careRecipientName: string | null;
  currentSituationSummary: string;
  consultations: {
    consultedAt: string;
    channel: string;
    summary: string;
    details: string;
  }[];
};

export type SummaryReportResult = {
  overallStatus: string;
  progressTimeline: string;
  currentNeeds: string[];
  recommendedActions: string[];
  riskFactors: string[];
  reportMarkdown: string;
};

// 알림 타입
export type NotificationItem = {
  id: string;
  leadId: string | null;
  type: "contact_due" | "stale_lead" | "system";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

// 팀 멤버 타입
export type TeamMember = {
  id: string;
  email: string | null;
  role: "admin" | "member";
  name: string | null;
  createdAt: string;
};

export type Invitation = {
  id: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "expired";
  createdAt: string;
};

export type PlanTier = "basic" | "standard" | "premium";

export type PlanFeature =
  | "ai_analysis"
  | "report_generation"
  | "unlimited_leads"
  | "notifications";

export const PLAN_FEATURES: Record<PlanTier, PlanFeature[]> = {
  basic: [],
  standard: ["notifications"],
  premium: ["ai_analysis", "report_generation", "unlimited_leads", "notifications"],
};

export const PLAN_LEAD_LIMITS: Record<PlanTier, number> = {
  basic: 50,
  standard: 200,
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

export type ConsultationAnalysis = {
  guardian: {
    name: string;
    phone: string | null;
    relation: string | null;
  };
  care_target: {
    name: string | null;
    age_group: string | null;
    condition: string | null;
  };
  consultation: {
    summary: string;
    urgency: "높음" | "보통" | "낮음";
    key_needs: string[];
  };
  recommendation: {
    next_contact: string | null;
    next_action: string;
    pipeline_stage: "신규" | "1차답장" | "인터뷰예정" | "인터뷰완료" | "소개대기";
  };
};

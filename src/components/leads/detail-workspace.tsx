"use client";

import { useState } from "react";

import { AiAnalysisCard } from "@/components/leads/ai-analysis-card";
import { DetailHeader } from "@/components/leads/detail-header";
import { DetailManagementPanel } from "@/components/leads/detail-management-panel";
import { DetailTabs } from "@/components/leads/detail-tabs";
import type { LeadDetail, LeadStatus } from "@/types/domain";

type DetailWorkspaceProps = {
  lead: LeadDetail;
};

export function DetailWorkspace({ lead }: DetailWorkspaceProps) {
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead.status);
  const [currentNextContactDate, setCurrentNextContactDate] = useState(
    lead.nextContactDate,
  );

  return (
    <div className="space-y-6">
      <DetailHeader
        lead={lead}
        status={currentStatus}
        nextContactDate={currentNextContactDate}
      />
      <DetailManagementPanel
        leadId={lead.id}
        initialStatus={lead.status}
        initialNextContactDate={lead.nextContactDate}
        onApply={({ status, nextContactDate }) => {
          setCurrentStatus(status);
          setCurrentNextContactDate(nextContactDate);
        }}
      />
      <AiAnalysisCard
        leadId={lead.id}
        latestConsultationDetails={
          lead.consultations.length > 0
            ? lead.consultations[0].details || lead.consultations[0].summary
            : undefined
        }
      />
      <DetailTabs lead={lead} />
    </div>
  );
}

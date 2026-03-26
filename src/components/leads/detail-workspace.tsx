"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { AiAnalysisCard } from "@/components/leads/ai-analysis-card";
import { RecordingAiAnalysisSection } from "@/components/leads/recording-ai-analysis-section";
import { DetailHeader } from "@/components/leads/detail-header";
import { DetailManagementPanel } from "@/components/leads/detail-management-panel";
import { DetailTabs } from "@/components/leads/detail-tabs";
import type { LeadDetail, LeadStatus } from "@/types/domain";

type DetailWorkspaceProps = {
  lead: LeadDetail;
};

export function DetailWorkspace({ lead }: DetailWorkspaceProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead.status);
  const [currentNextContactDate, setCurrentNextContactDate] = useState(
    lead.nextContactDate,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/management`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/leads");
        router.refresh();
      } else {
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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
      {lead.aiAnalysis ? (
        <RecordingAiAnalysisSection
          analysis={lead.aiAnalysis}
          analyzedAt={lead.aiAnalyzedAt}
        />
      ) : (
        <AiAnalysisCard
          leadId={lead.id}
          latestConsultationDetails={
            lead.consultations.length > 0
              ? lead.consultations[0].details || lead.consultations[0].summary
              : undefined
          }
        />
      )}
      <DetailTabs lead={lead} />

      {/* 케이스 삭제 */}
      <section className="rounded-xl border border-[#E7E0D5] bg-white p-5">
        <p className="text-[14px] font-medium text-[#78716C]">이 케이스가 더 이상 필요 없다면 삭제할 수 있어요.</p>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#FCA5A5] bg-white px-4 py-2.5 text-[14px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
          >
            <Trash2 size={16} />
            케이스 삭제
          </button>
        ) : (
          <div className="mt-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4">
            <p className="text-[15px] font-bold text-[#991B1B]">정말 삭제하시겠어요?</p>
            <p className="mt-1 text-[13px] text-[#DC2626]">
              이 케이스의 상담 기록, 메모, 리포트가 모두 삭제되고 복구할 수 없어요.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="min-h-[44px] rounded-lg bg-[#DC2626] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "네, 삭제할게요"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="min-h-[44px] rounded-lg border border-[#E7E0D5] bg-white px-4 py-2.5 text-[14px] font-medium text-[#78716C] transition-colors hover:bg-[#FEFCF8]"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

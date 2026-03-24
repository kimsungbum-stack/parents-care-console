"use client";

import { useEffect, useState } from "react";

import { DetailConsultations } from "@/components/leads/detail-consultations";
import { DetailNotes } from "@/components/leads/detail-notes";
import { createInitialGuardianReportValue, DetailReport } from "@/components/leads/detail-report";
import { DetailOverview } from "@/components/leads/detail-overview";
import { mapGuardianReportRecordToValue, type GuardianReportValue } from "@/lib/forms/report";
import type { LeadConsultationInputValue } from "@/lib/forms/consultation";
import type { LeadNoteInputValue } from "@/lib/forms/note";
import type { GuardianReportRecord, LeadConsultation, LeadDetail, LeadNote } from "@/types/domain";

type DetailTabKey = "overview" | "consultations" | "report" | "notes";

type DetailTabsProps = {
  lead: LeadDetail;
};

const tabs: Array<{ key: DetailTabKey; label: string; hint: string }> = [
  { key: "overview", label: "개요", hint: "기본 상황 요약" },
  { key: "consultations", label: "상담 기록", hint: "통화 후 바로 추가" },
  { key: "report", label: "보호자 리포트", hint: "전달 문안 정리" },
  { key: "notes", label: "운영 메모", hint: "내부 기록" },
];

export function DetailTabs({ lead }: DetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabKey>("overview");
  const [reportValue, setReportValue] = useState<GuardianReportValue>(() => createInitialGuardianReportValue(lead));
  const [consultations, setConsultations] = useState<LeadConsultation[]>(lead.consultations);
  const [notes, setNotes] = useState<LeadNote[]>(lead.notes);

  useEffect(() => {
    setReportValue(createInitialGuardianReportValue(lead));
    setConsultations(lead.consultations);
    setNotes(lead.notes);
  }, [lead]);

  const handleSaveReport = async (nextValue: GuardianReportValue) => {
    try {
      const response = await fetch(`/api/leads/${lead.id}/report`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextValue),
      });

      const payload = (await response.json()) as { report?: GuardianReportRecord; message?: string };

      if (!response.ok || !payload.report) {
        return { ok: false, message: payload.message ?? "리포트를 저장하지 못했어요. 다시 확인해 주세요." };
      }

      const savedValue = mapGuardianReportRecordToValue(payload.report);
      setReportValue(savedValue);
      return { ok: true, value: savedValue, message: "리포트를 저장했어요." };
    } catch {
      return { ok: false, message: "저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." };
    }
  };

  const handleCreateConsultation = async (value: LeadConsultationInputValue) => {
    try {
      const response = await fetch(`/api/leads/${lead.id}/consultations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });

      const payload = (await response.json()) as {
        consultation?: LeadConsultation;
        message?: string;
        fieldErrors?: { leadId?: string; consultedAt?: string; channel?: string; summary?: string };
      };

      if (!response.ok || !payload.consultation) {
        return { ok: false, message: payload.message ?? "상담 기록을 저장하지 못했어요. 다시 확인해 주세요.", fieldErrors: payload.fieldErrors };
      }

      setConsultations((current) => [payload.consultation as LeadConsultation, ...current]);
      return { ok: true, consultation: payload.consultation, message: "상담 기록을 저장했어요." };
    } catch {
      return { ok: false, message: "저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." };
    }
  };

  const handleCreateNote = async (value: LeadNoteInputValue) => {
    try {
      const response = await fetch(`/api/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });

      const payload = (await response.json()) as {
        note?: LeadNote;
        message?: string;
        fieldErrors?: { leadId?: string; noteType?: string; content?: string };
      };

      if (!response.ok || !payload.note) {
        return { ok: false, message: payload.message ?? "메모를 저장하지 못했어요. 다시 확인해 주세요.", fieldErrors: payload.fieldErrors };
      }

      setNotes((current) => [payload.note as LeadNote, ...current]);
      return { ok: true, note: payload.note, message: "메모를 저장했어요." };
    } catch {
      return { ok: false, message: "저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." };
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-xl border border-[#E7E0D5] bg-white p-2">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                "rounded-lg px-4 py-2.5 text-left transition-colors",
                isActive ? "bg-[#FEF3C7] text-[#D97706]" : "text-[#78716C] hover:bg-[#FEFCF8] hover:text-[#292524]",
              ].join(" ")}
            >
              <p className="text-[14px] font-semibold">{tab.label}</p>
              <p className="mt-0.5 text-[13px] opacity-70">{tab.hint}</p>
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && <DetailOverview lead={lead} />}
      {activeTab === "consultations" && <DetailConsultations consultations={consultations} onCreateConsultation={handleCreateConsultation} />}
      {activeTab === "report" && <DetailReport value={reportValue} lead={lead} onSave={handleSaveReport} />}
      {activeTab === "notes" && <DetailNotes notes={notes} onCreateNote={handleCreateNote} />}
    </section>
  );
}

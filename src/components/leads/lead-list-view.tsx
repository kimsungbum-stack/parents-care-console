"use client";

import { useState } from "react";

import { LeadEmptyState } from "@/components/leads/lead-empty-state";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadList } from "@/components/leads/lead-list";
import { FeedbackNotice } from "@/components/ui/feedback-notice";
import { LEAD_STATUS_ORDER, type LeadListItem, type LeadStatus } from "@/types/domain";

const leadStatusOptions: Array<"전체" | LeadStatus> = ["전체", ...LEAD_STATUS_ORDER];

type LeadListViewProps = {
  leads: LeadListItem[];
  notice?: {
    tone: "info" | "error";
    message: string;
  };
};

export function LeadListView({ leads, notice }: LeadListViewProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"전체" | LeadStatus>("전체");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = status === "전체" || lead.status === status;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [lead.guardianName, lead.phone, lead.source].some((field) =>
        field.toLowerCase().includes(normalizedQuery),
      );

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-5">
      {notice ? <FeedbackNotice tone={notice.tone} message={notice.message} /> : null}

      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#292524]">케이스 목록</h1>
          <p className="mt-1 text-[14px] text-[#78716C]">
            오늘 처리할 케이스부터 찾아서 상세 화면으로 들어가면 돼요.
          </p>
        </div>
        <p className="text-[14px] text-[#78716C]">
          <span className="font-bold text-[#D97706]">{filteredLeads.length}</span>건
        </p>
      </div>

      <LeadFilters
        query={query}
        status={status}
        statuses={leadStatusOptions}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
      />

      {filteredLeads.length > 0 ? <LeadList leads={filteredLeads} /> : <LeadEmptyState query={query} status={status} />}
    </div>
  );
}

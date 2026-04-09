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

      <div className="flex items-center justify-end">
        <p className="text-[14px] text-[#737373]">
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

"use client";

import { useState } from "react";

import { LeadEmptyState } from "@/components/leads/lead-empty-state";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadList } from "@/components/leads/lead-list";
import { FeedbackNotice } from "@/components/ui/feedback-notice";
import { leadStatusOptions } from "@/lib/mock-data";
import type { LeadListItem, LeadStatus } from "@/types/domain";

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

      <section className="rounded-xl border border-[#E7E0D5] bg-white px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[18px] font-bold text-[#292524] sm:text-[20px]">케이스 목록</p>
            <p className="mt-1 text-[13px] leading-[1.6] text-[#78716C]">
              오늘 처리할 케이스부터 찾아서 상세 화면으로 들어가면 돼요.
            </p>
          </div>
          <div className="rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-3 py-2 text-[13px] text-[#78716C]">
            조회 결과 <span className="font-semibold text-[#D97706]">{filteredLeads.length}</span>건
          </div>
        </div>
      </section>

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

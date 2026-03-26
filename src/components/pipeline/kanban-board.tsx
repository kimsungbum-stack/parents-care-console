"use client";

import Link from "next/link";
import { useState } from "react";
import { getStatusLabel, type LeadStatus } from "@/types/domain";
import type { KanbanLead } from "@/app/pipeline/page";

const COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
  { status: "신규", label: getStatusLabel("신규"), color: "#3B82F6" },
  { status: "1차답장", label: getStatusLabel("1차답장"), color: "#F59E0B" },
  { status: "인터뷰예정", label: getStatusLabel("인터뷰예정"), color: "#8B5CF6" },
  { status: "인터뷰완료", label: getStatusLabel("인터뷰완료"), color: "#10B981" },
  { status: "소개대기", label: getStatusLabel("소개대기"), color: "#6B7280" },
  { status: "보류", label: getStatusLabel("보류"), color: "#A8A29E" },
];

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
}

function isOverdue(dateStr: string | null) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

function isToday(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function KanbanCard({
  lead,
  color,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  lead: KanbanLead;
  color: string;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const overdue = isOverdue(lead.nextContactDate);
  const todayContact = isToday(lead.nextContactDate);
  const formattedDate = formatDate(lead.nextContactDate);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`relative overflow-hidden rounded-lg border border-[#E7E0D5] bg-white shadow-sm cursor-grab active:cursor-grabbing select-none transition-opacity ${
        isDragging ? "opacity-40" : "opacity-100 hover:shadow-md"
      }`}
    >
      {/* 상태 컬러 바 */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />

      <Link
        href={`/leads/${lead.id}`}
        className="block px-3 py-3 pl-4"
        onClick={(e) => { if (isDragging) e.preventDefault(); }}
      >
        <p className="text-[14px] font-semibold text-[#292524] leading-snug">
          {lead.guardianName}
        </p>
        {(lead.careRecipientName || lead.careRecipientAgeGroup) && (
          <p className="mt-0.5 text-[12px] text-[#78716C]">
            {[lead.careRecipientName, lead.careRecipientAgeGroup].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#A8A29E]">
            D+{daysSince(lead.createdAt)}
          </span>
          {formattedDate && (
            <span
              className={`text-[12px] font-semibold ${
                overdue ? "text-[#DC2626]" : todayContact ? "text-[#D97706]" : "text-[#78716C]"
              }`}
            >
              {overdue ? "초과" : todayContact ? "오늘" : formattedDate}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

export function KanbanBoard({ initialLeads }: { initialLeads: KanbanLead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

  const handleDrop = async (e: React.DragEvent, toStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === toStatus) {
      setDragOverColumn(null);
      return;
    }

    const prevStatus = lead.status;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: toStatus } : l)));
    setDragOverColumn(null);

    try {
      const res = await fetch(`/api/leads/${leadId}/management`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: toStatus, nextContactDate: lead.nextContactDate }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: prevStatus } : l)));
    }
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3" style={{ minWidth: `${COLUMNS.length * 236}px` }}>
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.status);
          const isOver = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              className={`flex w-[228px] flex-shrink-0 flex-col rounded-xl border transition-colors ${
                isOver
                  ? "border-[#D97706] bg-[#FEF3C7]/40"
                  : "border-[#E7E0D5] bg-[#F9FAFB]"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOverColumn(col.status); }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverColumn(null);
                }
              }}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              {/* 컬럼 헤더 */}
              <div className="flex items-center justify-between border-b border-[#E7E0D5] px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-[14px] font-semibold text-[#292524]">{col.label}</span>
                </div>
                <span className="rounded-full border border-[#E7E0D5] bg-white px-2 py-0.5 text-[12px] font-bold text-[#78716C]">
                  {colLeads.length}
                </span>
              </div>

              {/* 카드 목록 */}
              <div className="flex-1 space-y-2 p-2 min-h-[100px]">
                {colLeads.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    color={col.color}
                    isDragging={draggingId === lead.id}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("leadId", lead.id);
                      setDraggingId(lead.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverColumn(null);
                    }}
                  />
                ))}
                {colLeads.length === 0 && (
                  <div className="flex h-14 items-center justify-center rounded-lg border border-dashed border-[#E7E0D5] text-[13px] text-[#A8A29E]">
                    없음
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

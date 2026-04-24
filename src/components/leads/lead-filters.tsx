import type { ChangeEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStatusLabel, type LeadStatus } from "@/types/domain";

type LeadFiltersProps = {
  query: string;
  status: "전체" | LeadStatus;
  statuses: Array<"전체" | LeadStatus>;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: "전체" | LeadStatus) => void;
};

export function LeadFilters({ query, status, statuses, onQueryChange, onStatusChange }: LeadFiltersProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  return (
    <section className="rounded-xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:gap-5">
        <div>
          <Label htmlFor="lead-search" className="mb-2 block text-[13px] font-medium text-[#0A0A0A]">
            검색
          </Label>
          <Input
            id="lead-search"
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="보호자명, 연락처, 유입경로로 검색"
            className="h-11 text-[15px]"
          />
        </div>

        <div>
          <p className="mb-3 text-[13px] font-medium text-[#0A0A0A]">상태 필터</p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((item) => {
              const isActive = item === status;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onStatusChange(item)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                    isActive
                      ? "border-[#2563EB] bg-[#DBEAFE] text-[#1D4ED8]"
                      : "border-[#E5E5E5] bg-white text-[#737373] hover:bg-[#FAFAFA] hover:text-[#0A0A0A]",
                  ].join(" ")}
                >
                  {item === "전체" ? "전체" : getStatusLabel(item)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

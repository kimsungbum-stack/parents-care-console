import type { ChangeEvent } from "react";

import type { LeadStatus } from "@/lib/mock-data";

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
    <section className="rounded-xl border border-[#E7E0D5] bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:gap-5">
        <div>
          <label htmlFor="lead-search" className="mb-2 block text-[13px] font-medium text-[#292524]">
            검색
          </label>
          <input
            id="lead-search"
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="보호자명, 연락처, 유입경로로 검색"
            className="control-input"
          />
        </div>

        <div>
          <p className="mb-3 text-[13px] font-medium text-[#292524]">상태 필터</p>
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
                      ? "border-[#D97706] bg-[#FEF3C7] text-[#D97706]"
                      : "border-[#E7E0D5] bg-white text-[#78716C] hover:bg-[#FEFCF8] hover:text-[#292524]",
                  ].join(" ")}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

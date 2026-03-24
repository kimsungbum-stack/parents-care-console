import { EmptyPanel } from "@/components/ui/empty-panel";

type LeadEmptyStateProps = {
  query: string;
  status: string;
};

export function LeadEmptyState({ query, status }: LeadEmptyStateProps) {
  const hasFilter = query.trim() || status !== "전체";

  return (
    <EmptyPanel
      title={hasFilter ? "조건에 맞는 케이스가 없어요" : "아직 등록된 케이스가 없어요"}
      description={
        hasFilter
          ? "검색어나 상태 필터를 바꿔보시거나, 신규 케이스를 등록해 보세요."
          : "첫 문의가 들어오면 여기에서 바로 관리할 수 있어요. 위의 '신규 케이스' 버튼으로 시작해 보세요."
      }
    />
  );
}

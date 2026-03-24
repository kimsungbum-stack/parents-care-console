import { EmptyPanel } from "@/components/ui/empty-panel";

type LeadEmptyStateProps = {
  query: string;
  status: string;
};

export function LeadEmptyState({ query, status }: LeadEmptyStateProps) {
  const queryLabel = query ? `"${query}"` : "없음";

  return (
    <EmptyPanel
      title="조건에 맞는 케이스가 없어요."
      description={`검색어 ${queryLabel}, 상태 ${status} 기준으로 표시할 케이스가 없어요.`}
    />
  );
}

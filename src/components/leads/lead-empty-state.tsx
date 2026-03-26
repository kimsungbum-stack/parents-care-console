import { EmptyPanel } from "@/components/ui/empty-panel";

type LeadEmptyStateProps = {
  query: string;
  status: string;
};

export function LeadEmptyState({ query, status }: LeadEmptyStateProps) {
  const hasFilter = query.trim() || status !== "전체";

  if (hasFilter) {
    return (
      <EmptyPanel
        title="조건에 맞는 케이스가 없어요"
        description="검색어나 상태 필터를 바꿔보세요. 또는 신규 케이스를 등록해 보세요."
        actionLabel="+ 신규 케이스 등록"
        actionHref="/leads/new"
      />
    );
  }

  return (
    <EmptyPanel
      title="아직 등록된 케이스가 없어요"
      description="보호자 전화가 올 때마다 여기에 등록하면, 후속 연락을 놓치지 않아요."
      actionLabel="+ 첫 케이스 등록하기"
      actionHref="/leads/new"
    />
  );
}

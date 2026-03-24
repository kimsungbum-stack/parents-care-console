import { EmptyPanel } from "@/components/ui/empty-panel";

type DashboardEmptyStateProps = {
  title: string;
  description: string;
};

export function DashboardEmptyState({
  title,
  description,
}: DashboardEmptyStateProps) {
  return <EmptyPanel title={title} description={description} compact />;
}

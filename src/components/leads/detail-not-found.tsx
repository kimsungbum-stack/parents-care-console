import Link from "next/link";

import { EmptyPanel } from "@/components/ui/empty-panel";

export function DetailNotFound() {
  return (
    <section className="space-y-5">
      <EmptyPanel
        title="해당 케이스를 찾을 수 없어요."
        description="선택한 케이스가 삭제되었거나 아직 등록되지 않았을 수 있어요. 목록으로 돌아가 다시 선택해 주세요."
      />
      <Link href="/leads" className="control-button-primary inline-flex">
        케이스 목록으로 이동
      </Link>
    </section>
  );
}

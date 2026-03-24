import Link from "next/link";

import { FeedbackNotice } from "@/components/ui/feedback-notice";

type DetailErrorStateProps = {
  message: string;
};

export function DetailErrorState({ message }: DetailErrorStateProps) {
  return (
    <section className="space-y-5">
      <FeedbackNotice
        tone="error"
        message={`상세 정보를 불러오지 못했어요. ${message}`}
      />
      <Link href="/leads" className="control-button-primary inline-flex">
        케이스 목록으로 이동
      </Link>
    </section>
  );
}

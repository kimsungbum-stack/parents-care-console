import { FeedbackNotice } from "@/components/ui/feedback-notice";

type DashboardNoticeProps = {
  tone: "info" | "error";
  message: string;
};

export function DashboardNotice({ tone, message }: DashboardNoticeProps) {
  return <FeedbackNotice tone={tone} message={message} />;
}

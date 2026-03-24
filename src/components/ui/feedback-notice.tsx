import { CheckCircle, AlertCircle, Info } from "lucide-react";

type FeedbackNoticeProps = {
  tone: "info" | "success" | "error";
  message: string;
};

export function FeedbackNotice({ tone, message }: FeedbackNoticeProps) {
  const config =
    tone === "success"
      ? { className: "border-[#16A34A]/20 bg-[#F0FDF4] text-[#16A34A]", icon: <CheckCircle size={16} /> }
      : tone === "error"
        ? { className: "border-[#DC2626]/20 bg-[#FEF2F2] text-[#DC2626]", icon: <AlertCircle size={16} /> }
        : { className: "border-[#D97706]/20 bg-[#FFFBEB] text-[#D97706]", icon: <Info size={16} /> };

  return (
    <div className={["flex items-center gap-2 rounded-lg border px-4 py-3 text-[13px] leading-[1.6]", config.className].join(" ")}>
      {config.icon}
      {message}
    </div>
  );
}

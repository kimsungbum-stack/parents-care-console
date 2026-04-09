type StatusCardProps = {
  label: string;
  count: number;
  tone?: "default" | "muted";
  hint?: string;
};

export function StatusCard({
  label,
  count,
  tone = "default",
  hint,
}: StatusCardProps) {
  return (
    <article
      className={[
        "rounded-xl border p-4",
        tone === "default"
          ? "border-[#E5E5E5] bg-white"
          : "border-dashed border-[#E5E5E5] bg-[#FAFAFA]",
      ].join(" ")}
    >
      <p className="text-[13px] font-medium text-[#737373]">{label}</p>
      <p className="mt-2 text-[32px] font-bold tracking-tight text-[#D97706]">
        {count}
      </p>
      {hint ? <p className="mt-1 text-[13px] text-[#737373]">{hint}</p> : null}
    </article>
  );
}

type PremiumGateProps = {
  onUpgrade: () => void;
};

export function PremiumGate({ onUpgrade }: PremiumGateProps) {
  return (
    <div className="rounded-xl border border-[#D97706]/20 bg-[#FFFBEB] p-5 text-center">
      <p className="text-[15px] font-semibold text-[#92400E]">
        이 기능은 프리미엄 요금제에서 쓸 수 있어요.
      </p>
      <button
        type="button"
        onClick={onUpgrade}
        className="mt-4 rounded-xl bg-[#D97706] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309] active:bg-[#92400E]"
      >
        프리미엄으로 올리기
      </button>
    </div>
  );
}

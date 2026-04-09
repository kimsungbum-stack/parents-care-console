// 케이스 목록 로딩 스켈레톤.

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#E5E5E5]/60 ${className}`}
      aria-hidden
    />
  );
}

export default function LeadsLoading() {
  return (
    <div
      className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A]"
      aria-busy="true"
      aria-live="polite"
    >
      {/* 헤더 영역 */}
      <div className="border-b border-[#E5E5E5] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <Shimmer className="h-6 w-32" />
        <Shimmer className="mt-2 h-4 w-64" />
      </div>

      {/* 본문 */}
      <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1480px]">
          {/* 필터 바 */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Shimmer className="h-10 w-full sm:w-72" />
            <div className="flex gap-2">
              <Shimmer className="h-10 w-20 rounded-lg" />
              <Shimmer className="h-10 w-20 rounded-lg" />
              <Shimmer className="h-10 w-20 rounded-lg" />
            </div>
          </div>

          {/* 리스트 */}
          <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
            <div className="divide-y divide-[#E5E5E5]/60">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Shimmer className="h-4 w-32" />
                    <Shimmer className="h-3.5 w-64" />
                  </div>
                  <div className="ml-3 flex items-center gap-3">
                    <Shimmer className="h-4 w-16" />
                    <Shimmer className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// 대시보드 진입 시 서버 컴포넌트가 데이터를 불러오는 동안 표시되는 스켈레톤.
// Next.js App Router가 자동으로 page.tsx를 이 파일로 감싸줍니다.

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#E5E5E5]/60 ${className}`}
      aria-hidden
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8" aria-busy="true" aria-live="polite">
      {/* 인사 + 오늘 할 일 */}
      <div className="mb-5">
        <Shimmer className="h-4 w-40" />
        <Shimmer className="mt-2 h-7 w-56" />
        <Shimmer className="mt-3 h-5 w-72" />
      </div>

      {/* 오늘 연락 필요 카드 */}
      <section className="mb-5 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-3">
          <Shimmer className="h-5 w-28" />
          <Shimmer className="h-5 w-10 rounded-full" />
        </div>
        <div className="divide-y divide-[#E5E5E5]/60">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <Shimmer className="h-9 w-9 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="h-3.5 w-48" />
              </div>
              <Shimmer className="h-4 w-12" />
            </div>
          ))}
        </div>
      </section>

      {/* 핵심 숫자 2개 */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-[#E5E5E5] bg-white p-4">
            <Shimmer className="h-4 w-20" />
            <Shimmer className="mt-3 h-8 w-12" />
          </div>
        ))}
      </div>

      {/* 케이스 현황 + 최근 등록 */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4">
            <Shimmer className="h-5 w-24" />
            <Shimmer className="h-7 w-16" />
          </div>
          <div className="divide-y divide-[#E5E5E5]/60">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Shimmer className="h-4 w-28" />
                  <Shimmer className="h-3.5 w-56" />
                </div>
                <Shimmer className="ml-3 h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <section className="rounded-xl border border-[#E5E5E5] bg-white px-5 py-4">
            <Shimmer className="h-5 w-20" />
            <div className="mt-3 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Shimmer className="h-4 w-24" />
                  <Shimmer className="h-3.5 w-48" />
                </div>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-2 gap-2">
            <Shimmer className="h-11 rounded-xl" />
            <Shimmer className="h-11 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

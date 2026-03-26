import { NotificationBell } from "@/components/layout/notification-bell";

type TopHeaderProps = {
  title: string;
  description: string;
};

export function TopHeader({ title, description }: TopHeaderProps) {
  return (
    <header className="border-b border-[#E7E0D5] bg-white">
      <div className="px-5 py-5 lg:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-bold tracking-tight text-[#292524]">{title}</h1>
            <p className="mt-1 max-w-3xl text-[15px] leading-[1.6] text-[#78716C]">{description}</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <NotificationBell />
            <div className="hidden rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-2.5 text-[13px] text-[#78716C] lg:block">
              한 번에 다 하려 하지 말고, 오늘 처리할 케이스부터 정리하면 돼요.
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

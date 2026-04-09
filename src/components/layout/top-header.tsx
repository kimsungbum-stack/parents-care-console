import { NotificationBell } from "@/components/layout/notification-bell";

type TopHeaderProps = {
  title: string;
  description: string;
};

export function TopHeader({ title, description }: TopHeaderProps) {
  return (
    <header className="border-b border-[#E5E5E5] bg-white">
      <div className="px-5 py-5 lg:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-bold tracking-tight text-[#0A0A0A]">{title}</h1>
            <p className="mt-1 max-w-3xl text-[15px] leading-[1.6] text-[#737373]">{description}</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
}

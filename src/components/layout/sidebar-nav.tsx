import Link from "next/link";

export type NavigationItem = {
  href: string;
  label: string;
  shortLabel: string;
};

type SidebarNavProps = {
  items: NavigationItem[];
  currentPath: string;
};

export function SidebarNav({ items, currentPath }: SidebarNavProps) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = currentPath === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "flex items-center justify-between rounded-xl px-3 py-3 text-[15px] transition-colors",
              isActive
                ? "border border-[#E7E0D5] bg-white text-[#292524] font-semibold"
                : "text-[#78716C] hover:bg-[#FEFCF8] hover:text-[#292524]",
            ].join(" ")}
          >
            <span className="font-medium">{item.label}</span>
            <span
              className={[
                "rounded-full border px-2 py-0.5 text-[13px]",
                isActive
                  ? "border-[#D97706] bg-[#FEF3C7] text-[#D97706]"
                  : "border-[#E7E0D5] bg-white text-[#78716C]",
              ].join(" ")}
            >
              {item.shortLabel}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

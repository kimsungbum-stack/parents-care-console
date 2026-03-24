import type { ReactNode } from "react";

import { TopHeader } from "@/components/layout/top-header";

type AppShellProps = {
  title: string;
  description: string;
  currentPath: string;
  children: ReactNode;
};

export function AppShell({ title, description, currentPath, children }: AppShellProps) {
  void currentPath;

  return (
    <div className="min-h-screen bg-[#FEFCF8] text-[#292524]">
      <TopHeader title={title} description={description} />
      <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1480px]">{children}</div>
      </main>
    </div>
  );
}

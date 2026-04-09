import type { Metadata } from "next";

import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "부모안심90 운영 콘솔",
  description: "보호자 상담 및 케이스 관리 운영 도구",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="bg-[#FAFAFA] text-[#0A0A0A]">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-h-screen min-w-0 flex-1 overflow-auto bg-[#FAFAFA] pb-16 lg:pb-0">{children}</main>
        </div>
      </body>
    </html>
  );
}

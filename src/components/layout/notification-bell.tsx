"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { NotificationItem } from "@/types/domain";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function NotificationIcon({ type }: { type: NotificationItem["type"] }) {
  if (type === "contact_due") {
    return <div className="h-2 w-2 rounded-full bg-[#D97706]" />;
  }
  if (type === "stale_lead") {
    return <div className="h-2 w-2 rounded-full bg-[#DC2626]" />;
  }
  return <div className="h-2 w-2 rounded-full bg-[#78716C]" />;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    // 대시보드 로드 시 알림 자동 생성
    fetch("/api/notifications/generate", { method: "POST" }).catch(() => {});
  }, []);

  // 외부 클릭 시 패널 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silent
    }
  }

  async function handleMarkAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function handleClickNotification(notification: NotificationItem) {
    if (!notification.isRead) {
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notification.id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-[#78716C] transition-colors hover:bg-[#F5F0E8] hover:text-[#292524]"
        aria-label="알림"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[11px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-[#E7E0D5] bg-white shadow-lg sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-[#E7E0D5] px-4 py-3">
            <h3 className="text-[15px] font-bold text-[#292524]">알림</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[13px] font-medium text-[#D97706] hover:text-[#B45309]"
              >
                모두 읽음
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[14px] text-[#78716C]">새로운 알림이 없어요</p>
                <p className="mt-1 text-[13px] text-[#A8A29E]">
                  연락 예정일이 되면 여기에 알려드릴게요
                </p>
              </div>
            ) : (
              notifications.map((notification) =>
                notification.leadId ? (
                  <Link
                    key={notification.id}
                    href={`/leads/${notification.leadId}`}
                    onClick={() => handleClickNotification(notification)}
                    className={`flex gap-3 border-b border-[#E7E0D5]/60 px-4 py-3 transition-colors hover:bg-[#FEF3C7]/30 ${
                      !notification.isRead ? "bg-[#FFFBEB]" : ""
                    }`}
                  >
                    <div className="mt-1.5 flex-shrink-0">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[14px] leading-snug ${!notification.isRead ? "font-semibold text-[#292524]" : "text-[#44403C]"}`}>
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className="mt-0.5 text-[13px] text-[#78716C]">{notification.body}</p>
                      )}
                      <p className="mt-1 text-[12px] text-[#A8A29E]">{timeAgo(notification.createdAt)}</p>
                    </div>
                  </Link>
                ) : (
                  <div
                    key={notification.id}
                    className={`flex gap-3 border-b border-[#E7E0D5]/60 px-4 py-3 ${
                      !notification.isRead ? "bg-[#FFFBEB]" : ""
                    }`}
                  >
                    <div className="mt-1.5 flex-shrink-0">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] leading-snug text-[#44403C]">{notification.title}</p>
                      <p className="mt-1 text-[12px] text-[#A8A29E]">{timeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

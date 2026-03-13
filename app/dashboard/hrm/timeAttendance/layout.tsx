"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, CalendarRange, FileText, LayoutDashboard } from "lucide-react";

export default function TimeAttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "แผงควบคุม",
      href: "/dashboard/hrm/timeAttendance",
      icon: LayoutDashboard,
    },
    {
      label: "เช็คอิน/เช็คเอาท์",
      href: "/dashboard/hrm/timeAttendance/checkin-out",
      icon: Clock,
    },
    {
      label: "กะการทำงาน",
      href: "/dashboard/hrm/timeAttendance/workShift",
      icon: Clock,
    },
    {
      label: "การลางาน",
      href: "/dashboard/hrm/timeAttendance/leaveRequest",
      icon: CalendarRange,
    },
    {
      label: "เอกสาร",
      href: "/dashboard/hrm/timeAttendance/document",
      icon: FileText,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      {/* ── Sub Navigation ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-2">
        <div className="max-w-[1600px] mx-auto flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1">{children}</main>
    </div>
  );
}

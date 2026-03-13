"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, History, Settings, LayoutGrid } from "lucide-react";

export default function WorkShiftLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const subNavItems = [
    {
      label: "Scheduling (D/W/M)",
      href: "/dashboard/hrm/timeAttendance/workShift/scheduling",
      icon: CalendarDays,
    },
    {
      label: "จัดการ OT",
      href: "/dashboard/hrm/timeAttendance/workShift/ot",
      icon: History,
    },
    {
      label: "ตั้งค่าประเภทกะ",
      href: "/dashboard/hrm/timeAttendance/workShift/shift",
      icon: Settings,
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/20">
      {/* ── Polished Sub-Nav for WorkShift ── */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100/50 italic">
               <LayoutGrid size={24} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Workforce Console</h2>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest italic opacity-80 pl-0.5">Shift & Rule Engine</p>
            </div>
          </div>

          <div className="flex bg-slate-50 p-1.5 rounded-[1.2rem] border border-slate-100 shadow-inner">
            {subNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 italic
                    ${isActive
                      ? "bg-white text-indigo-600 shadow-md shadow-indigo-50 border border-indigo-50"
                      : "text-slate-400 hover:text-slate-700 hover:bg-white/50"
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 3 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-50/20">
        {children}
      </div>
    </div>
  );
}

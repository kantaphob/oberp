"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LineChart, Calculator, CheckCircle, History, 
  Banknote, Settings, ArrowUpRight, ArrowDownLeft 
} from "lucide-react";

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "โครงสร้างตำแหน่ง",
      href: "/dashboard/hrm/payroll",
      icon: LineChart,
    },
    {
      title: "ปรับเงินเดือน",
      href: "/dashboard/hrm/payroll/salaryAdjustment",
      icon: Settings,
    },
    {
      title: "ฐานเงินเดือน",
      href: "/dashboard/hrm/payroll/compensation",
      icon: Banknote,
    },
    {
      title: "รายได้พิเศษ",
      href: "/dashboard/hrm/payroll/payrollEarning",
      icon: ArrowUpRight,
    },
    {
      title: "รายการหัก",
      href: "/dashboard/hrm/payroll/payrollDeduction",
      icon: ArrowDownLeft,
    },
 
    {
      title: "ตั้งค่า",
      href: "/dashboard/hrm/payroll/payrollConfig",
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <Icon size={16} />
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </div>
    </div>
  );
}

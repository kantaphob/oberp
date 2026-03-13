"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  History,
  LayoutDashboard,
  Settings,
  Bell,
  ArrowRight,
} from "lucide-react";

// Import Components
import PersonalClockWidget from "@/app/components/hrm/PersonalClockWidget";
import LeaveQuotaCard from "@/app/components/hrm/LeaveQuotaCard";
import ManagerApprovalList from "@/app/components/hrm/ManagerApprovalList";

export default function TimeAttendancePage() {
  const { data: session } = useSession();

  // Access Level Logic (0 = Root, 10 = Employee)
  const accessLevel = session?.user?.level ?? 10;
  const isManagerOrAdmin = accessLevel <= 5;

  // Recent Logs Mock Data
  const recentLogs = [
    {
      date: "13 มี.ค. 2026",
      in: "07:55 น.",
      out: "-",
      status: "NORMAL",
      statusThai: "ปกติ",
    },
    {
      date: "12 มี.ค. 2026",
      in: "08:15 น.",
      out: "17:05 น.",
      status: "LATE",
      statusThai: "สาย (15 นาที)",
    },
    {
      date: "11 มี.ค. 2026",
      in: "07:50 น.",
      out: "17:10 น.",
      status: "NORMAL",
      statusThai: "ปกติ",
    },
    {
      date: "10 มี.ค. 2026",
      in: "07:58 น.",
      out: "17:00 น.",
      status: "NORMAL",
      statusThai: "ปกติ",
    },
    {
      date: "09 มี.ค. 2026",
      in: "08:20 น.",
      out: "17:02 น.",
      status: "LATE",
      statusThai: "สาย (20 นาที)",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* ── Top Navigation / Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                <LayoutDashboard size={24} />
              </span>
              Time & Attendance
            </h1>
            <p className="text-slate-500 font-medium ml-12">
              จัดการเวลาทำงาน, วันลา และคำร้องทั้งหมดของคุณ
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <button className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors">
              <Settings size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {session?.user?.firstName
                    ? `${session.user.firstName} ${session.user.lastName || ""}`
                    : session?.user?.name || "พนักงาน"}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                  Level {accessLevel}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-white shadow-md" />
            </div>
          </div>
        </div>

        {/* ── Main Dashboard Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SECTION (Status & Logs) - 8 Cols */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Clock Widget & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <PersonalClockWidget />
            </div>

            {/* 2. Recent History Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <History size={18} />
                  </div>
                  <h3 className="font-black text-slate-800 tracking-tight">
                    ประวัติการลงเวลาล่าสุด
                  </h3>
                </div>
                <Link
                  href="#"
                  className="group text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-all"
                >
                  ดูประวัติทั้งหมด
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 bg-slate-50/50 font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">วันที่</th>
                      <th className="px-6 py-4">เวลาเข้า</th>
                      <th className="px-6 py-4">เวลาออก</th>
                      <th className="px-6 py-4">สถานะ</th>
                      <th className="px-6 py-4 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentLogs.map((log, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <span className="font-bold text-slate-800">
                            {log.date}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`${log.status === "LATE" ? "text-rose-500" : "text-slate-600"} font-semibold`}
                          >
                            {log.in}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-slate-600 font-semibold">
                            {log.out}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight
                            ${log.status === "NORMAL" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}
                          `}
                          >
                            {log.statusThai}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors px-3 py-1 bg-slate-50 rounded-lg hover:bg-indigo-50">
                            รายละเอียด
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Approvals (Only for Manager/Admin) */}
            {isManagerOrAdmin && (
              <div className="space-y-4">
                <ManagerApprovalList department="Construction / Project A" />
              </div>
            )}
          </div>

          {/* RIGHT SECTION (Stats & Actions) - 4 Cols */}
          <div className="lg:col-span-4 space-y-8 h-full">
            {/* 1. Leave Quota Card */}
            <div className="h-full">
              <LeaveQuotaCard />
            </div>

            {/* 2. Quick Support / Help */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  ?
                </span>
                มีปัญหาเรื่องลงเวลา?
              </h4>
              <p className="text-indigo-100 text-sm mb-4 leading-relaxed opacity-90">
                หากลืมลงเวลา หรือระบบมีปัญหาขัดข้อง ไม่สามารถระบุพิกัดได้
                กรุณายื่นคำร้องขอแก้ไขเวลา (Manual Adjustment)
              </p>
              <button className="w-full py-2.5 bg-white text-indigo-700 rounded-xl text-xs font-black shadow-lg hover:bg-slate-50 transition-all active:scale-[0.98]">
                ขอแก้ไขเวลาทำงาน
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

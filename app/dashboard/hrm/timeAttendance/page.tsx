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
  TrendingUp,
  Users,
  Clock,
  Calendar,
  MoreHorizontal,
  Download,
  PlusSquare,
  MapPin,
} from "lucide-react";

// Import Components
import LeaveQuotaCard from "@/app/components/hrm/LeaveQuotaCard";
import ManagerApprovalList from "@/app/components/hrm/ManagerApprovalList";

export default function TimeAttendancePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<{ stats: any; logs: any[] }>({
    stats: { total: 0, present: 0, late: 0, onLeave: 0 },
    logs: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Access Level Logic (0 = Root, 10 = Employee)
  const accessLevel = session?.user?.level ?? 10;
  const isManagerOrAdmin = accessLevel <= 5;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/hrm/attendance/dashboard");
      const result = await res.json();
      if (result.success) {
        setData({ stats: result.stats, logs: result.logs });
      }
    } catch (error) {
      console.error("Fetch dashboard error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 lg:p-10">
      <div className="max-w-[1700px] mx-auto space-y-10">
        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              Attendance Command Center
            </h1>
            <p className="text-slate-500 font-medium ml-1">
              ตรวจสอบสถานะกำลังพลแบบ Real-time และจัดการข้อมูลการลงเวลาทั้งหมด
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black hover:bg-slate-50 transition-all shadow-sm">
              <Download size={18} />
              Export to Payroll
            </button>
            {isManagerOrAdmin && (
              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                <PlusSquare size={18} />
                Bulk Check-in (Foreman)
              </button>
            )}
          </div>
        </div>

        {/* ── Live Stats Summary ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Users size={24} />
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              พนักงานทั้งหมด
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {isLoading ? "..." : data.stats.total}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Clock size={24} />
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              มาทำงานวันนี้
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {isLoading ? "..." : data.stats.present}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                <TrendingUp size={24} />
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              สาย
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {isLoading ? "..." : data.stats.late}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
                <Calendar size={24} />
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              ลา / หยุด
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {isLoading ? "..." : data.stats.onLeave}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: Main Content (Logs & Tools) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Attendance Log Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <History size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">
                    บันทึกเวลา Real-time ประจำวัน
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((u) => (
                      <div
                        key={u}
                        className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white shadow-sm"
                      />
                    ))}
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black border-2 border-white">
                      +124
                    </div>
                  </div>
                  <button className="text-xs font-black text-indigo-600 hover:text-indigo-700 ml-4">
                    ดูทั้งหมด
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5 text-left italic">พนักงาน</th>
                      <th className="px-6 py-5 text-center">เข้างาน</th>
                      <th className="px-6 py-5 text-center">ออกงาน</th>
                      <th className="px-6 py-5 text-center">พิกัด / สถานที่</th>
                      <th className="px-6 py-5 text-center">สถานะ</th>
                      <th className="px-8 py-5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 italic">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-10 text-center text-slate-400 font-bold"
                        >
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : data.logs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-10 text-center text-slate-400 font-bold tracking-widest uppercase"
                        >
                          ยังไม่มีพนักงานลงเวลาในวันนี้
                        </td>
                      </tr>
                    ) : (
                      data.logs.map((log, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200" />
                              <div>
                                <p className="font-black text-slate-800">
                                  {log.user}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                  {log.role}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center font-bold text-slate-700">
                            {log.in}
                          </td>
                          <td className="px-6 py-6 text-center font-bold text-slate-400">
                            {log.out}
                          </td>
                          <td className="px-6 py-6 font-medium text-slate-600">
                            <div className="flex items-center justify-center gap-1.5">
                              <MapPin size={12} className="text-rose-500" />
                              {log.location}
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span
                              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter
                                      ${log.status === "NORMAL" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}
                                   `}
                            >
                              {log.statusThai}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                              <MoreHorizontal size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
                <button className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors">
                  โหลดข้อมูลเพิ่มเติม...
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: Stats & Actions */}
          <div className="lg:col-span-4 space-y-10">
            <LeaveQuotaCard />

            {isManagerOrAdmin && (
              <ManagerApprovalList department="Total Company" />
            )}

            {/* Manual Adjustment Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Clock size={160} />
              </div>
              <h4 className="text-xl font-black mb-4">Manual Adjustment</h4>
              <p className="text-indigo-200 text-sm mb-8 leading-relaxed font-medium">
                กรณีพนักงานลืมลงเวลา หรือระบบ GPS ขัดข้อง
                ผู้ดูแลสามารถแก้ไขเวลาเข้า-ออกให้ได้โดยตรง
                โดยระบบจะบันทึกสถานะพิเศษไว้เพื่อตรวจสอบ
              </p>
              <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl text-xs font-black shadow-xl hover:bg-slate-50 transition-all active:scale-[0.98]">
                ดำเนินการแก้ไขเวลาให้พนักงาน
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

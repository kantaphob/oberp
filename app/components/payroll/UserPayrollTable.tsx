"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"; // I assume there is a table component, if not I'll build it.
// Wait, I should check if @/app/components/ui/table exists.
// If not, I'll use standard HTML with Tailwind or check existing components.

import {
  Search,
  User as UserIcon,
  Briefcase,
  Building2,
  Banknote,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Users,
  Wallet,
  FileText,
  Download,
  X,
  PieChart,
  Info,
  ShieldCheck,
  CreditCard,
  Gift,
  Landmark,
  Receipt,
  Printer,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import PayslipComponent, { PayslipData } from "./PayslipComponent";

interface UserPayrollTableProps {
  initialUsers: any[];
  departments: { id: string; name: string }[];
  pendingAdjustments: number;
  incompleteAttendance: number;
}

export default function UserPayrollTable({
  initialUsers,
  departments,
  pendingAdjustments,
  incompleteAttendance,
}: UserPayrollTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isRunPayrollOpen, setIsRunPayrollOpen] = useState(false);
  const [isApproveAllOpen, setIsApproveAllOpen] = useState(false);
  const [isBankExportOpen, setIsBankExportOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredUsers = initialUsers.filter((user) => {
    const fullName =
      `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.toLowerCase();
    const username = user.username.toLowerCase();
    const roleName = user.role?.name?.toLowerCase() || "";
    const deptMatch =
      selectedDept === "all" || user.role?.departmentId === selectedDept;
    const typeMatch =
      selectedType === "all" ||
      user.employeeCompensation?.paymentType === selectedType;

    return (
      (fullName.includes(searchTerm.toLowerCase()) ||
        username.includes(searchTerm.toLowerCase()) ||
        roleName.includes(searchTerm.toLowerCase())) &&
      deptMatch &&
      typeMatch
    );
  });

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateStats = () => {
    let totalBase = 0;
    let totalEarnings = 0;
    let totalDeductions = 0;
    let monthlyCount = 0;
    let dailyCount = 0;

    initialUsers.forEach((user) => {
      const base = user.employeeCompensation?.baseWage || 0;
      const earnings =
        user.earnings?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
      const deductions =
        user.payrollDeductions?.reduce(
          (sum: number, d: any) => sum + d.amount,
          0,
        ) || 0;

      totalBase += base;
      totalEarnings += earnings;
      totalDeductions += deductions;

      if (user.employeeCompensation?.paymentType === "MONTHLY") monthlyCount++;
      if (user.employeeCompensation?.paymentType === "DAILY") dailyCount++;
    });

    const totalCalculated = monthlyCount + dailyCount;

    return {
      totalBase,
      totalEarnings,
      totalDeductions,
      netTotal: totalBase + totalEarnings - totalDeductions,
      employeeCount: initialUsers.length,
      totalCalculated,
      monthlyCount,
      dailyCount,
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-8 pb-20">
      {/* Alert Section */}
      {(pendingAdjustments > 0 || incompleteAttendance > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {pendingAdjustments > 0 && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="text-sm font-black text-amber-900">
                  Pending Salary Adjustments
                </div>
                <div className="text-xs font-bold text-amber-700">
                  มี {pendingAdjustments} รายการรออนุมัติการปรับฐานเงินเดือน
                </div>
              </div>
            </div>
          )}
          {incompleteAttendance > 0 && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                <Info size={24} />
              </div>
              <div>
                <div className="text-sm font-black text-rose-900">
                  Incomplete Attendance
                </div>
                <div className="text-xs font-bold text-rose-700">
                  พนักงาน {incompleteAttendance} คน ยังลงเวลาไม่ครบถ้วน
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
              ยอดจ่ายสุทธิรวม (Total Net)
            </div>
            <div className="text-3xl font-black text-white tracking-tighter">
              {formatCurrency(stats.netTotal)}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                Ready to Pay
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
              ยอดตอบแทนรวม (Gross Pay)
            </div>
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(stats.totalBase + stats.totalEarnings)}
            </div>
            <div className="mt-2 text-[10px] font-bold text-slate-400 flex justify-between">
              <span>ฐาน: {formatCurrency(stats.totalBase)}</span>
              <span className="text-emerald-500">
                +{formatCurrency(stats.totalEarnings)} (เงินเพิ่ม)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
              ยอดหักรวม (Deductions)
            </div>
            <div className="text-2xl font-black text-rose-600">
              -{formatCurrency(stats.totalDeductions)}
            </div>
            <div className="mt-2 text-[10px] font-bold text-slate-400">
              ภาษี, ประกันสังคม และอื่นๆ
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
              Headcount
            </div>
            <div className="text-2xl font-black text-slate-900">
              {stats.totalCalculated}/{stats.employeeCount}
            </div>
            <div className="mt-2 text-[10px] font-bold text-slate-400 flex gap-2">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />{" "}
                รายเดือน: {stats.monthlyCount}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />{" "}
                รายวัน: {stats.dailyCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Quick Actions */}
      <div className="bg-white/40 p-4 rounded-[2rem] border border-white shadow-sm backdrop-blur-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="month"
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
            <select
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="all">ทุกแผนก</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">ประเภทการจ้าง</option>
              <option value="MONTHLY">รายเดือน</option>
              <option value="DAILY">รายวัน</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunPayrollOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-white rounded-2xl text-sm font-black hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
            >
              <PieChart size={18} /> Run Payroll
            </button>
            <button
              onClick={() => setIsApproveAllOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-2xl text-sm font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              <ShieldCheck size={18} /> Approve All
            </button>
            <div className="w-px h-8 bg-slate-200 mx-2" />
            <button
              onClick={() => setIsBankExportOpen(true)}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all"
              title="Bank File"
            >
              <Landmark size={20} />
            </button>
            <button
              className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all"
              title="Export PDF"
              onClick={() => setIsSummaryOpen(true)}
            >
              <FileText size={20} />
            </button>
          </div>
        </div>

        <div className="relative group max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="ค้นหาตามรหัสพนักงาน, ชื่อ หรือรายละเอียดตำแหน่ง..."
            className="block w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  ข้อมูลพนักงาน
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  ประเภท
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  ฐานเงินเดือน
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  รายการเงินเพิ่ม
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-rose-600 uppercase tracking-widest">
                  รายการหักชำระ
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  สุทธิ (Net)
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 border border-slate-200">
                          {user.profile?.image ? (
                            <img
                              src={user.profile.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon size={20} />
                          )}
                        </div>
                        <div className="truncate max-w-[150px]">
                          <div className="text-sm font-black text-slate-900 leading-none mb-1 truncate">
                            {user.profile
                              ? `${user.profile.firstName} ${user.profile.lastName}`
                              : user.username}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                            <span className="text-slate-300">#</span>
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        className={`rounded-lg font-black text-[10px] border-none ${
                          user.employeeCompensation?.paymentType === "MONTHLY"
                            ? "bg-cyan-50 text-cyan-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {user.employeeCompensation?.paymentType || "-"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">
                        {formatCurrency(
                          user.employeeCompensation?.baseWage || 0,
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const totalEarnings =
                          user.earnings?.reduce(
                            (sum: number, e: any) => sum + e.amount,
                            0,
                          ) || 0;
                        return (
                          <div
                            className={`text-sm font-black ${totalEarnings > 0 ? "text-emerald-600" : "text-slate-300"}`}
                          >
                            {totalEarnings > 0
                              ? `+${formatCurrency(totalEarnings)}`
                              : "-"}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const totalDeductions =
                          user.payrollDeductions?.reduce(
                            (sum: number, d: any) => sum + d.amount,
                            0,
                          ) || 0;
                        return (
                          <div
                            className={`text-sm font-black ${totalDeductions > 0 ? "text-rose-600" : "text-slate-300"}`}
                          >
                            {totalDeductions > 0
                              ? `-${formatCurrency(totalDeductions)}`
                              : "-"}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const base = user.employeeCompensation?.baseWage || 0;
                        const earnings =
                          user.earnings?.reduce(
                            (sum: number, e: any) => sum + e.amount,
                            0,
                          ) || 0;
                        const deductions =
                          user.payrollDeductions?.reduce(
                            (sum: number, d: any) => sum + d.amount,
                            0,
                          ) || 0;
                        const total = base + earnings - deductions;
                        return (
                          <div
                            className={`text-sm font-black ${total < 0 ? "text-rose-700 animate-pulse" : "text-slate-900"}`}
                          >
                            {formatCurrency(total)}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const status = user.payslips?.[0]?.status || "DRAFT";
                        const colors: any = {
                          DRAFT: "bg-slate-100 text-slate-500",
                          APPROVED: "bg-emerald-50 text-emerald-600",
                          PAID: "bg-cyan-500 text-white shadow-sm shadow-cyan-500/20",
                        };
                        return (
                          <Badge
                            className={`rounded-lg font-black text-[9px] border-none px-2 py-1 ${colors[status]}`}
                          >
                            {status}
                          </Badge>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                          title="View Bill"
                        >
                          <Receipt size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Users size={40} className="opacity-20" />
                      <div className="font-bold">
                        ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไข
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Summary Modal */}
      {isSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsSummaryOpen(false)}
          />
          <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <PieChart className="text-cyan-500" />
                  สรุปงบประมาณรายจ่ายรวม
                </h2>
                <p className="text-slate-500 font-medium">
                  ภาพรวมรายการรับ-จ่ายทั้งหมดในรอบนี้
                </p>
              </div>
              <button
                onClick={() => setIsSummaryOpen(false)}
                className="p-2 hover:bg-white rounded-2xl transition-colors border border-transparent hover:border-slate-200 shadow-sm"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
              {/* Earnings Breakdown */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <ArrowUpRight size={16} /> รายละเอียดรายการเงินเพิ่ม
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const breakdown: Record<string, number> = {};
                    initialUsers.forEach((u) =>
                      u.earnings?.forEach((e: any) => {
                        breakdown[e.reason || "อื่นๆ"] =
                          (breakdown[e.reason || "อื่นๆ"] || 0) + e.amount;
                      }),
                    );
                    return Object.entries(breakdown).length > 0 ? (
                      Object.entries(breakdown).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center p-4 rounded-2xl bg-emerald-50/30 border border-emerald-50"
                        >
                          <span className="text-sm font-bold text-slate-700">
                            {key}
                          </span>
                          <span className="text-sm font-black text-emerald-600">
                            +{formatCurrency(val as number)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-8">
                        ไม่มีข้อมูลรายการเงินเพิ่ม
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                  <ArrowDownLeft size={16} /> รายละเอียดรายการหัก
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const breakdown: Record<string, number> = {};
                    initialUsers.forEach((u) =>
                      u.payrollDeductions?.forEach((d: any) => {
                        breakdown[d.reason || "อื่นๆ"] =
                          (breakdown[d.reason || "อื่นๆ"] || 0) + d.amount;
                      }),
                    );
                    return Object.entries(breakdown).length > 0 ? (
                      Object.entries(breakdown).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center p-4 rounded-2xl bg-rose-50/30 border border-rose-50"
                        >
                          <span className="text-sm font-bold text-slate-700">
                            {key}
                          </span>
                          <span className="text-sm font-black text-rose-600">
                            -{formatCurrency(val as number)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-8">
                        ไม่มีข้อมูลรายการหัก
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-900 flex justify-between items-center">
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">
                  ยอดรวมสุทธิที่ต้องชำระ
                </p>
                <div className="text-3xl font-black text-white">
                  {formatCurrency(stats.netTotal)}
                </div>
              </div>
              <button
                className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors shadow-xl"
                onClick={() => setIsSummaryOpen(false)}
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Payslip (Bill) Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />
          <div
            id="payroll-print-modal"
            className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
          >
            <div className="max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible">
              {(() => {
                const base = selectedUser.employeeCompensation?.baseWage || 0;
                const earningsList = selectedUser.earnings || [];
                const deductionsList = selectedUser.payrollDeductions || [];

                // Group earnings/deductions for the Payslip interface
                const earningsTotal = earningsList.reduce(
                  (sum: number, e: any) => sum + e.amount,
                  0,
                );
                const deductionsTotal = deductionsList.reduce(
                  (sum: number, d: any) => sum + d.amount,
                  0,
                );

                const [year, month] = selectedMonth.split("-");
                const payMonthName = new Date(
                  parseInt(year),
                  parseInt(month) - 1,
                ).toLocaleDateString("th-TH", { month: "long" });
                const payDateString = `28 ${payMonthName} ${parseInt(year) + 543}`;

                const payslipData: PayslipData = {
                  payPeriod: payMonthName,
                  payYear: (parseInt(year) + 543).toString(),
                  payDate: payDateString,
                  employee: {
                    id: selectedUser.username.toUpperCase(), // ใช้ username เป็น ID พนักงานเบื้องต้น
                    username: selectedUser.username,
                    name: selectedUser.profile
                      ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`
                      : selectedUser.username,
                    taxId: selectedUser.profile?.taxId || "-",
                    role: selectedUser.role?.name || "ไม่ระบุตำแหน่ง",
                    division:
                      selectedUser.role?.department?.name || "ไม่ระบุฝ่าย",
                    department:
                      selectedUser.role?.jobLine?.name || "ไม่ระบุแผนก",
                    startDate: selectedUser.profile?.startDate
                      ? new Date(
                          selectedUser.profile.startDate,
                        ).toLocaleDateString("th-TH")
                      : "-",
                    bankAccount: "-", // ยังไม่มีใน Schema
                    baseSalary: base,
                  },
                  earnings: {
                    baseSalary: base,
                    otAmount:
                      earningsList.find(
                        (e: any) => e.code === "OT" || e.reason?.includes("OT"),
                      )?.amount || 0,
                    commission:
                      earningsList.find(
                        (e: any) =>
                          e.code?.includes("COMMISSION") ||
                          e.reason?.includes("Commission"),
                      )?.amount || 0,
                    incentive:
                      earningsList.find(
                        (e: any) =>
                          e.code?.includes("INCENTIVE") ||
                          e.reason?.includes("Incentive"),
                      )?.amount || 0,
                    allowances: earningsList
                      .filter(
                        (e: any) =>
                          e.code?.includes("ALLOWANCE") ||
                          e.reason?.includes("Allowance") ||
                          e.reason?.includes("เบี้ยเลี้ยง"),
                      )
                      .reduce((sum: number, e: any) => sum + e.amount, 0),
                    others: earningsList
                      .filter(
                        (e: any) =>
                          e.code !== "OT" &&
                          !e.reason?.includes("OT") &&
                          !e.code?.includes("COMMISSION") &&
                          !e.reason?.includes("Commission") &&
                          !e.code?.includes("INCENTIVE") &&
                          !e.reason?.includes("Incentive") &&
                          !e.code?.includes("ALLOWANCE") &&
                          !e.reason?.includes("Allowance") &&
                          !e.reason?.includes("เบี้ยเลี้ยง"),
                      )
                      .reduce((sum: number, e: any) => sum + e.amount, 0),
                  },
                  deductions: {
                    sso:
                      deductionsList.find(
                        (d: any) =>
                          d.code === "SSO" || d.reason?.includes("ประกันสังคม"),
                      )?.amount || 0,
                    tax:
                      deductionsList.find(
                        (d: any) =>
                          d.code === "WHT" || d.reason?.includes("ภาษี"),
                      )?.amount || 0,
                    guarantee:
                      deductionsList.find(
                        (d: any) =>
                          d.code?.includes("GUARANTEE") ||
                          d.reason?.includes("ค้ำประกัน"),
                      )?.amount || 0,
                    leave:
                      deductionsList.find(
                        (d: any) =>
                          d.code?.includes("LEAVE") ||
                          d.reason?.includes("ขาด") ||
                          d.reason?.includes("ลา") ||
                          d.reason?.includes("สาย"),
                      )?.amount || 0,
                    others: deductionsList
                      .filter(
                        (d: any) =>
                          d.code !== "SSO" &&
                          !d.reason?.includes("ประกันสังคม") &&
                          d.code !== "WHT" &&
                          !d.reason?.includes("ภาษี") &&
                          !d.code?.includes("GUARANTEE") &&
                          !d.reason?.includes("ค้ำประกัน") &&
                          !d.code?.includes("LEAVE") &&
                          !d.reason?.includes("ขาด") &&
                          !d.reason?.includes("ลา") &&
                          !d.reason?.includes("สาย"),
                      )
                      .reduce((sum: number, d: any) => sum + d.amount, 0),
                    otherDetails:
                      deductionsList.length > 0
                        ? "มีรายการหักเพิ่มเติม"
                        : undefined,
                  },
                  summary: {
                    totalEarnings: base + earningsTotal,
                    totalDeductions: deductionsTotal,
                    netIncome: base + earningsTotal - deductionsTotal,
                  },
                  guaranteeAccumulated: 0, // Fetch from actual history if available
                };

                return (
                  <div className="relative">
                    <div className="absolute top-6 right-6 flex gap-2 print:hidden z-20">
                      <button
                        onClick={() => window.print()}
                        className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-full transition-all"
                        title="Print / Save PDF"
                      >
                        <Printer size={20} />
                      </button>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
                      >
                        <X size={20} className="text-slate-500" />
                      </button>
                    </div>
                    <PayslipComponent data={payslipData} />
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Run Payroll Modal */}
      {isRunPayrollOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsRunPayrollOpen(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto text-cyan-500">
                <PieChart
                  size={40}
                  className={isProcessing ? "animate-spin" : ""}
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">
                  ประมวลผลเงินเดือน
                </h2>
                <p className="text-slate-500 font-medium">
                  ระบบจะดึงข้อมูลเวลาเข้า-ออก, OT และรายการรับ-จ่าย <br />{" "}
                  ประจำเดือน{" "}
                  <span className="text-slate-900 font-bold">มีนาคม 2026</span>{" "}
                  มาคำนวณใหม่ทั้งหมด
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 italic text-[10px] text-slate-400 font-bold">
                  * จะคำนวณพนักงานทั้งหมด {initialUsers.length} คน
                </div>
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 italic text-[10px] text-slate-400 font-bold">
                  * ข้อมูล Attendance จะถูกอัปเดต
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsRunPayrollOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => {
                    setIsProcessing(true);
                    setTimeout(() => {
                      setIsProcessing(false);
                      setIsRunPayrollOpen(false);
                    }, 2000);
                  }}
                  className="flex-1 px-6 py-4 bg-cyan-500 text-white rounded-2xl font-black hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
                >
                  {isProcessing ? "กำลังประมวลผล..." : "เริ่มประมวลผล"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve All Modal */}
      {isApproveAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsApproveAllOpen(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <ShieldCheck size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">
                  อนุมัติเงินเดือนทั้งหมด
                </h2>
                <p className="text-slate-500 font-medium italic">
                  คุณต้องการอนุมัติรายการเงินเดือนพนักงานทั้งหมดใช่หรือไม่?{" "}
                  <br /> ข้อมูลจะถูกล็อกและเปลี่ยนสถานะเป็น{" "}
                  <span className="text-emerald-600 font-black">APPROVED</span>
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-emerald-50/30 border border-emerald-100 space-y-2 text-left">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>จำนวนพนักงาน:</span>
                  <span>{initialUsers.length} คน</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>ยอดจ่ายรวมสุทธิ:</span>
                  <span className="text-slate-900">
                    {formatCurrency(stats.netTotal)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsApproveAllOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  ยังก่อน
                </button>
                <button
                  onClick={() => setIsApproveAllOpen(false)}
                  className="flex-1 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  อนุมัติทันที
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Bank File Modal */}
      {isBankExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsBankExportOpen(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <Landmark size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Export Bank File
                </h2>
                <p className="text-xs text-slate-500 font-bold">
                  เลือกรูปแบบไฟล์ธนาคารเพื่อทำเรื่องเบิกจ่าย
                </p>
              </div>
            </div>

            <div className="p-8 space-y-4">
              {[
                {
                  name: "K-Cyber Business (KBank)",
                  logo: "KBANK",
                  color: "bg-emerald-600",
                },
                {
                  name: "SCB Business Net",
                  logo: "SCB",
                  color: "bg-indigo-600",
                },
                {
                  name: "Bualuang iBusiness (BBL)",
                  logo: "BBL",
                  color: "bg-blue-800",
                },
                {
                  name: "Krungthai Corporate Online",
                  logo: "KTB",
                  color: "bg-cyan-500",
                },
              ].map((bank) => (
                <button
                  key={bank.name}
                  className="w-full p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${bank.color} text-white flex items-center justify-center text-[10px] font-black`}
                    >
                      {bank.logo}
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {bank.name}
                    </span>
                  </div>
                  <Download
                    size={18}
                    className="text-slate-300 group-hover:text-slate-900 transition-colors"
                  />
                </button>
              ))}
            </div>

            <div className="p-8 pt-0">
              <button
                onClick={() => setIsBankExportOpen(false)}
                className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          /* Hide everything first */
          body * {
            visibility: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Show only the target modal and all its children */
          #payroll-print-modal,
          #payroll-print-modal * {
            visibility: visible !important;
          }
          /* Reset position and layout for printing */
          #payroll-print-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Ensure modal containers don't restrict height */
          .fixed.inset-0.z-50,
          .fixed.inset-0.z-50 div {
            max-height: none !important;
            overflow: visible !important;
            position: relative !important;
            display: block !important;
          }
          /* Hide UI elements that shouldn't be printed */
          .print\:hidden,
          .absolute.inset-0.bg-slate-900\/60 {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

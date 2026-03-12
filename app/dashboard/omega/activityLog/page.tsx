"use client";

import React, { useState } from "react";
import { 
  Activity, Search, Filter, Calendar, Clock, User, FileText, Download, ShieldAlert, CheckCircle, AlertCircle
} from "lucide-react";
import { useTableControls } from "@/app/hooks/useTableControls";
import { TableControls } from "@/app/components/Dashboard/TableControls";

// Mock data for activity logs since we don't have a DB table for it yet
const initialLogs = [
  {
    id: 1,
    action: "USER_LOGIN",
    description: "เข้าสู่ระบบสำเร็จ (IP: 192.168.1.42)",
    user: "MD26001",
    role: "Admin",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: "SUCCESS",
    icon: <CheckCircle size={16} className="text-emerald-500" />
  },
  {
    id: 2,
    action: "CREATE_DOCUMENT",
    description: "สร้างเอกสาร BOQ-2026-001 ใหม่",
    user: "User",
    role: "Staff",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "SUCCESS",
    icon: <FileText size={16} className="text-blue-500" />
  },
  {
    id: 3,
    action: "UPDATE_USER",
    description: "แก้ไขสิทธิ์การใช้งานของพนักงาน ID: hr-123",
    user: "MD26001",
    role: "Admin",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "WARNING",
    icon: <ShieldAlert size={16} className="text-amber-500" />
  },
  {
    id: 4,
    action: "DELETE_PROJECT",
    description: "พยายามลบโปรเจกต์ PRJ-009 แต่ถูกปฏิเสธสิทธิ์",
    user: "User",
    role: "Staff",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "FAILED",
    icon: <AlertCircle size={16} className="text-red-500" />
  },
];

export default function ActivityLogPage() {
  const [logs] = useState(initialLogs);

  const { paged, tableProps } = useTableControls(
    [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    {
      filterFn: (log, term) => [
        log.action, log.description, log.user, log.role, log.status
      ].some(v => v.toLowerCase().includes(term)),
      defaultPerPage: 10,
    }
  );

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Activity size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">บันทึกการทำงานในระบบ</h1>
          </div>
          <p className="text-slate-500 font-medium ml-12">
            ตรวจสอบข้อมูลและกิจกรรมการใช้งานของผู้ใช้ทั้งหมด (Activity Logs)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold shadow-sm text-sm">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full">
          <TableControls table={tableProps} entityLabel="บันทึก" searchPlaceholder="ค้นหาชื่อผู้ใช้, กิจกรรม, หรือรายละเอียด..." />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 hide-scrollbar shrink-0">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium whitespace-nowrap">
            <Filter size={14} />
            กรองข้อมูล
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium whitespace-nowrap">
            <Calendar size={14} />
            วันที่
          </button>
        </div>
      </div>

      {/* Log List Table (Modern Card style) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-full bg-slate-100 group-hover:scale-110 transition-transform">
                        {log.icon}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold font-mono tracking-tight">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-700">
                      {log.description}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                        <User size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{log.user}</span>
                        <span className="text-xs font-semibold text-slate-400">{log.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Clock size={14} className="text-slate-400" />
                      {formatTime(log.timestamp)}
                    </div>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <Search size={32} className="text-slate-300" />
                       <p className="font-medium text-lg">ไม่พบประวัติการทำงาน</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <TableControls table={tableProps} entityLabel="บันทึก" searchPlaceholder="" />
        </div>
      </div>
    </div>
  );
}

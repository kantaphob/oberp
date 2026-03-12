"use client";

import React, { useState, useEffect } from "react";
import { 
  FileCheck, ShieldAlert, CheckCircle, XCircle, Search, Filter, 
  Trash2, Edit2, Plus, ArrowRight, User, Clock, ShieldCheck, 
  AlertTriangle, RefreshCcw, Eye
} from "lucide-react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

type PendingAction = {
  id: string;
  action: string;
  description: string;
  payload: any;
  targetModel: string;
  targetId: string | null;
  requesterId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  requester: {
    username: string;
    role?: {
      name: string;
      level: number;
    }
  };
  approver?: {
    username: string;
  };
};

export default function OmegaReportPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/omega/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Fetch reports error", error);
      toast.error("ไม่สามารถดึงข้อมูลรายงานได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (id: string, actionName: "APPROVE" | "REJECT") => {
    if (session?.user?.level !== 0) {
      toast.error("เฉพาะผู้ออกแบบระบบ (Level 0) เท่านั้นที่อนุมัติได้");
      return;
    }

    if (!confirm(`ยืนยันการ ${actionName === "APPROVE" ? "อนุมัติ" : "ปฏิเสธ"} รายการนี้?`)) return;

    setIsProcessing(id);
    try {
      const res = await fetch("/api/omega/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, actionName }),
      });

      if (res.ok) {
        toast.success(actionName === "APPROVE" ? "อนุมัติสำเร็จ ข้อมูลถูกบันทึกแล้ว" : "ปฏิเสธรายการสำเร็จ");
        fetchReports();
      } else {
        const err = await res.json();
        toast.error(err.error || "เกิดข้อผิดพลาดในการประมวลผล");
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredReports = reports.filter(r => {
    const s = searchTerm.toLowerCase();
    const matchSearch = r.description.toLowerCase().includes(s) || r.requester.username.toLowerCase().includes(s);
    if (filter === "ALL") return matchSearch;
    return matchSearch && r.status === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600 shadow-sm border border-orange-200">
              <FileCheck size={28} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Audit & Staging</h1>
          </div>
          <p className="text-slate-500 font-medium ml-14">
            ตรวจสอบและอนุมัติรายการแก้ไขข้อมูลที่ต้องอาศัยการยืนยันสิทธิ์ขั้นสูง (Level 0 Overrides)
          </p>
        </div>

        <button 
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold shadow-sm text-sm"
        >
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <RefreshCcw size={20} />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {reports.filter(r => r.status === "PENDING").length}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pending Approval</p>
          <p className="text-xs text-slate-400 mt-1">รายการที่รอการยืนยันจาก Level 0</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle size={20} />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {reports.filter(r => r.status === "APPROVED").length}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Applied Changes</p>
          <p className="text-xs text-slate-400 mt-1">รายการที่ได้รับอนุมัติและบันทึกแล้ว</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <XCircle size={20} />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {reports.filter(r => r.status === "REJECTED").length}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Rejected Actions</p>
          <p className="text-xs text-slate-400 mt-1">รายการที่ถูกปฏิเสธโดยผู้ดูแลระบบ</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="ค้นหาตามรายละเอียด หรือผู้ขอ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar w-full md:w-auto">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm
                ${filter === f 
                  ? "bg-slate-800 text-white" 
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4 font-bold animate-pulse">Loading audits...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredReports.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300">
              <AlertTriangle size={64} className="text-slate-200 mb-4" />
              <p className="text-xl font-black text-slate-400 italic tracking-tight">ไม่พบประวัติการทำงานที่ระบุ</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div 
                key={report.id} 
                className={`bg-white rounded-3xl border overflow-hidden transition-all shadow-sm hover:shadow-md
                  ${report.status === "PENDING" ? "border-orange-200" : "border-slate-200"}
                  ${isProcessing === report.id ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* Left side: Basic info */}
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          report.action.includes("DELETE") ? "bg-red-100 text-red-600" :
                          report.action.includes("CREATE") ? "bg-emerald-100 text-emerald-600" :
                          "bg-blue-100 text-blue-600"
                        }`}>
                          {report.action.includes("DELETE") ? <Trash2 size={20} /> :
                           report.action.includes("CREATE") ? <Plus size={20} /> :
                           <Edit2 size={20} />}
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-slate-800 leading-none mb-1">{report.action}</h3>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider">
                            <Clock size={12} />
                            {new Date(report.createdAt).toLocaleString("th-TH")}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <p className="text-slate-700 font-bold mb-2">{report.description}</p>
                         <div className="flex flex-wrap gap-2 text-xs">
                           <span className="px-3 py-1 bg-white border border-slate-200 rounded-full font-mono text-slate-500">
                             Target: {report.targetModel}
                           </span>
                           {report.targetId && (
                             <span className="px-3 py-1 bg-white border border-slate-200 rounded-full font-mono text-slate-500">
                               ID: {report.targetId.substring(0, 8)}...
                             </span>
                           )}
                         </div>
                      </div>
                    </div>

                    {/* Middle: Request info */}
                    <div className="md:w-64 space-y-4 pt-2">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Requested By</label>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                               <User size={18} />
                             </div>
                             <div>
                               <p className="font-black text-slate-800 text-sm leading-none">{report.requester.username}</p>
                               <p className="text-[10px] font-bold text-orange-600 uppercase mt-1">Level {report.requester.role?.level}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Right side: Status and Actions */}
                    <div className="md:w-48 flex flex-col justify-between items-end gap-4 min-w-[200px]">
                       <div className={`px-4 py-2 rounded-2xl text-xs font-black tracking-widest flex items-center gap-2 shadow-sm border
                         ${report.status === "PENDING" ? "bg-orange-50 text-orange-600 border-orange-100" : 
                           report.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                           "bg-red-50 text-red-600 border-red-100"}`}>
                         {report.status === "PENDING" ? <ShieldAlert size={14} /> : 
                          report.status === "APPROVED" ? <ShieldCheck size={14} /> : 
                          <AlertTriangle size={14} />}
                         {report.status}
                       </div>

                       {report.status === "PENDING" && session?.user?.level === 0 && (
                         <div className="flex w-full gap-2">
                            <button 
                              onClick={() => handleAction(report.id, "REJECT")}
                              className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold text-xs transition-colors border border-red-100"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => handleAction(report.id, "APPROVE")}
                              className="flex-[2] py-3 bg-slate-900 text-white hover:bg-black rounded-2xl font-black text-xs transition-colors flex items-center justify-center gap-1 shadow-lg shadow-black/20"
                            >
                              Accept & Apply <ArrowRight size={14} />
                            </button>
                         </div>
                       )}

                       {report.status === "APPROVED" && (
                         <div className="text-right">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approved By</p>
                           <p className="text-sm font-black text-slate-800">@{report.approver?.username}</p>
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Payload Preview (Collapsible or just small display) */}
                  {report.status === "PENDING" && (
                     <div className="mt-6 pt-6 border-t border-dashed border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                           <Eye size={12} /> Data Payload Preview
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-4 overflow-x-auto">
                           <pre className="text-orange-400 font-mono text-[10px] leading-relaxed">
                             {JSON.stringify(report.payload, null, 2)}
                           </pre>
                        </div>
                     </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
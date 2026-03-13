"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Search, Filter, Clock, User, Calendar, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
  department?: string;
  viewAll?: boolean;
}

export default function ManagerApprovalList({ department, viewAll }: Props) {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/hrm/leave-request?mode=team-approvals");
      const result = await res.json();
      if (result.success) setRequests(result.data.filter((r: any) => r.status === "PENDING"));
    } catch (error) {
      console.error("Fetch approvals error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/hrm/leave-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: action })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        setRequests(prev => prev.filter(r => r.id !== id));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("ดำเนินการไม่สำเร็จ");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Loading Pending Task...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full group">
      {/* Header & Tools */}
      <div className="p-8 border-b border-slate-100 bg-slate-50/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              รายการรออนุมัติ (Approvals)
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-black uppercase tracking-widest italic opacity-60">
              {viewAll
                ? "Showing all requests (Admin/HR Access)"
                : `Active Region: ${department || "Company Wide"}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-200 animate-pulse">
               {requests.length} Pending
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อพนักงาน หรือประเภทการลา..."
              className="pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 w-full transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left italic">
          <thead className="text-[10px] text-slate-400 bg-slate-50/50 uppercase tracking-widest font-black border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">พนักงาน / แผนก</th>
              <th className="px-6 py-5">ประเภทคำร้อง</th>
              <th className="px-6 py-5">ระยะเวลาที่ขอ</th>
              <th className="px-8 py-5 text-right">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-4 grayscale opacity-40">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                    <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">All Clear. No Pending Tasks.</p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/50 transition-colors group cursor-default"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs border-2 border-indigo-100/50 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {req.userName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-base">{req.userName}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                          <User size={12} className="text-indigo-400" /> {req.department || "Field Staff"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100/50 tracking-widest">
                      {req.type}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-bold text-slate-700">
                    {new Date(req.startDate).toLocaleDateString('th-TH')} - {new Date(req.endDate).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => handleAction(req.id, "REJECTED")}
                        className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border-2 border-transparent hover:border-rose-100 shadow-sm"
                      >
                        <XCircle size={24} />
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "APPROVED")}
                        className="px-6 py-3 bg-emerald-50 text-emerald-600 font-black rounded-2xl flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-emerald-50 border-2 border-emerald-100/50 active:scale-95"
                      >
                        <CheckCircle2 size={20} />
                        อนุมัติ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

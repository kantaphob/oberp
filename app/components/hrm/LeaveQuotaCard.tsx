"use client";

import React, { useState, useEffect } from "react";
import { FileText, Clock8, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LeaveQuotaCard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    try {
      const res = await fetch("/api/hrm/leave-request?mode=quota");
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error("Fetch quota error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quotas = [
    { key: "SICK_LEAVE", name: "ลาป่วย (Sick Leave)", color: "bg-blue-500", text: "text-blue-600" },
    { key: "PERSONAL_LEAVE", name: "ลากิจ (Personal)", color: "bg-amber-500", text: "text-amber-600" },
    { key: "ANNUAL_LEAVE", name: "พักร้อน (Annual)", color: "bg-emerald-500", text: "text-emerald-600" },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm h-full flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Loading Quota...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm h-full flex flex-col group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-black text-xl text-slate-900 tracking-tight">โควตาวันลาคงเหลือ</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ประจำปีงบประมาณ 2026</p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <FileText size={20} />
        </div>
      </div>
      
      <div className="space-y-8 flex-1">
        {quotas.map((q, idx) => {
          const item = data?.[q.key] || { used: 0, total: 0 };
          const remain = item.total - item.used;
          const percent = item.total > 0 ? (remain / item.total) * 100 : 0;
          
          return (
            <div key={idx} className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{q.name}</span>
                <div className="text-right">
                  <span className={`text-2xl font-black ${q.text}`}>{remain}</span>
                  <span className="text-xs text-slate-400 font-bold ml-1.5 uppercase tracking-tighter">/ {item.total} Days</span>
                </div>
              </div>
              <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden border border-slate-100 p-0.5 shadow-inner">
                <div 
                  className={`${q.color} h-full rounded-full transition-all duration-1000 ease-out shadow-sm`} 
                  style={{ width: `${percent}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 space-y-4">
        <Link 
          href="/dashboard/hrm/timeAttendance/leaveRequest" 
          className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[1.25rem] text-sm font-black hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-200"
        >
          <FileText size={18} />
          ส่งคำขอพิจารณาการลางาน
        </Link>
        <button className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-[1.25rem] text-sm font-black hover:bg-slate-50 hover:border-slate-200 active:scale-[0.98] transition-all">
          <Clock8 size={18} />
          ประวัติการลางานปีปัจจุบัน
        </button>
      </div>

      <div className="mt-8 flex gap-4 p-5 bg-indigo-50/30 rounded-[1.5rem] border border-indigo-100/50 italic grayscale group-hover:grayscale-0 transition-all">
        <AlertCircle size={20} className="text-indigo-500 shrink-0 mt-1 shadow-inner" />
        <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
          <span className="text-indigo-800 font-black block mb-1 uppercase tracking-widest text-[10px]">Company Policy Note</span>
          สำหรับการลาป่วยมากกว่า 2 วันขึ้นไป โปรดแนบใบรับรองแพทย์จากสถานพยาบาลที่ได้รับการรับรอง เพื่อการคำนวณสวัสดิการพนักงานที่ถูกต้อง
        </p>
      </div>
    </div>
  );
}
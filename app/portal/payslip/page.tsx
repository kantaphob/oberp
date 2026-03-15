"use client";

import React, { useState, useEffect } from "react";
import { Banknote, CalendarDays, History, Loader2, Search, FileText, Download } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/app/hooks/useToast";

export default function MyPayslipPage() {
  const { data: session } = useSession();
  const { notify } = useToast();
  const userId = session?.user?.id || "guest";

  // 🌟 Method 2: LocalStorage (จำสถานะส่วนบุคคล)
  // ใช้ userId ใน Key เพื่อแยกข้อมูลพนักงานแต่ละคนบนคอมเครื่องเดียวกัน
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMonth = localStorage.getItem(`my_payslip_last_month_${userId}`);
      return savedMonth || new Date().toISOString().substring(0, 7);
    }
    return new Date().toISOString().substring(0, 7);
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`my_payslip_active_tab_${userId}`) || "CURRENT";
    }
    return "CURRENT";
  });

  // อัปเดตลง LocalStorage ทันทีที่มีการเปลี่ยนค่า (แยกตาม User ID)
  useEffect(() => {
    if (userId !== "guest") {
      localStorage.setItem(`my_payslip_last_month_${userId}`, selectedMonth);
    }
  }, [selectedMonth, userId]);

  useEffect(() => {
    if (userId !== "guest") {
      localStorage.setItem(`my_payslip_active_tab_${userId}`, activeTab);
    }
  }, [activeTab, userId]);

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-emerald-500 text-white rounded-[1.5rem] shadow-xl shadow-emerald-100 flex items-center justify-center">
                <Banknote size={32} />
             </div>
             <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">My Payslip</h2>
                <p className="text-slate-500 font-semibold tracking-wide flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                   ใบแจ้งยอดเงินเดือนและประวัติการรับเงิน
                </p>
             </div>
          </div>
        </div>
        
        {/* เลือกเดือน (ระบบจะจำค่านี้ไว้แยกตามพนักงานแต่ละคน) */}
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <CalendarDays size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
          <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payroll Cycle</span>
             <input 
               type="month" 
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(e.target.value)}
               className="font-black text-slate-700 outline-none cursor-pointer bg-transparent text-lg"
             />
          </div>
        </div>
      </div>

      {/* Tabs Design */}
      <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-[2rem] w-fit border border-slate-200/50 backdrop-blur-sm">
        <button 
          onClick={() => setActiveTab("CURRENT")}
          className={`px-8 py-3 rounded-full font-black text-sm transition-all flex items-center gap-2 ${activeTab === "CURRENT" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
        >
          <FileText size={18} /> สลิปเงินเดือนล่าสุด
        </button>
        <button 
          onClick={() => setActiveTab("HISTORY")}
          className={`px-8 py-3 rounded-full font-black text-sm transition-all flex items-center gap-2 ${activeTab === "HISTORY" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
        >
          <History size={18} /> ประวัติย้อนหลัง
        </button>
      </div>

      {/* Payslip Content Area */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-premium p-1 md:p-12 min-h-[600px] relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50 pointer-events-none" />

        <div className="relative z-10">
          {activeTab === "CURRENT" ? (
            <div className="space-y-8">
               <div className="flex justify-between items-center border-b border-slate-100 pb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">
                      สรุปรายรับรอบเดือน {new Date(selectedMonth + '-01').toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">E-Payslip Statement</p>
                  </div>
                  <button 
                    onClick={() => notify.info("ฟีเจอร์ดาวน์โหลดกำลังจะเปิดใช้งานเร็วๆ นี้")}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                  >
                    <Download size={16} /> PDF Download
                  </button>
               </div>

               {/* Placeholder for real data */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                  <div className="space-y-6">
                     <h4 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] border-l-4 border-emerald-500 pl-4">Earnings / รายรับ</h4>
                     <div className="space-y-4">
                        {[
                          { label: "เงินเดือนพื้นฐาน (Base Salary)", amount: 0 },
                          { label: "เบี้ยขยัน (Incentive)", amount: 0 },
                          { label: "ค่านายหน้า (Commission)", amount: 0 }
                        ].map((item, i) => (
                           <div key={i} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                              <span className="font-bold text-slate-600">{item.label}</span>
                              <span className="font-black text-slate-900">฿ {item.amount.toLocaleString()}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-sm font-black text-rose-600 uppercase tracking-[0.2em] border-l-4 border-rose-500 pl-4">Deductions / รายจ่าย</h4>
                     <div className="space-y-4">
                        {[
                          { label: "ประกันสังคม (SSO)", amount: 0 },
                          { label: "ภาษีเงินได้ (Withholding Tax)", amount: 0 },
                          { label: "รายการหักอื่นๆ", amount: 0 }
                        ].map((item, i) => (
                           <div key={i} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 hover:border-rose-100 hover:bg-rose-50/30 transition-all group">
                              <span className="font-bold text-slate-600">{item.label}</span>
                              <span className="font-black text-rose-600">- ฿ {item.amount.toLocaleString()}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Total Section */}
               <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
                  <div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Net Pay</p>
                    <h5 className="text-lg font-bold">รายรับสุทธิ (โอนเข้าบัญชี)</h5>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-5xl font-black text-emerald-400">฿ 0.00</p>
                    <p className="text-slate-400 text-xs font-medium italic mt-2">ยอดโอนเงินอัตโนมัติ ณ สิ้นเดือน</p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                <History className="w-10 h-10 text-slate-300" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Statement History</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">แสดงรายการสลิปย้อนหลังทั้งหมด 12 เดือนล่าสุดของคุณ</p>
              </div>
              <div className="w-full max-w-2xl bg-slate-50/50 rounded-3xl border border-slate-200 p-8">
                 <p className="text-slate-400 font-bold italic">-- ยังไม่พบประวัติย้อนหลังในระบบ --</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .shadow-premium {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.02);
        }
      `}</style>
    </div>
  );
}

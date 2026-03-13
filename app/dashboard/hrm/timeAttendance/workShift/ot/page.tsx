"use client";

import React, { useState, useEffect } from "react";
import { 
  History, 
  Trash2, 
  XCircle, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function OTPage() {
  const [otRequests, setOtRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOTModal, setShowOTModal] = useState(false);
  const [otData, setOtData] = useState({
    date: new Date().toISOString().split('T')[0],
    plannedHours: "2",
    reason: ""
  });

  useEffect(() => {
    fetchOTRequests();
  }, []);

  const fetchOTRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/hrm/ot-request?mode=team-approvals");
      const result = await res.json();
      if (result.success) setOtRequests(result.data);
    } catch (e) {}
    finally { setIsLoading(false); }
  };

  const handleOTSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/hrm/ot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otData)
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        setShowOTModal(false);
        fetchOTRequests();
      }
    } catch (e) {}
  };

  const handleOTAction = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/hrm/ot-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchOTRequests();
      }
    } catch (e) {}
  };

  const handleOTCancel = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอ OT นี้?")) return;
    try {
      const res = await fetch("/api/hrm/ot-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "CANCELLED" })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("ยกเลิกคำขอเรียบร้อย");
        fetchOTRequests();
      }
    } catch (e) {}
  };

  return (
    <div className="p-8 lg:p-10 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200">
          <div>
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight outline-none border-none">
               <History className="text-rose-500" />
               OT Approval Pipeline
            </h3>
            <p className="text-xs text-slate-400 font-bold italic mt-1 ml-9">* OT จะถูกคำนวณอัตโนมัติหากออกช้าเกิน 30 นาที หรือขอแบบล่วงหน้า (Planned)</p>
          </div>
          <button 
            onClick={() => setShowOTModal(true)} 
            className="px-8 py-4 bg-rose-500 text-white rounded-2xl text-xs font-black shadow-xl shadow-rose-200 hover:bg-rose-600 hover:-translate-y-0.5 transition-all"
          >
            ขอเปิด OT ล่วงหน้า (Planned)
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
             <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
               {isLoading ? (
                 <div className="flex h-[400px] items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm italic">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <tr>
                            <th className="px-10 py-7 text-left">รายละเอียดคำร้อง</th>
                            <th className="px-6 py-7 text-center">วันที่</th>
                            <th className="px-6 py-7 text-center">ชั่วโมง (Planned)</th>
                            <th className="px-6 py-7 text-center">เหตุผล</th>
                            <th className="px-6 py-7 text-center">สถานะ</th>
                            <th className="px-10 py-7 text-right">ดำเนินการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {otRequests.map((req: any) => (
                            <tr key={req.id} className="hover:bg-indigo-50/20 group">
                              <td className="px-10 py-7">
                                 <div className="font-black text-slate-900 text-base">{req.userName}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {req.id.slice(0,8)}</div>
                              </td>
                              <td className="px-6 py-7 text-center font-bold text-slate-600">
                                {new Date(req.date).toLocaleDateString('th-TH')}
                              </td>
                              <td className="px-6 py-7 text-center font-black text-indigo-600 text-xl">
                                {req.plannedHours} <span className="text-[10px] text-slate-400">hrs</span>
                              </td>
                              <td className="px-6 py-7 text-center text-slate-500 font-medium max-w-[200px] truncate italic">
                                "{req.reason}"
                              </td>
                              <td className="px-6 py-7 text-center">
                                 <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border
                                   ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                     req.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                     req.status === 'CANCELLED' ? 'bg-slate-50 text-slate-400 border-slate-100 opacity-50' :
                                     'bg-amber-50 text-amber-600 border-amber-100'}
                                 `}>
                                   {req.status}
                                 </span>
                              </td>
                              <td className="px-10 py-7 text-right">
                                {req.status === 'PENDING' ? (
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => handleOTCancel(req.id)} title="ยกเลิกคำขอ" className="p-3 bg-slate-50 text-slate-300 rounded-2xl hover:bg-slate-200 hover:text-slate-600 transition-all"><Trash2 size={18}/></button>
                                    <button onClick={() => handleOTAction(req.id, "REJECTED")} className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><XCircle size={18}/></button>
                                    <button onClick={() => handleOTAction(req.id, "APPROVED")} className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={18}/></button>
                                  </div>
                                ) : (
                                  <div className="opacity-10 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={18} className="text-slate-300 ml-auto" />
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                  </div>
               )}
             </div>
          </div>
          
          <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-8 h-fit">
              <h5 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-3">
                <AlertCircle className="text-rose-500" />
                OT Strategy
              </h5>
              <div className="space-y-4 font-bold text-slate-600 italic">
                <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 flex flex-col gap-2">
                   <span className="text-[10px] text-rose-400 uppercase tracking-widest font-black">OT Rule 30'</span>
                   <span className="text-xs leading-relaxed text-rose-700">พนักงานต้องลงเวลาออกช้ากว่าเวลากะ 30 นาทีขึ้นไป ระบบจึงจะนับชั่วโมง OT ให้อัตโนมัติ</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-2">
                   <Clock className="text-slate-400" size={18} />
                   <span className="text-xs">Actual OT จะถูกนำไปรวมกับ Planned OT ในการคำนวณค่าตอบแทน</span>
                </div>
              </div>
          </div>
       </div>

      {/* ── OT Request Modal ── */}
      {showOTModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowOTModal(false)} />
           <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 italic">
              <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">ขอเปิด OT / Planning</h3>
              <form onSubmit={handleOTSubmit} className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">วันที่</label>
                      <input type="date" value={otData.date} onChange={e => setOtData({...otData, date: e.target.value})} className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-black"/>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">จำนวน ชม. (แผน)</label>
                      <input type="number" step="0.5" value={otData.plannedHours} onChange={e => setOtData({...otData, plannedHours: e.target.value})} className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-black"/>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">เหตุผล / รายละเอียดงาน</label>
                    <textarea rows={3} value={otData.reason} onChange={e => setOtData({...otData, reason: e.target.value})} className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-black resize-none" placeholder="เช่น เทปูนค้าง, งานติดตั้งด่วน..."/>
                 </div>
                 <button type="submit" className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] font-black shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all">ส่งคำขออนุมัติ OT</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

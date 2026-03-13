"use client";

import React, { useState, useEffect } from "react";
import { 
  FilePlus2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar as CalendarIcon,
  Filter,
  ArrowRight,
  Info,
  CalendarCheck,
  Loader2,
  Edit2,
  Trash2
} from "lucide-react";
import { toast } from "react-hot-toast";

// Reuse existing component
import LeaveQuotaCard from "@/app/components/hrm/LeaveQuotaCard";

export default function LeaveRequestPage() {
  const [activeTab, setActiveTab] = useState("my-requests"); // 'my-requests' | 'team-approvals'
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    type: "PERSONAL_LEAVE",
    startDate: "",
    endDate: "",
    reason: ""
  });

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hrm/leave-request?mode=${activeTab}`);
      const result = await res.json();
      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลคำขอลาได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (req: any) => {
    setEditingRequest(req);
    setFormData({
      type: req.type,
      startDate: new Date(req.startDate).toISOString().split('T')[0],
      endDate: new Date(req.endDate).toISOString().split('T')[0],
      reason: req.reason
    });
    setShowRequestForm(true);
  };

  const handleCancelRequest = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอนี้?")) return;
    
    try {
      const res = await fetch("/api/hrm/leave-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "CANCELLED" })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchRequests();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการยกเลิกคำขอ");
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/hrm/leave-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchRequests();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingRequest ? "PATCH" : "POST";
      const payload = editingRequest ? { ...formData, id: editingRequest.id } : formData;
      
      const res = await fetch("/api/hrm/leave-request", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        setShowRequestForm(false);
        setEditingRequest(null);
        fetchRequests();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการส่งคำขอ");
    }
  };

  return (
    <div className="p-8 lg:p-10 space-y-10 max-w-[1600px] mx-auto animate-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
             <div className="p-3 bg-rose-500 text-white rounded-3xl shadow-xl shadow-rose-200">
               <CalendarCheck size={28} />
             </div>
             Leave Management
          </h2>
          <p className="text-slate-500 font-medium ml-1">จัดการคำร้องขอลา ตรวจสอบสิทธิ และอนุมัติวันหยุดของทีม</p>
        </div>

        <button 
          onClick={() => {
            setEditingRequest(null);
            setFormData({ type: "PERSONAL_LEAVE", startDate: "", endDate: "", reason: "" });
            setShowRequestForm(true);
          }}
          className="flex items-center gap-2 px-8 py-5 bg-slate-900 text-white rounded-3xl text-sm font-black hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95"
        >
          <FilePlus2 size={24} />
          ส่งคำขอลาใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT: Stats & Form Area */}
        <div className="lg:col-span-4 space-y-10">
           <LeaveQuotaCard />
           
           <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 bg-white/5 w-48 h-48 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <h4 className="font-black text-2xl mb-6 flex items-center gap-3">
                <Info size={24} className="text-indigo-400" />
                ระเบียบการลา
              </h4>
              <ul className="space-y-6 text-sm text-slate-300 font-medium leading-relaxed italic">
                <li className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-lg shadow-indigo-500/50" />
                  ลาป่วยเกิน 2 วัน ต้องมีใบรับรองแพทย์แนบในระบบ
                </li>
                <li className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-lg shadow-indigo-500/50" />
                  ลากิจล่วงหน้าอย่างน้อย 3 วันทำการ
                </li>
                <li className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-lg shadow-indigo-500/50" />
                  วันลาพักร้อนสะสมได้ไม่เกิน 15 วันต่อปี
                </li>
              </ul>
              <button className="mt-10 w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-black transition-all backdrop-blur-sm">
                อ่านระเบียบฉบับเต็ม
              </button>
           </div>
        </div>

        {/* RIGHT: Lists Area */}
        <div className="lg:col-span-8">
           <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-sm min-h-[700px] flex flex-col overflow-hidden">
              {/* Tab Header */}
              <div className="px-10 pt-10 pb-0 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between">
                <div className="flex gap-10">
                  <button 
                    onClick={() => setActiveTab("my-requests")}
                    className={`pb-6 text-sm font-black transition-all relative ${activeTab === "my-requests" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    คำขอของฉัน
                    {activeTab === "my-requests" && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-full" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab("team-approvals")}
                    className={`pb-6 text-sm font-black transition-all relative ${activeTab === "team-approvals" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    รอการอนุมัติ (ทีม)
                    {activeTab === "team-approvals" && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-full" />}
                  </button>
                </div>
                
                <button className="mb-6 p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                  <Filter size={20} />
                </button>
              </div>

              {/* List Content */}
              <div className="flex-1 p-10">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Request Data...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {requests.length === 0 ? (
                      <div className="py-20 text-center font-black text-slate-300 uppercase tracking-widest text-sm flex flex-col items-center gap-4">
                         <div className="p-6 bg-slate-50 rounded-full"><CalendarIcon size={40} /></div>
                         ยังไม่มีรายการคำขอลาที่เกี่ยวข้อง
                      </div>
                    ) : (
                      requests.map((req, i) => (
                        <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-white border border-slate-100 rounded-[2rem] hover:shadow-lg hover:border-indigo-100 transition-all group gap-6">
                           <div className="flex items-center gap-6">
                              <div className={`p-5 bg-slate-50 text-slate-400 rounded-[1.5rem] group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-inner`}>
                                <CalendarIcon size={24} />
                              </div>
                              <div className="space-y-1">
                                <p className="font-black text-xl text-slate-900 tracking-tight">
                                  {activeTab === 'team-approvals' ? req.userName : req.type}
                                </p>
                                <div className="flex items-center gap-4">
                                  {activeTab === 'team-approvals' && <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{req.type}</span>}
                                  <p className="text-xs font-bold text-slate-400 italic">
                                    {new Date(req.startDate).toLocaleDateString('th-TH')} - {new Date(req.endDate).toLocaleDateString('th-TH')}
                                  </p>
                                </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4 self-end md:self-auto">
                              <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm
                                ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                  req.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                                  req.status === 'CANCELLED' ? 'bg-slate-50 text-slate-400 border border-slate-100' :
                                  'bg-amber-50 text-amber-600 border border-amber-100'}
                              `}>
                                {req.status}
                              </span>
                              
                              {activeTab === 'team-approvals' && req.status === 'PENDING' ? (
                                <div className="flex gap-2">
                                  <button onClick={() => handleStatusUpdate(req.id, "REJECTED")} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><XCircle size={18} /></button>
                                  <button onClick={() => handleStatusUpdate(req.id, "APPROVED")} className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><CheckCircle2 size={18} /></button>
                                </div>
                              ) : activeTab === 'my-requests' && req.status === 'PENDING' ? (
                                <div className="flex gap-2">
                                  <button onClick={() => handleOpenEdit(req)} title="ย้ายวันลา / แก้ไข" className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Edit2 size={18} /></button>
                                  <button onClick={() => handleCancelRequest(req.id)} title="ยกเลิกคำขอ" className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
                                </div>
                              ) : (
                                <button className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all">
                                  <ArrowRight size={20} />
                                </button>
                              )}
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* ── Modal for Request Form ── */}
      {showRequestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { setShowRequestForm(false); setEditingRequest(null); }} />
           <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 animate-in zoom-in-95 duration-300 border border-white/20">
              <h3 className="text-4xl font-black text-slate-900 mb-2 leading-tight tracking-tight">
                {editingRequest ? "Edit Leave Request" : "New Leave Request"}
              </h3>
              <p className="text-slate-400 font-bold text-sm mb-10 tracking-widest uppercase italic">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อผลประโยชน์ของพนักงาน</p>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ประเภทการลา</label>
                     <select 
                       value={formData.type}
                       onChange={(e) => setFormData({...formData, type: e.target.value})}
                       className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-5 font-black text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all appearance-none"
                     >
                        <option value="PERSONAL_LEAVE">ลากิจ (Personal)</option>
                        <option value="SICK_LEAVE">ลาป่วย (Sick)</option>
                        <option value="ANNUAL_LEAVE">ลาพักร้อน (Vacation)</option>
                        <option value="FIELD">ลาเข้าพื้นที่ (Field Work)</option>
                     </select>
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">สิทธิคงเหลือ</label>
                     <div className="w-full bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-[1.5rem] p-5 font-black text-indigo-600 text-center text-xl">
                        --- วัน
                     </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ตั้งแต่วันที่</label>
                      <input 
                        type="date" 
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-5 font-black text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ถึงวันที่</label>
                      <input 
                        type="date" 
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-5 font-black text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all" 
                      />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">เหตุผลการลา</label>
                    <textarea 
                      rows={3} 
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-5 font-black text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all resize-none"
                      placeholder="ระบุเหตุผลในการขอลาอย่างชัดเจน..."
                    />
                 </div>

                 <div className="pt-6 flex gap-6">
                    <button 
                      type="button"
                      onClick={() => { setShowRequestForm(false); setEditingRequest(null); }}
                      className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[1.5rem] text-sm font-black hover:bg-slate-200 transition-all"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      {editingRequest ? "บันทึกการแก้ไข" : "ยืนยันการส่งคำขอ"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

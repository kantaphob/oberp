"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Users, Banknote, Search, TrendingUp, Info, 
  Settings2, Loader2, CheckCircle2, AlertCircle,
  TrendingDown, Plus, History, Calendar, FileText,
  User as UserIcon, Building2, Briefcase, ChevronRight
} from "lucide-react";
import { useToast } from "@/app/hooks/useToast";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";

interface CompensationData {
  id: string;
  username: string;
  profile?: {
    firstName: string;
    lastName: string;
    image?: string;
    startDate?: string;
  };
  role?: {
    id: string;
    name: string;
    level: number;
    startingSalary: number;
    minSalary: number;
    maxSalary: number;
  };
  employeeCompensation?: {
    id: string;
    paymentType: string;
    baseWage: number;
    fixedOtRatePerHour?: number;
    fixedAllowance: number;
    deductSso: boolean;
    deductTax: boolean;
  };
}

export default function CompensationPage() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<CompensationData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedUser, setSelectedUser] = useState<CompensationData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    paymentType: "MONTHLY",
    baseWage: "",
    fixedOtRatePerHour: "",
    fixedAllowance: "0",
    deductSso: true,
    deductTax: true,
    adjustmentReason: "",
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hrm/payroll/compensation");
      const result = await res.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      notify.error("ไม่สามารถดึงข้อมูลค่าตอบแทนได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (userId: string) => {
    try {
      const res = await fetch(`/api/hrm/payroll/compensation?userId=${userId}`);
      const result = await res.json();
      if (result.success) {
        setHistory(result.data.adjustments || []);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  const handleOpenAdjust = (user: CompensationData) => {
    setSelectedUser(user);
    setHistory([]);
    fetchHistory(user.id);
    
    // 🌟 Use Nullish Coalescing (??) to allow 0 as a valid value and correctly fallback
    const currentWage = user.employeeCompensation?.baseWage ?? user.role?.startingSalary ?? 0;
    
    setFormData({
      userId: user.id,
      paymentType: (user.employeeCompensation?.paymentType || user.role?.startingSalary) ? "MONTHLY" : "DAILY",
      baseWage: currentWage.toString(),
      fixedOtRatePerHour: (user.employeeCompensation?.fixedOtRatePerHour ?? "").toString(),
      fixedAllowance: (user.employeeCompensation?.fixedAllowance ?? 0).toString(),
      deductSso: user.employeeCompensation?.deductSso ?? true,
      deductTax: user.employeeCompensation?.deductTax ?? true,
      adjustmentReason: "",
      effectiveDate: new Date().toISOString().split('T')[0]
    });
    setShowAdjustModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setSubmitting(true);
    try {
      // 1. Update/Create Compensation
      const compRes = await fetch("/api/hrm/payroll/compensation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.userId,
          paymentType: formData.paymentType,
          baseWage: formData.baseWage,
          fixedOtRatePerHour: formData.fixedOtRatePerHour || null,
          fixedAllowance: formData.fixedAllowance,
          deductSso: formData.deductSso,
          deductTax: formData.deductTax
        })
      });
      
      const compResult = await compRes.json();
      
      if (!compResult.success) {
        throw new Error(compResult.message);
      }

      // 2. Record Adjustment if baseWage changed and we have a reason
      const oldWage = selectedUser.employeeCompensation?.baseWage || 0;
      const newWage = parseFloat(formData.baseWage);
      
      if (oldWage !== newWage && formData.adjustmentReason) {
        await fetch("/api/hrm/payroll/compensation", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: formData.userId,
            oldWage,
            newWage,
            reason: formData.adjustmentReason,
            effectiveDate: formData.effectiveDate
          })
        });
      }

      notify.success("บันทึกข้อมูลค่าตอบแทนพนักงานเรียบร้อยแล้ว");
      setShowAdjustModal(false);
      fetchData();
    } catch (error: any) {
      notify.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const name = u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.username;
      return name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [users, searchTerm]);

  const formatCurrency = (num: number) => {
    return num.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-700 space-y-10">
      
      {/* 🌟 Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100 italic">
            <TrendingUp size={14} /> Salary Management
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-5">
            Compensation <span className="text-slate-300 font-serif">&</span> Benefits
          </h1>
          <p className="text-slate-500 font-bold max-w-2xl leading-relaxed text-lg italic">
            จัดการฐานเงินเดือน ค่าตอบแทน และบันทึกประวัติการปรับเงินเดือนพนักงานตามตำแหน่งงาน (Job Roles)
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="p-5 bg-slate-900 text-white rounded-[2rem] shadow-lg shadow-slate-300">
            <Users size={32} />
          </div>
          <div className="pr-10">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Employees</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{users.length}</p>
          </div>
        </div>
      </div>

      {/* 🌟 Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:max-w-xl group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          </div>
          <input
            type="text"
            placeholder="ค้นหาพนักงาน หรือรหัสพนักงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-lg font-bold shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 italic"
          />
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl gap-2 font-black italic border-2 border-slate-100 hover:bg-slate-50">
             <History size={20} /> History
          </Button>
          <Button className="h-14 px-8 rounded-2xl gap-2 font-black italic bg-slate-900 hover:bg-emerald-600 text-white shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95">
             <Plus size={20} /> New Structure
          </Button>
        </div>
      </div>

      {/* 🌟 Employee Grid/Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 italic">
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Information</th>
              <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Job Role Default</th>
              <th className="px-6 py-8 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-right">Actual Base Wage</th>
              <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-10 py-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-32 text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto" />
                  <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Compensation Data...</p>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-32 text-center text-slate-400 italic">
                  <Banknote className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  No matching employees found.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const actual = user.employeeCompensation?.baseWage ?? 0;
                const roleDefault = user.role?.startingSalary ?? 0;
                const diff = actual - roleDefault;
                const hasComp = (user.employeeCompensation?.baseWage ?? -1) >= 0;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group italic">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 overflow-hidden text-xl shadow-inner group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                          {user.profile?.image ? (
                            <img src={user.profile.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-900 text-lg tracking-tight">
                            {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.username}
                          </h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Briefcase size={12} className="text-emerald-500" /> {user.role?.name || "No Role Assigned"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8 text-center font-bold text-slate-400">
                      <div className="inline-flex flex-col items-center">
                         <span className="text-base text-slate-500 tracking-tight">฿ {formatCurrency(roleDefault)}</span>
                         <span className="text-[10px] opacity-60 uppercase tracking-tighter">Budget Base</span>
                      </div>
                    </td>
                    <td className="px-6 py-8 text-right">
                      <div className="space-y-1">
                        <p className={`text-2xl font-black tracking-tighter ${hasComp ? 'text-slate-900' : 'text-rose-400 animate-pulse'}`}>
                          ฿ {formatCurrency(actual)}
                        </p>
                        {hasComp && diff !== 0 && (
                          <p className={`text-[10px] font-black flex items-center justify-end gap-1 ${diff > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {diff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {diff > 0 ? '+' : ''}{formatCurrency(diff)} from Role Start
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-8 text-center">
                      <Badge className={`rounded-xl px-4 py-2 font-black uppercase text-[10px] tracking-widest border-none ${hasComp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {hasComp ? 'configured' : 'missing info'}
                      </Badge>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Button 
                        onClick={() => handleOpenAdjust(user)}
                        className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                      >
                        <Settings2 size={20} />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 🌟 Adjustment Modal */}
      {showAdjustModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 italic">
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Salary Configuration</h3>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                       <UserIcon size={12} /> {selectedUser.username} <ChevronRight size={10} /> {selectedUser.profile?.firstName}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="p-3 text-slate-300 hover:text-slate-900 transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Payment Type *</label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                    className="w-full h-16 bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-black outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="MONTHLY">รายเดือน (Monthly)</option>
                    <option value="DAILY">รายวัน (Daily)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest ml-1">New Base Wage (฿) *</label>
                  <input
                    type="number"
                    required
                    value={formData.baseWage}
                    onChange={(e) => setFormData({ ...formData, baseWage: e.target.value })}
                    className="w-full h-16 bg-emerald-50 border-2 border-emerald-100 p-4 rounded-3xl font-black text-2xl text-emerald-600 outline-none focus:border-emerald-500 transition-all text-right pr-6"
                  />
                  <p className="text-[9px] text-slate-400 text-right pr-2">Recommended: ฿ {formatCurrency(selectedUser.role?.startingSalary || 0)}</p>
                </div>
              </div>

              <div className="space-y-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                 <div className="flex items-center gap-2 mb-2">
                   <AlertCircle size={16} className="text-slate-400" />
                   <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Adjustment History & Effective Info</h4>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Reason for change</label>
                      <textarea
                        value={formData.adjustmentReason}
                        onChange={(e) => setFormData({ ...formData, adjustmentReason: e.target.value })}
                        placeholder="เช่น ปรับปรุงฐานเงินเดือนตามประเมินผลงานปี 2026..."
                        className="w-full p-6 bg-white border-2 border-slate-100 rounded-3xl font-medium outline-none focus:border-emerald-500 transition-all text-sm resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Effective Date</label>
                      <input
                        type="date"
                        value={formData.effectiveDate}
                        onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                        className="w-full h-16 bg-white border-2 border-slate-100 p-4 rounded-3xl font-black outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>

                    {/* 📜 Mini History List */}
                    {history.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <History size={12} /> Recent Adjustments
                         </p>
                         <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {history.map((h, idx) => (
                              <div key={idx} className="bg-white/50 p-3 rounded-xl border border-slate-100 flex justify-between items-center group">
                                 <div>
                                    <p className="text-[10px] font-black text-slate-700">฿ {formatCurrency(h.oldWage)} → ฿ {formatCurrency(h.newWage)}</p>
                                    <p className="text-[9px] text-slate-400 italic truncate max-w-[200px]">{h.reason}</p>
                                 </div>
                                 <div className="text-right">
                                    <Badge className={`text-[8px] font-black px-2 py-0.5 rounded-md ${h.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                      {h.status}
                                    </Badge>
                                    <p className="text-[8px] text-slate-400 mt-1">{new Date(h.effectiveDate).toLocaleDateString('th-TH')}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowAdjustModal(false)}
                  className="h-16 rounded-3xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 italic"
                >
                  Cancel
                </Button>
                <Button
                  disabled={submitting}
                  className="h-16 rounded-3xl bg-slate-900 border-none hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95 italic"
                >
                  {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 size={16} className="mr-2" />}
                  Confirm & Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

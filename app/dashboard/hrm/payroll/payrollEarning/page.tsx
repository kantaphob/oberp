"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { 
  Plus, Search, Filter, MoreVertical, Trash2, Edit2, 
  Coins, UserPlus, Calendar, Info, Loader2, CheckCircle2, XCircle, Clock,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useToast } from "@/app/hooks/useToast";

interface Earning {
  id: string;
  userId: string;
  employeeName: string;
  code: string;
  amount: number;
  reason: string;
  refNumber?: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  targetMonth?: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  profile?: {
    firstName: string;
    lastName: string;
  };
}

export default function PayrollEarningPage() {
  const { notify } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // 🌟 Method 1: Sync with URL Parameters
  const searchTerm = searchParams.get("search") || "";
  const setSearchTerm = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    userId: "",
    code: "INC_BONUS", // Default code
    amount: "",
    reason: "",
    refNumber: "",
    targetMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
  });

  const earningCodes = [
    { value: "INC_BONUS", label: "เงินโบนัส (Bonus)" },
    { value: "INC_COMMISSION", label: "ค่านายหน้า (Commission)" },
    { value: "INC_INCENTIVE", label: "เบี้ยขยัน (Incentive)" },
    { value: "INC_ALLOWANCE_MOBILE", label: "ค่าโทรศัพท์ (Mobile Allowance)" },
    { value: "INC_ALLOWANCE_TRAVEL", label: "ค่าเดินทาง (Travel Allowance)" },
    { value: "INC_ALLOWANCE_HOUSING", label: "ค่าที่พัก (Housing Allowance)" },
    { value: "INC_OTHER", label: "รายได้อื่นๆ (Other)" },
  ];

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/hrm/payroll/earning");
      const result = await res.json();
      if (result.success) {
        setEarnings(result.data);
      }
    } catch (error) {
      notify.error("ไม่สามารถดึงข้อมูลรายรับได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const result = await res.json();
      if (Array.isArray(result)) {
        setUsers(result);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId) return notify.error("กรุณาเลือกพนักงาน");
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/payroll/earning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        notify.success("เพิ่มรายการรายรับสำเร็จ");
        setShowModal(false);
        setFormData({
            userId: "",
            code: "INC_BONUS",
            amount: "",
            reason: "",
            refNumber: "",
            targetMonth: new Date().toISOString().substring(0, 7),
        });
        fetchData();
      } else {
        notify.error("เกิดข้อผิดพลาด", result.message);
      }
    } catch (error) {
      notify.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบรายการนี้?")) return;
    try {
      const res = await fetch(`/api/hrm/payroll/earning?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        notify.success("ลบรายการสำเร็จ");
        fetchData();
      } else {
        notify.error("ล้มเหลว", result.message);
      }
    } catch (error) {
      notify.error("เกิดข้อผิดพลาด");
    }
  };

  const filteredEarnings = earnings.filter(item => 
    item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit"><Clock size={10}/> รอประมวลผล</span>;
      case "PAID":
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 size={10}/> จ่ายแล้ว</span>;
      case "CANCELLED":
        return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit"><XCircle size={10}/> ยกเลิก</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
               <ArrowUpRight size={28} />
             </div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tight">Earnings Management</h2>
          </div>
          <p className="text-slate-500 font-medium ml-1">บันทึกรายรับพิเศษ เบี้ยขยัน โบนัส และสวัสดิการแบบระบุคน</p>
        </div>
        
        <Button 
          onClick={() => setShowModal(true)}
          className="h-12 px-6 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95 gap-2"
        >
          <Plus size={18} /> เพิ่มรายรับพนักงาน
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-8 space-y-2">
                <p className="text-emerald-100 text-xs font-black uppercase tracking-widest">Total Pending Earnings</p>
                <h3 className="text-3xl font-black">
                    ฿ {earnings.filter(e => e.status === "PENDING").reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </h3>
                <p className="text-emerald-100/80 text-[10px] font-bold">รอการจ่ายเงินในรอบถัดไป</p>
            </CardContent>
        </Card>
        <Card className="rounded-[2rem] border border-slate-200/60 shadow-sm bg-white">
            <CardContent className="p-8 space-y-2">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Paid (This Month)</p>
                <h3 className="text-3xl font-black text-slate-900">
                   ฿ {earnings.filter(e => e.status === "PAID").reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </h3>
                <p className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                   <CheckCircle2 size={12} /> ยอดรวมที่ประมวลผลแล้ว
                </p>
            </CardContent>
        </Card>
        <Card className="rounded-[2rem] border border-slate-200/60 shadow-sm bg-white">
            <CardContent className="p-8 space-y-2">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Employee Coverage</p>
                <h3 className="text-3xl font-black text-slate-900">
                   {new Set(earnings.map(e => e.userId)).size} <span className="text-base font-bold text-slate-400">Pax</span>
                </h3>
                <p className="text-slate-500 text-[10px] font-bold">จำนวนพนักงานที่มีรายรับพิเศษ</p>
            </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อพนักงาน, เหตุผล, รหัสรายการ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-emerald-500/20 outline-none transition-all" 
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-2xl border-slate-200 h-11 px-4 gap-2 font-bold text-slate-600">
              <Filter size={16} /> Filters
           </Button>
           <Button variant="outline" className="rounded-2xl border-slate-200 h-11 px-4 gap-2 font-bold text-slate-600">
              <Calendar size={16} /> Monthly
           </Button>
        </div>
      </div>

      {/* Earnings Table/List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="text-slate-400 font-bold animate-pulse">กำลังดึงข้อมูลรายรับ...</p>
          </div>
        ) : filteredEarnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
            <div className="p-6 bg-slate-50 rounded-full border border-slate-100">
               <Coins className="w-12 h-12 text-slate-300" />
            </div>
            <div>
               <h4 className="text-lg font-black text-slate-800">ไม่พบข้อมูลรายรับ</h4>
               <p className="text-sm text-slate-500 font-medium">เริ่มต้นเพิ่มรายรับให้พนักงานโดยกดปุ่ม "เพิ่มรายรับพนักงาน"</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Employee</th>
                  <th className="px-8 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Type / Code</th>
                  <th className="px-8 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Amount</th>
                  <th className="px-8 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Period</th>
                  <th className="px-8 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-8 py-5 text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEarnings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                          {item.employeeName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-800">{item.employeeName}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Reason: {item.reason}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-700">{earningCodes.find(c => c.value === item.code)?.label || item.code}</div>
                      <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{item.refNumber || '-'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-emerald-600 text-base">฿{item.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-600">{item.targetMonth ? new Date(item.targetMonth + '-01').toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }) : '-'}</div>
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            disabled={item.status === 'PAID'}
                          >
                             <Edit2 size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDelete(item.id)}
                            disabled={item.status === 'PAID'}
                          >
                             <Trash2 size={16} />
                          </Button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: เพิ่มรายรับ */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95">
            <div className="p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <UserPlus className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">เพิ่มรายการรายรับพิเศษ</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">New Payroll Earning Entry</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">เลือกพนักงาน (Employee) *</Label>
                  <select 
                    required 
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- เลือกพนักงาน --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">ประเภทรายรับ (Type) *</Label>
                    <select 
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                    >
                      {earningCodes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">จำนวนเงิน (Amount) *</Label>
                    <Input 
                      type="number" 
                      required 
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="h-14 border-2 border-slate-200 bg-white rounded-2xl font-black text-emerald-600 text-lg focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">ประจำเดือน (Target Month)</Label>
                    <Input 
                      type="month" 
                      required
                      value={formData.targetMonth}
                      onChange={(e) => setFormData({...formData, targetMonth: e.target.value})}
                      className="h-14 border-2 border-slate-200 rounded-2xl font-bold focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">เลขอ้างอิง (Ref Number)</Label>
                    <Input 
                      placeholder="เช่น INV-001"
                      value={formData.refNumber}
                      onChange={(e) => setFormData({...formData, refNumber: e.target.value})}
                      className="h-14 border-2 border-slate-200 rounded-2xl font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">เหตุผล / รายละเอียด (Reason) *</Label>
                  <Input 
                    required 
                    placeholder="ระบุเหตุผลในการให้เงินพิเศษ"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="h-14 border-2 border-slate-200 rounded-2xl font-medium focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-100"
                  >
                    ยกเลิก
                  </Button>
                  <Button 
                    disabled={submitting}
                    className="flex-[2] h-14 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    บันทึกรายการ
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

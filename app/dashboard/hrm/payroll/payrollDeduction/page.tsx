"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  FileMinus,
  Search,
  Filter,
  Plus,
  CalendarDays,
  MoreVertical,
  AlertCircle,
  Receipt,
  HardHat,
  ShieldAlert,
  Loader2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { useToast } from "@/app/hooks/useToast";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";

interface Deduction {
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

export default function OtherDeductionsPage() {
  const { notify } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
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

  const selectedPeriod =
    searchParams.get("period") || new Date().toISOString().substring(0, 7);
  const setSelectedPeriod = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("period", val);
    } else {
      params.delete("period");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    code: "CODE1",
    amount: "",
    reason: "",
    refNumber: "",
    targetMonth: new Date().toISOString().substring(0, 7),
  });

  const deductionCodes = [
    {
      id: "CODE1",
      label: "ค่าอุปกรณ์ PPE",
      icon: HardHat,
      color: "text-blue-500",
      desc: "หักค่าอุปกรณ์ป้องกัน / ชุดยูนิฟอร์ม",
    },
    {
      id: "CODE2",
      label: "ค่าปรับ (Penalty)",
      icon: ShieldAlert,
      color: "text-rose-500",
      desc: "ค่าปรับผิดระเบียบ / ทำทรัพย์สินเสียหาย",
    },
    {
      id: "CODE3",
      label: "เงินเบิกล่วงหน้า",
      icon: Receipt,
      color: "text-amber-500",
      desc: "หักชำระคืนเงินเบิกล่วงหน้า (Advance)",
    },
  ];

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/hrm/payroll/deduction");
      const result = await res.json();
      if (result.success) {
        setDeductions(result.data);
      }
    } catch (error) {
      notify.error("ไม่สามารถดึงข้อมูลรายการหักได้");
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
      const res = await fetch("/api/hrm/payroll/deduction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        notify.success("บันทึกรายการหักเข้าสู่ระบบเรียบร้อยแล้ว");
        setShowModal(false);
        setFormData({
          userId: "",
          code: "CODE1",
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
      const res = await fetch(`/api/hrm/payroll/deduction?id=${id}`, {
        method: "DELETE",
      });
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

  const filteredDeductions = deductions.filter(
    (item) =>
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
            รอหักรอบบิล
          </span>
        );
      case "PAID":
        return (
          <span className="bg-slate-100 text-slate-400 border border-slate-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
            หักเงินแล้ว
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200">
              <FileMinus size={28} />
            </div>
            Other Deductions
          </h2>
          <p className="text-slate-500 font-medium ml-1">
            จัดการรายการหักพนักงาน ค่าปรับ หรือการชำระคืนเงินกู้
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="h-12 px-6 bg-slate-900 hover:bg-rose-600 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95 gap-2"
        >
          <Plus size={18} /> สร้างรายการหัก
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-4 shadow-sm italic">
        <AlertCircle className="text-amber-500 shrink-0 mt-1" size={24} />
        <div>
          <h4 className="font-black text-amber-800 text-lg">
            รายการหักมาตรฐาน (Deduction Codes)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {deductionCodes.map((c) => (
              <div
                key={c.id}
                className="bg-white/50 p-3 rounded-xl border border-amber-100/50"
              >
                <span className="font-black text-amber-700">{c.id}: </span>
                <span className="text-sm font-medium text-amber-600">
                  {c.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อพนักงาน หรือรายละเอียด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-rose-500/20 outline-none transition-all font-serif"
            />
          </div>
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 h-11 px-4 gap-2 font-bold text-slate-400 italic"
          >
            <Filter size={18} /> Filter
          </Button>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          <CalendarDays size={18} className="text-slate-400" />
          <input
            type="month"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-transparent font-black text-slate-700 outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
            <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">
              Loading Deductions...
            </p>
          </div>
        ) : filteredDeductions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
            <div className="p-6 bg-slate-50 rounded-full">
              <Receipt className="w-12 h-12 text-slate-300" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-800 uppercase">
                No Deductions Found
              </h4>
              <p className="text-sm text-slate-500 font-medium italic">
                คลิกปุ่มด้านบนเพื่อสร้างรายการหักเงินใหม่
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/30 border-b border-slate-100 italic">
                <tr>
                  <th className="px-8 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Date/Period
                  </th>
                  <th className="px-6 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Employee
                  </th>
                  <th className="px-6 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Code/Type
                  </th>
                  <th className="px-6 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Reason
                  </th>
                  <th className="px-6 py-5 text-right font-black text-rose-500 uppercase tracking-widest text-[10px]">
                    Amount
                  </th>
                  <th className="px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Status
                  </th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 italic">
                {filteredDeductions.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-500">
                        {new Date(row.createdAt).toLocaleDateString("th-TH")}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Budget: {row.targetMonth || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-6 font-black text-slate-800">
                      {row.employeeName}
                    </td>
                    <td className="px-6 py-6">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-widest border border-slate-200 bg-white text-slate-700`}
                      >
                        {row.code}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                        {deductionCodes.find((c) => c.id === row.code)?.label ||
                          "Other"}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-medium text-slate-700 max-w-xs">
                        {row.reason}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">
                        Ref: {row.refNumber || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-6 text-right font-black text-lg text-rose-600">
                      - ฿ {row.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-6 text-center">
                      {getStatusBadge(row.status)}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-300 hover:text-rose-600 rounded-xl"
                          onClick={() => handleDelete(row.id)}
                          disabled={row.status === "PAID"}
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-300 hover:text-slate-600 rounded-xl"
                        >
                          <MoreVertical size={18} />
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

      {/* Modal: สร้างรายการหัก */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200 italic">
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 border border-white/20 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <FileMinus className="text-rose-500" /> บันทึกรายการหักเงินใหม่
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                    พนักงานที่ถูกหักเงิน *
                  </label>
                  <select
                    required
                    value={formData.userId}
                    onChange={(e) =>
                      setFormData({ ...formData, userId: e.target.value })
                    }
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-rose-500 appearance-none cursor-pointer"
                  >
                    <option value="">-- ค้นหาและเลือกพนักงาน --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.profile
                          ? `${u.profile.firstName} ${u.profile.lastName}`
                          : u.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                    รหัสรายการ (Deduction Code) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {deductionCodes.map((code) => {
                      const Icon = code.icon;
                      const isActive = formData.code === code.id;
                      return (
                        <button
                          key={code.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, code: code.id })
                          }
                          className={`flex flex-col items-center justify-center p-5 border-2 rounded-[2rem] transition-all duration-300 gap-2
                            ${isActive ? "bg-slate-900 border-slate-900 shadow-xl text-white transform scale-105" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"}
                          `}
                        >
                          <Icon
                            size={24}
                            className={isActive ? "text-white" : code.color}
                          />
                          <div className="text-center">
                            <p className="text-[10px] font-black tracking-widest">
                              {code.id}
                            </p>
                            <p className="text-xs font-bold mt-0.5">
                              {code.label}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                    ยอดเงินที่หัก (บาท) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full bg-rose-50/30 p-4 border-2 border-rose-100 rounded-2xl font-black text-rose-600 focus:border-rose-500 outline-none transition-all text-2xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                    หักในรอบเดือน *
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.targetMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, targetMonth: e.target.value })
                    }
                    className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-black focus:border-rose-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                    เหตุผล / เลขที่อ้างอิงใบเสร็จ (Ref.)
                  </label>
                  <input
                    type="text"
                    value={formData.refNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, refNumber: e.target.value })
                    }
                    placeholder="ระบุเลขที่บิล หรือรายละเอียดเพิ่มเติม"
                    className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-black focus:border-rose-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                    สาเหตุการหักเงินโดยละเอียด *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="เช่น ชำระค่าชุดพนักงานงวดสุดท้าย..."
                    className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-medium focus:border-rose-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-16 rounded-[2rem] font-black uppercase text-xs tracking-widest text-slate-400"
                >
                  ยกเลิก
                </Button>
                <Button
                  disabled={submitting}
                  className="flex-[2] h-16 bg-slate-900 hover:bg-rose-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl transition-all"
                >
                  {submitting && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  บันทึกเข้าระบบ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  ShieldAlert,
  UserSquare2,
  Banknote,
  TrendingUp,
  History,
  Save,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Lock,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { useToast } from "@/app/hooks/useToast";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

interface Employee {
  id: string;
  username: string;
  profile?: { firstName: string; lastName: string };
  role?: {
    id: string;
    name: string;
    minSalary: number | null;
    maxSalary: number | null;
  };
}

interface CompensationData {
  paymentType: string;
  baseWage: number;
  fixedOtRatePerHour: number | null;
  fixedAllowance: number;
  deductSso: boolean;
  deductTax: boolean;
}

interface Adjustment {
  id: string;
  effectiveDate: string;
  oldWage: number;
  newWage: number;
  reason: string;
  status: string;
  approver?: {
    profile?: { firstName: string; lastName: string };
    username: string;
  };
}

export default function SalaryAdjustment() {
  const { notify } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // 🌟 Method 1: Sync with URL Parameters
  const selectedUserId = searchParams.get("userId") || "";
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<{
    id: string;
    isOpen: boolean;
  }>({ id: "", isOpen: false });

  const [compData, setCompData] = useState<CompensationData>({
    paymentType: "MONTHLY",
    baseWage: 0,
    fixedOtRatePerHour: 0,
    fixedAllowance: 0,
    deductSso: true,
    deductTax: true,
  });

  const [salaryHistory, setSalaryHistory] = useState<Adjustment[]>([]);

  const [adjustForm, setAdjustForm] = useState({
    newWage: "",
    reason: "",
    effectiveDate: new Date().toISOString().split("T")[0],
  });

  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const res = await fetch("/api/users");
      const result = await res.json();
      if (Array.isArray(result)) {
        setEmployees(result);
      } else {
        notify.error("ไม่สามารถโหลดรายชื่อพนักงานได้: ข้อมูลไม่ถูกต้อง");
      }
    } catch (e) {
      notify.error("ไม่สามารถโหลดรายชื่อพนักงานได้: เกิดข้อผิดพลาดทางเทคนิค");
    } finally {
      setLoadingEmployees(false);
    }
  }, [notify]);

  const fetchCompensation = useCallback(
    async (userId: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/hrm/payroll/compensation?userId=${userId}`,
        );
        const result = await res.json();
        if (result.success) {
          const user = employees.find((e) => e.id === userId);

          if (result.data.compensation) {
            setCompData({
              paymentType: result.data.compensation.paymentType,
              baseWage: result.data.compensation.baseWage,
              fixedOtRatePerHour:
                result.data.compensation.fixedOtRatePerHour || 0,
              fixedAllowance: result.data.compensation.fixedAllowance || 0,
              deductSso: result.data.compensation.deductSso,
              deductTax: result.data.compensation.deductTax,
            });
          } else if (user?.role) {
            // 🌟 Auto-Suggest FROM JOB ROLE
            const roleData = user.role as any;
            setCompData({
              paymentType: roleData.defaultPaymentType || "MONTHLY",
              baseWage: roleData.startingSalary || 0,
              fixedOtRatePerHour: 0,
              fixedAllowance: 0,
              deductSso: true,
              deductTax: true,
            });
            notify.success(`แนะนำการตั้งค่าตามตำแหน่ง: ${user.role.name}`);
          } else {
            // Full Reset
            setCompData({
              paymentType: "MONTHLY",
              baseWage: 0,
              fixedOtRatePerHour: 0,
              fixedAllowance: 0,
              deductSso: true,
              deductTax: true,
            });
          }
          setSalaryHistory(result.data.adjustments || []);
        } else {
          notify.error("โหลดข้อมูลล้มเหลว", result.message);
        }
      } catch (e) {
        notify.error("โหลดข้อมูลค่าตอบแทนล้มเหลว: เกิดข้อผิดพลาดทางเทคนิค");
      } finally {
        setLoading(false);
      }
    },
    [employees, notify],
  );

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (selectedUserId) {
      const user = employees.find((e) => e.id === selectedUserId);
      setSelectedUser(user || null);
      if (user) {
        fetchCompensation(selectedUserId);
      }
    } else {
      setSelectedUser(null);
      setCompData({
        paymentType: "MONTHLY",
        baseWage: 0,
        fixedOtRatePerHour: 0,
        fixedAllowance: 0,
        deductSso: true,
        deductTax: true,
      });
      setSalaryHistory([]);
    }
  }, [selectedUserId, employees, fetchCompensation]);

  const handleSaveCompensation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/payroll/compensation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...compData, userId: selectedUserId }),
      });
      const result = await res.json();
      if (result.success) {
        notify.success("บันทึกข้อมูลฐานเงินเดือนสำเร็จ");
        setIsEditing(false);
        fetchCompensation(selectedUserId);
      } else {
        notify.error("การบันทึกล้มเหลว", result.message);
      }
    } catch (e) {
      notify.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/payroll/compensation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...adjustForm,
          userId: selectedUserId,
          oldWage: compData.baseWage,
        }),
      });
      const result = await res.json();
      if (result.success) {
        notify.success("ส่งคำขอปรับเงินเดือนสำเร็จ");
        setShowAdjustModal(false);
        fetchCompensation(selectedUserId);
      } else {
        notify.error("ไม่สามารถส่งคำขอได้", result.message);
      }
    } catch (e) {
      notify.error("เกิดข้อผิดพลาดในการส่งคำขอ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (adjustmentId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/payroll/compensation/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustmentId, status: "APPROVED" }),
      });
      const result = await res.json();
      if (result.success) {
        notify.success("อนุมัติสำเร็จ ฐานเงินเดือนพนักงานถูกอัปเดตแล้ว");
        fetchCompensation(selectedUserId);
        setShowConfirmModal({ id: "", isOpen: false });
      } else {
        notify.error("การอนุมัติล้มเหลว", result.message);
      }
    } catch (e) {
      notify.error("เกิดข้อผิดพลาดทางเทคนิคในการอนุมัติ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-in fade-in duration-500 space-y-8 italic">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
              <Lock size={28} />
            </div>
            Salary Adjustment
          </h2>
          <p className="text-slate-500 font-medium ml-1">
            จัดการฐานเงินเดือน ค่าตอบแทน และประวัติการปรับเงินเดือน
          </p>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
        <ShieldAlert className="text-rose-500 shrink-0" size={24} />
        <p className="text-sm font-bold text-rose-700">
          CONFIDENTIAL: ข้อมูลในหน้านี้เป็นความลับระดับสูงสุด
          สงวนสิทธิ์การเข้าถึงเฉพาะผู้บริหารระดับสูง (Level 0-2) และ HR เท่านั้น
        </p>
      </div>

      {/* ── Employee Selection & Profile ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center shrink-0">
              {loadingEmployees ? (
                <Loader2 size={32} className="animate-spin text-indigo-500" />
              ) : (
                <Users size={32} />
              )}
            </div>
            <div className="flex-1 w-full relative">
              <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                เลือกพนักงานที่ต้องการจัดการพิกัดเงินเดือน
              </Label>
              <select
                disabled={loadingEmployees}
                value={selectedUserId}
                onChange={(e) => {
                  const val = e.target.value;
                  const params = new URLSearchParams(searchParams.toString());
                  if (val) {
                    params.set("userId", val);
                  } else {
                    params.delete("userId");
                  }
                  router.push(`${pathname}?${params.toString()}`);
                }}
                className="w-full h-14 bg-slate-50 border-2 border-slate-100 px-4 rounded-2xl font-black text-lg text-slate-900 outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">
                  {loadingEmployees ? "กำลังโหลด..." : "-- ค้นหาพนักงาน --"}
                </option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.profile
                      ? `${e.profile.firstName} ${e.profile.lastName}`
                      : e.username}
                  </option>
                ))}
              </select>
            </div>
            {selectedUser && (
              <div className="hidden md:block text-right pr-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
                  โครงสร้างตำแหน่งงาน
                </p>
                <p className="text-lg font-black text-indigo-600">
                  {selectedUser.role?.name || "ยังไม่ระบุตำแหน่ง"}
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedUser ? (
          <>
            <div className="lg:col-span-7 space-y-6">
              {/* Salary Band Indicator */}
              <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      Job Role Base (Min - Max)
                    </p>
                    <h4 className="text-xl font-black text-emerald-800">
                      ฿ {selectedUser.role?.minSalary?.toLocaleString() || "0"}{" "}
                      - ฿{" "}
                      {selectedUser.role?.maxSalary?.toLocaleString() || "0"}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-600/50 uppercase italic tracking-widest">
                    Market Status
                  </p>
                  <span className="text-xs font-black text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">
                    Competitive Band
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                  <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <Banknote className="text-emerald-500" />{" "}
                    ฐานเงินเดือนปัจจุบัน
                  </h4>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
                  >
                    {isEditing ? "ยกเลิก" : "แก้ไขการจ้างงาน"}
                  </button>
                </div>

                <form onSubmit={handleSaveCompensation} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                        ประเภทการจ้างงาน
                      </label>
                      <select
                        disabled={!isEditing}
                        value={compData.paymentType}
                        onChange={(e) =>
                          setCompData({
                            ...compData,
                            paymentType: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-black text-slate-700 outline-none disabled:bg-slate-50"
                      >
                        <option value="MONTHLY">รายเดือน (Monthly)</option>
                        <option value="DAILY">รายวัน (Daily)</option>
                        <option value="PER_PROJECT">สรุปรายก้อน</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                        {compData.paymentType === "MONTHLY"
                          ? "เงินเดือนพื้นฐาน (Base Salary)"
                          : compData.paymentType === "DAILY"
                            ? "ค่าแรงต่อวัน (Daily Rate)"
                            : "ฐานรายก้อน"}{" "}
                        *
                      </label>
                      <input
                        type="number"
                        disabled={!isEditing}
                        required
                        value={compData.baseWage}
                        onChange={(e) =>
                          setCompData({
                            ...compData,
                            baseWage: Number(e.target.value),
                          })
                        }
                        className="w-full bg-emerald-50 p-4 border-2 border-emerald-100 rounded-2xl font-black text-emerald-700 text-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                        สวัสดิการเหมาจ่าย (Fixed Allowance)
                      </label>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={compData.fixedAllowance}
                        onChange={(e) =>
                          setCompData({
                            ...compData,
                            fixedAllowance: Number(e.target.value),
                          })
                        }
                        className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-black text-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                        เรท OT ชม. ละ (Fixed OT)
                      </label>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={compData.fixedOtRatePerHour || ""}
                        onChange={(e) =>
                          setCompData({
                            ...compData,
                            fixedOtRatePerHour: Number(e.target.value),
                          })
                        }
                        placeholder="0 = คำนวณตามกฎหมาย"
                        className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-8 pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        className={`w-12 h-6 rounded-full transition-colors relative ${compData.deductSso ? "bg-indigo-500" : "bg-slate-300"}`}
                        onClick={() =>
                          isEditing &&
                          setCompData({
                            ...compData,
                            deductSso: !compData.deductSso,
                          })
                        }
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${compData.deductSso ? "translate-x-7" : "translate-x-1"}`}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        หักประกันสังคม (SSO)
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        className={`w-12 h-6 rounded-full transition-colors relative ${compData.deductTax ? "bg-indigo-500" : "bg-slate-300"}`}
                        onClick={() =>
                          isEditing &&
                          setCompData({
                            ...compData,
                            deductTax: !compData.deductTax,
                          })
                        }
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${compData.deductTax ? "translate-x-7" : "translate-x-1"}`}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        คำนวณหักภาษี (Tax)
                      </span>
                    </label>
                  </div>

                  {isEditing && (
                    <Button
                      disabled={submitting}
                      type="submit"
                      className="w-full h-16 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black shadow-lg transition-all"
                    >
                      {submitting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Save size={18} className="mr-2" />
                      )}
                      อัปเดตฐานเงินเดือนและสวัสดิการหลัก
                    </Button>
                  )}
                </form>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 min-h-[500px]">
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                  <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <History className="text-indigo-500" />{" "}
                    ประวัติการปรับเงินเดือน
                  </h4>
                </div>

                <div className="space-y-6 relative ml-4">
                  {loading ? (
                    <Loader2 className="animate-spin text-slate-200 w-10 h-10 mx-auto" />
                  ) : salaryHistory.length === 0 ? (
                    <p className="text-slate-400 text-center font-bold uppercase tracking-widest text-[10px]">
                      No salary history found
                    </p>
                  ) : (
                    salaryHistory.map((history) => (
                      <div
                        key={history.id}
                        className="relative flex items-center gap-6"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm z-10 ${history.status === "APPROVED" || history.status === "APPLIED" ? "bg-emerald-500 text-white" : "bg-amber-400 text-white"}`}
                        >
                          {history.status === "APPROVED" ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <AlertCircle size={16} />
                          )}
                        </div>
                        <div className="flex-1 bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center justify-between mb-2 font-black text-[10px] uppercase text-slate-400 tracking-widest">
                            <span>
                              <CalendarDays size={12} className="inline mr-1" />{" "}
                              {new Date(
                                history.effectiveDate,
                              ).toLocaleDateString("th-TH")}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  history.status === "APPROVED"
                                    ? "text-emerald-600"
                                    : "text-amber-500"
                                }
                              >
                                {history.status}
                              </span>
                              {history.status === "PENDING" && (
                                <button
                                  onClick={() =>
                                    setShowConfirmModal({
                                      id: history.id,
                                      isOpen: true,
                                    })
                                  }
                                  className="px-2 py-0.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-end gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-400 line-through">
                              ฿{history.oldWage.toLocaleString()}
                            </span>
                            <span className="text-lg font-black text-emerald-600">
                              ฿{history.newWage.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-600">
                            {history.reason}
                          </p>
                          {history.approver && (
                            <p className="text-[9px] font-black text-slate-400 mt-2 uppercase italic">
                              Approve:{" "}
                              {history.approver.profile
                                ? `${history.approver.profile.firstName}`
                                : history.approver.username}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setShowAdjustModal(true)}
                  className="w-full mt-8 py-4 border-2 border-dashed border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex justify-center items-center gap-2 group"
                >
                  <TrendingUp size={16} /> สร้างคำขอปรับเงินเดือน
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-12 py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-slate-400">
            <UserSquare2 size={64} className="opacity-20" />
            <p className="font-black uppercase tracking-widest">
              กรุณาเลือกพนักงานเพื่อเริ่มต้น
            </p>
          </div>
        )}
      </div>

      {/* ── Modal: ขอปรับขึ้นเงินเดือน ── */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md italic animate-in fade-in duration-200">
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 border border-white/20 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <TrendingUp className="text-indigo-500" /> เสนอปรับเงินเดือน
            </h3>

            <form onSubmit={handleRequestAdjustment} className="space-y-6">
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                  ฐานเงินเดือนปัจจุบัน
                </span>
                <span className="text-xl font-black text-slate-900 underline decoration-slate-200 underline-offset-8">
                  ฿ {compData.baseWage.toLocaleString()}
                </span>
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                  เงินเดือนใหม่ที่ต้องการเสนอ (บาท) *
                </Label>
                <Input
                  type="number"
                  required
                  value={adjustForm.newWage}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, newWage: e.target.value })
                  }
                  placeholder="฿ 0.00"
                  className="h-14 bg-emerald-50 border-2 border-emerald-100 rounded-2xl font-black text-emerald-600 text-2xl focus:border-emerald-500"
                />
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                  เหตุผลการปรับ (Reason) *
                </Label>
                <Input
                  required
                  value={adjustForm.reason}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, reason: e.target.value })
                  }
                  placeholder="ระบุเหตุผล เช่น ปรับประจำปี หรือ เลื่อนตำแหน่ง"
                  className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold italic"
                />
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                  วันที่มีผลบังคับใช้ (Effective Date) *
                </Label>
                <Input
                  type="date"
                  required
                  value={adjustForm.effectiveDate}
                  onChange={(e) =>
                    setAdjustForm({
                      ...adjustForm,
                      effectiveDate: e.target.value,
                    })
                  }
                  className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 h-16 rounded-[2rem] font-black uppercase text-xs text-slate-400"
                >
                  ยกเลิก
                </Button>
                <Button
                  disabled={submitting}
                  type="submit"
                  className="flex-[2] h-16 bg-slate-900 hover:bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "ส่งคำขอ (รออนุมัติ)"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Custom Confirmation Modal ── */}
      {showConfirmModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <button
                onClick={() => setShowConfirmModal({ id: "", isOpen: false })}
                className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2">
              ยืนยันการอนุมัติ?
            </h3>
            <p className="text-slate-500 font-medium mb-8">
              เมื่ออนุมัติแล้ว ฐานเงินเดือนของพนักงานจะถูกอัปเดตตามคำขอทันที
              รายการนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowConfirmModal({ id: "", isOpen: false })}
                className="flex-1 h-14 rounded-2xl font-black uppercase text-xs text-slate-400"
              >
                ยกเลิก
              </Button>
              <Button
                disabled={submitting}
                onClick={() => handleApprove(showConfirmModal.id)}
                className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-100"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "ยืนยันอนุมัติ"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

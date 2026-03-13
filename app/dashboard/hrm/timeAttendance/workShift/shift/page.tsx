"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  Settings,
  MoreVertical,
  Loader2,
  AlertCircle,
  CalendarX,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/app/hooks/useToast";
import { useConfirm } from "@/app/providers/ConfirmProvider";
import { useSession } from "next-auth/react";
import { SupervisorModal } from "@/app/components/Supervisor/SupervisorModal";

export default function ShiftMasterPage() {
  const { data: session } = useSession();
  const { notify } = useToast();
  const { confirm } = useConfirm();
  const [shifts, setShifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetDeleteShift, setTargetDeleteShift] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftData, setShiftData] = useState({
    name: "",
    startTime: "08:00",
    endTime: "17:00",
    lateThreshold: 15,
    otStartTime: "17:30",
    attendanceType: "ONSITE",
  });
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // ตัวแปรเช็คว่าต้องกรอกเวลาไหม? (ถ้าเป็นวันหยุด ไม่ต้องกรอก)
  const isTimeRequired = [
    "ONSITE",
    "WFH",
    "HALFDAY",
    "OVERTIME",
    "PRESENT",
    "LATE",
  ].includes(shiftData.attendanceType);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/hrm/work-shift/master");
      const result = await res.json();
      if (result.success) setShifts(result.data);
    } catch (error) {
      notify.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ถ้าระบุว่าเป็นวันหยุด และไม่มีชื่อ ให้ใช้ "OFF" เป็น Default ทั้งชื่อและโค้ด
      const finalName =
        !isTimeRequired && !shiftData.name ? "OFF" : shiftData.name;

      const payload = {
        ...shiftData,
        name: finalName,
        code: finalName, // ใช้ชื่อเป็นโค้ดไปเลยเพื่อความง่าย
        startTime: isTimeRequired ? shiftData.startTime : "-",
        endTime: isTimeRequired ? shiftData.endTime : "-",
        otStartTime: isTimeRequired ? shiftData.otStartTime : null,
      };

      const res = await fetch("/api/hrm/work-shift/master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        notify.success("สร้างกะ/วันหยุด สำเร็จ");
        setShowShiftModal(false);
        setShiftData({
          name: "",
          startTime: "08:00",
          endTime: "17:00",
          lateThreshold: 15,
          otStartTime: "17:30",
          attendanceType: "ONSITE",
        });
        fetchShifts();
      } else {
        notify.error(result.message);
      }
    } catch (error) {
      notify.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDelete = async (shift: any) => {
    setMenuOpenId(null);
    const userLevel = session?.user?.level || 999;

    // --- Scenario 1: Level 0 (Admin) -> Standard Confirm ---
    if (userLevel === 0) {
      const result = await confirm({
        title: "ยืนยันการลบกะงาน?",
        description: `คุณกำลังจะลบกะงาน "${shift.name}" ออกจากระบบ`,
        confirmLabel: "ยืนยันการลบ",
        variant: "danger",
        requireConfirmText: "ยืนยันลบ"
      });

      if (!result.confirmed) return;
      return executeDelete(shift.id);
    }

    // --- Scenario 2: Level > 0 (Non-Admin) -> Audit Staging Required ---
    setTargetDeleteShift(shift);
  };

  const executeDelete = async (shiftId: string, supervisorUsername?: string) => {
    setIsDeleting(true);
    const loadingToast = notify.info("กำลังประมวลผลการลบ...");
    try {
      // If audit is required, verify via Audit Staging first
      if (supervisorUsername) {
        const auditRes = await fetch("/api/sys/audit-staging", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "DELETE_WORK_SHIFT",
            description: `Unauthorized user attempted to delete work shift ID: ${shiftId}`,
            auth: { identifier: supervisorUsername }, // Assuming API handles just username now or we need to update API
            targetId: shiftId,
            targetModel: "WorkShift"
          })
        });
        const auditData = await auditRes.json();
        if (!auditData.success) {
          throw new Error(auditData.message);
        }
      }

      // Proceed with actual soft delete
      const res = await fetch(`/api/hrm/work-shift/master?id=${shiftId}`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supervisorUsername }) // Send username to API
      });
      const resData = await res.json();
      if (resData.success) {
        notify.success("ลบข้อมูลสำเร็จ", "ระบบได้ทำการระงับกะงานเพิ่มลงใน Activity Log เรียบร้อยแล้ว");
        setTargetDeleteShift(null);
        fetchShifts();
      } else {
        notify.error("ไม่สามารถลบได้", resData.message);
      }
    } catch (e) {
      notify.error("ลบข้อมูลไม่สำเร็จ", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (shift: any) => {
    setShiftData({
      name: shift.name,
      startTime: shift.startTime === "-" ? "08:00" : shift.startTime,
      endTime: shift.endTime === "-" ? "17:00" : shift.endTime,
      lateThreshold: shift.lateThreshold || 0,
      otStartTime: shift.otStartTime || "17:30",
      attendanceType: shift.attendanceType || "ONSITE"
    });
    setShowShiftModal(true);
    setMenuOpenId(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "WFH":
        return "bg-cyan-50 text-cyan-600 border-cyan-100";
      case "HOLIDAY":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "LEAVE":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "OVERTIME":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "HALFDAY":
        return "bg-purple-50 text-purple-600 border-purple-100";
      default:
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
    }
  };

  return (
    <div className="p-8 lg:p-10 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
            {isLoading ? (
              <div className="col-span-2 flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
              </div>
            ) : (
              <>
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className={`p-7 rounded-[2.5rem] border border-slate-200/60 shadow-sm transition-all group relative overflow-hidden ${shift.attendanceType === "HOLIDAY" ? "bg-rose-50/30" : "bg-white hover:shadow-md"}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-4 rounded-2xl ${shift.attendanceType === "HOLIDAY" ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"}`}
                        >
                          {shift.attendanceType === "HOLIDAY" ? (
                            <CalendarX size={24} />
                          ) : (
                            <Clock size={24} />
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getTypeColor(shift.attendanceType || "ONSITE")}`}
                        >
                          {shift.attendanceType || "ONSITE"}
                        </span>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => setMenuOpenId(menuOpenId === shift.id ? null : shift.id)}
                          className={`p-2 rounded-xl transition-all ${menuOpenId === shift.id ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {menuOpenId === shift.id && (
                          <div className="absolute right-0 top-12 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-200">
                             <button 
                               onClick={() => startEdit(shift)}
                               className="w-full px-5 py-3 text-left flex items-center gap-3 text-sm font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-sans"
                             >
                               <Edit size={16} /> Edit
                             </button>
                             <button 
                               onClick={() => handleDelete(shift)}
                               className="w-full px-5 py-3 text-left flex items-center gap-3 text-sm font-black text-rose-500 hover:bg-rose-50 transition-all font-sans"
                             >
                               <Trash2 size={16} /> Delete
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-xl text-slate-900 leading-tight tracking-tight">
                        {shift.name}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                        {shift.code}
                      </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between italic">
                      {shift.startTime !== "-" ? (
                        <>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                              Working Hours
                            </span>
                            <span className="text-sm font-bold text-slate-700">
                              {shift.startTime} - {shift.endTime}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                              Late Buffer
                            </span>
                            <span className="text-sm font-bold text-slate-700">
                              {shift.lateThreshold} min
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full text-center py-2 text-rose-500 font-black text-sm uppercase tracking-widest">
                          Non-Working Day
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowShiftModal(true)}
                  className="border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/10 transition-all space-y-4 group"
                >
                  <div className="p-5 bg-slate-50 rounded-[1.5rem] group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <Plus size={32} />
                  </div>
                  <span className="font-black text-sm tracking-tight uppercase">
                    เพิ่มกะ / วันหยุดใหม่
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-8">
            <h5 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-3">
              <Settings className="text-indigo-500" />
              Global Configuration
            </h5>
            <div className="space-y-4 font-bold text-slate-600 italic">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                <AlertCircle className="text-indigo-500 min-w-[24px]" />
                <span className="text-sm leading-relaxed text-slate-500 italic">
                  การตั้งค่ากะจะมีผลต่อการคำนวณมาสายและชั่วโมงทำงานของพนักงานทุกคนในโครงการ
                </span>
              </div>
              <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-center gap-4">
                <Clock className="text-amber-500 min-w-[24px]" />
                <span className="text-sm text-amber-700">
                  กะกลางปกติ: 08:00 - 17:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: สร้าง/ตั้งค่ากะการทำงาน (Master) ── */}
      {showShiftModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setShowShiftModal(false)}
          />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 italic border border-white/20">
            <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">
              เพิ่มรายการกะ / วันหยุด (Shift Settings)
            </h3>

            <form onSubmit={handleSaveShift} className="space-y-6">
              {/* 🌟 1. ส่วนเลือกประเภทการเข้างาน (Modern Toggle Pill) */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  ประเภทการเข้างาน (Attendance Type)
                </label>

                <div className="flex flex-wrap p-1.5 bg-slate-100/80 border border-slate-200 rounded-[1.5rem] w-full gap-1">
                  {[
                    { id: "ONSITE", label: "หน้าไซต์งาน" },
                    { id: "WFH", label: "Work From Home" },
                    { id: "OVERTIME", label: "ล่วงเวลา (OT)" },
                    { id: "HOLIDAY", label: "วันหยุด / Day Off" },
                  ].map((type) => {
                    const isActive = shiftData.attendanceType === type.id;
                    const isHoliday = type.id === "HOLIDAY";

                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          setShiftData({
                            ...shiftData,
                            attendanceType: type.id,
                          })
                        }
                        className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-wide
                          ${
                            isActive
                              ? isHoliday
                                ? "bg-white text-rose-600 shadow-md border border-rose-100"
                                : "bg-white text-indigo-600 shadow-md border border-slate-100"
                              : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
                          }`}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ชื่อเรียกกะงาน (แสดงตลอด) */}
              <div className="pt-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">
                  ชื่อเรียกกะงาน (Shift Name) {isTimeRequired && "*"}
                </label>
                <input
                  type="text"
                  required={isTimeRequired}
                  value={shiftData.name}
                  onChange={(e) =>
                    setShiftData({ ...shiftData, name: e.target.value })
                  }
                  placeholder={
                    isTimeRequired
                      ? "เช่น กะปกติ, กะดึก, OFF"
                      : "สามารถเว้นว่างได้ (จะเป็นชื่อวันหยุดอัตโนมัติ)"
                  }
                  className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-black outline-none text-slate-800 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* 🌟 2. Conditional Rendering Inputs (Animation สไลด์ซ้ายขวา) */}
              <div className="relative overflow-hidden pt-2">
                {isTimeRequired ? (
                  // 🟢 กรณีเลือกวันทำงาน (สไลด์มาจากซ้าย)
                  <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6 bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-50">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase text-indigo-400 mb-2 block ml-1">
                          เวลาเข้างาน *
                        </label>
                        <input
                          type="time"
                          required
                          value={shiftData.startTime}
                          onChange={(e) =>
                            setShiftData({
                              ...shiftData,
                              startTime: e.target.value,
                            })
                          }
                          className="w-full bg-white p-4 border-2 border-indigo-100/50 rounded-2xl font-black focus:border-indigo-500 transition-all outline-none text-indigo-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-indigo-400 mb-2 block ml-1">
                          เวลาเลิกงาน *
                        </label>
                        <input
                          type="time"
                          required
                          value={shiftData.endTime}
                          onChange={(e) =>
                            setShiftData({
                              ...shiftData,
                              endTime: e.target.value,
                            })
                          }
                          className="w-full bg-white p-4 border-2 border-indigo-100/50 rounded-2xl font-black focus:border-indigo-500 transition-all outline-none text-indigo-900"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase text-rose-400 mb-2 block ml-1">
                          เริ่มนับ OT (ถ้ามี)
                        </label>
                        <input
                          type="time"
                          value={shiftData.otStartTime}
                          onChange={(e) =>
                            setShiftData({
                              ...shiftData,
                              otStartTime: e.target.value,
                            })
                          }
                          className="w-full bg-white p-4 border-2 border-rose-100/50 rounded-2xl font-black text-rose-600 focus:border-rose-500 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-indigo-400 mb-2 block ml-1">
                          อนุโลมสาย (นาที)
                        </label>
                        <input
                          type="number"
                          value={shiftData.lateThreshold}
                          onChange={(e) =>
                            setShiftData({
                              ...shiftData,
                              lateThreshold: parseInt(e.target.value),
                            })
                          }
                          className="w-full bg-white p-4 border-2 border-indigo-100/50 rounded-2xl font-black focus:border-indigo-500 transition-all outline-none text-indigo-900"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // 🔴 กรณีเลือกวันหยุด (สไลด์มาจากขวา)
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="p-8 text-center border-2 border-dashed border-rose-200 bg-rose-50/50 rounded-[2rem]">
                      <CalendarX
                        size={36}
                        className="mx-auto text-rose-400 mb-4"
                      />
                      <p className="text-sm font-black text-rose-600 uppercase tracking-widest">
                        การตั้งค่าเป็นวันหยุด
                      </p>
                      <p className="text-xs font-bold text-rose-400 mt-2 italic leading-relaxed">
                        ระบบจะบันทึกการตั้งค่านี้เป็นวันหยุด (Non-Working Day)
                        <br />
                        คุณไม่จำเป็นต้องระบุเวลาเข้า-ออกงาน
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 🌟 3. Submit Button */}
              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:bg-indigo-600 hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all duration-300 active:scale-[0.98]"
                >
                  บันทึกการตั้งค่ากะ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Modal: High-Security Supervisor Audit ── */}
      <SupervisorModal 
        isOpen={!!targetDeleteShift}
        onClose={() => setTargetDeleteShift(null)}
        loading={isDeleting}
        onConfirm={async (username) => {
           await executeDelete(targetDeleteShift.id, username);
        }}
      />
    </div>
  );
}

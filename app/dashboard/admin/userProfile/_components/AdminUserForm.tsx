"use client";

/**
 * AdminUserForm — Form สำหรับ Admin จัดการผู้ใช้
 *
 * ความสามารถ:
 *   - สร้างบัญชีใหม่ (NEW): Username + Password + Profile ในขั้นตอนเดียว
 *   - เชื่อมโปรไฟล์ให้ User เดิม (EXISTING): เลือก User ที่ไม่มี Profile
 *   - แก้ไขข้อมูล (EDIT): isEdit=true
 *   - Auto-generate Username + Random Password
 *   - SupervisorModal สำหรับขออนุมัติ (ถ้าผู้ใช้ไม่ใช่ Level 0)
 *
 * API:
 *   - POST /api/users         → สร้าง User+Profile ใหม่
 *   - POST /api/users + userId → สร้าง Profile ให้ User เดิม
 *   - PUT  /api/users/{id}    → แก้ไขข้อมูล
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/app/hooks/useToast";
import { useUserForm } from "@/app/hooks/useUserForm";
import { useSupervisor } from "@/app/hooks/useSupervisor";
import { useThailandAddress } from "@/app/hooks/useThailandAddress";
import { SupervisorModal } from "@/app/components/Supervisor/SupervisorModal";
import { RoleDeptSection } from "@/app/components/UserForms/RoleDeptSection";
import { PersonalInfoSection } from "@/app/components/UserForms/PersonalInfoSection";
import { AddressSection } from "@/app/components/UserForms/AddressSection";
import { getStatusConfig } from "@/app/lib/ui-configs";
import type { JobRole, Department, User } from "@/app/generated/prisma";
import {
  Loader2, Save, ChevronLeft, Calendar, Shield,
  User as UserIcon, AlertCircle, Eye, EyeOff, Wand2, Lock, Sparkles,
} from "lucide-react";

interface AdminUserFormProps {
  initialData?: any;
  isEdit?: boolean;
  children?: React.ReactNode;
}

export function AdminUserForm({ initialData, isEdit = false, children }: AdminUserFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { notify } = useToast();
  const { isOpen, loading: supervisorLoading, openModal, closeModal, handleConfirm } = useSupervisor();

  const currentUserLevel = session?.user?.level;
  const [savingLoading, setSavingLoading] = useState(false);
  const [departments, setDepartments]       = useState<Department[]>([]);
  const [roles, setRoles]                   = useState<JobRole[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
  const [createMode, setCreateMode]         = useState<"NEW" | "EXISTING">(isEdit ? "EXISTING" : "NEW");

  // ── Shared Hook ─────────────────────────────────────────────────────────────
  const {
    formData, setFormData,
    isDirty, handleChange,
    showPassword, setShowPassword,
    isGeneratingUsername, generateUsername,
    generateRandomPassword,
  } = useUserForm({ initialData });

  // ── Thailand Address Hook ────────────────────────────────────────────────────
  const { provinces, districts, subdistricts, address, setAddressField, lookupByZipcode, zipcodeStatus } =
    useThailandAddress({
      initialValue: {
        provinceId:    initialData?.profile?.provinceId?.toString()    ?? "",
        districtId:    initialData?.profile?.districtId?.toString()    ?? "",
        subdistrictId: initialData?.profile?.subdistrictId?.toString() ?? "",
        zipcode:       initialData?.profile?.zipcode ?? "",
      },
    });

  // ── Handle change wrappers ──────────────────────────────────────────────────
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleChange(e, { unassignedUsers, roles });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddressField(e.target.name as any, e.target.value);
  };

  const handleAddressDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(p => ({ ...p, addressDetail: e.target.value }));
  };

  // ── Fetch base data ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [deptsRes, rolesRes, usersRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/jobroles"),
          !isEdit ? fetch("/api/users?noProfile=true") : Promise.resolve(null),
        ]);
        if (deptsRes.ok) setDepartments(await deptsRes.json());
        if (rolesRes.ok) setRoles(await rolesRes.json());
        if (usersRes?.ok) setUnassignedUsers(await usersRes.json());
      } catch (e) { console.error(e); }
    };
    fetchBaseData();
  }, [isEdit]);

  // ── Submit / Save ────────────────────────────────────────────────────────────
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && !isDirty) { notify.info("ไม่มีการเปลี่ยนแปลงข้อมูลที่ต้องบันทึก"); return; }
    await saveData();
  };

  const handleCancel = () => {
    if (isDirty && !confirm("คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการยกเลิกใช่หรือไม่?")) return;
    router.back();
  };

  const saveData = async (approverUsername?: string) => {
    setSavingLoading(true);
    try {
      // Validate zipcode ถ้ากรอก
      if (address.zipcode) {
        const r = await fetch(`/api/postcode/validate?zipcode=${address.zipcode}`);
        const d = await r.json();
        if (!r.ok || !d.valid) { notify.error(d.message || "รหัสไปรษณีย์ไม่ถูกต้อง"); setSavingLoading(false); return; }
      }

      const addressPayload = {
        provinceId:    address.provinceId,
        districtId:    address.districtId,
        subdistrictId: address.subdistrictId,
        zipcode:       address.zipcode,
      };

      let url: string;
      let method: string;
      let body: Record<string, any>;

      if (isEdit) {
        // EDIT: PUT /api/users/{id}
        url    = `/api/users/${initialData.id}`;
        method = "PUT";
        body   = { ...formData, ...addressPayload, approverUsername };
      } else if (createMode === "EXISTING") {
        // EXISTING: POST /api/users + userId → API สร้างแค่ Profile
        url    = "/api/users";
        method = "POST";
        body   = { ...formData, userId: formData.userId, ...addressPayload, approverUsername };
      } else {
        // NEW: POST /api/users → สร้าง User + Profile พร้อมกัน
        url    = "/api/users";
        method = "POST";
        body   = { ...formData, ...addressPayload, approverUsername };
      }

      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        notify.onSaveSuccess(data.message || (isEdit ? "อัปเดตสำเร็จ" : "บันทึกข้อมูลและสร้างพนักงานสำเร็จ"));
        closeModal();
        router.push("/dashboard/admin/userProfile");
        router.refresh();
      } else if (res.status === 403 && data.requireSupervisor) {
        openModal(async (username) => {
          await saveData(username);
        });
      } else throw new Error(data.error || "เกิดข้อผิดพลาด");
    } catch (err: any) {
      notify.onApiError(err, isEdit ? "แก้ไขข้อมูล" : "สร้างพนักงาน");
    } finally {
      setSavingLoading(false);
    }
  };

  const statusCfg = getStatusConfig(formData.status);

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto">
        <form id="admin-user-form" onSubmit={onSubmit}>

          {/* ── Page Header ──────────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-6">
            <button type="button" onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm">
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {isEdit ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มข้อมูลพนักงานใหม่"}
              </h1>
              <p className="text-[12px] text-slate-400 mt-0.5">
                {isEdit ? `แก้ไขโปรไฟล์ · @${formData.username}` : "กรอกข้อมูลพนักงานและที่อยู่ให้ครบถ้วน"}
              </p>
            </div>
            {isDirty && (
              <span className="ml-auto px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                ● มีการเปลี่ยนแปลง
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Col 1: Role/Dept + Account ───────────────────── */}
            <div className="space-y-5">

              {/* 1. ตำแหน่งและสังกัด (มาก่อน เพื่อ Auto-gen Username ได้ทันที) */}
              <RoleDeptSection
                roleId={formData.roleId}
                departmentId={formData.departmentId}
                roles={roles}
                departments={departments}
                onChange={handleFormChange}
                readOnly={isEdit && currentUserLevel !== 0}
              />

              {/* 2. Account Card */}
              <div className="pf-glass pf-card">
                <div className="pf-card-header">
                  <p className="pf-section-title">
                    <Shield size={12} className="text-slate-400" />
                    {isEdit ? "บัญชีผู้ใช้" : "การจัดการบัญชี"}
                  </p>
                </div>
                <div className="pf-card-body space-y-4">

                  {/* Mode Toggle (Create only) */}
                  {!isEdit && (
                    <div className="flex p-1 bg-slate-100/80 rounded-xl">
                      <button type="button"
                        onClick={() => { setCreateMode("NEW"); setFormData(p => ({ ...p, userId: "" })); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold rounded-lg transition-all ${createMode === "NEW" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        <Sparkles size={13} /> สร้างบัญชีใหม่
                      </button>
                      <button type="button"
                        onClick={() => setCreateMode("EXISTING")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold rounded-lg transition-all ${createMode === "EXISTING" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        <UserIcon size={13} /> เลือกจากระบบ
                      </button>
                    </div>
                  )}

                  {/* EXISTING: เลือก User ที่ไม่มี Profile */}
                  {!isEdit && createMode === "EXISTING" && (
                    <div className="pf-field">
                      <label className="pf-label">รายชื่อพนักงาน <span className="text-red-500">*</span></label>
                      <select name="userId" value={formData.userId} onChange={handleFormChange} required className="pf-input">
                        <option value="">— กรุณาเลือกพนักงาน —</option>
                        {unassignedUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.username}{(u as any).email ? ` · ${(u as any).email}` : ""}</option>
                        ))}
                      </select>
                      {unassignedUsers.length === 0 && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                          <p className="text-[11px] text-amber-700 font-bold flex items-center gap-2 mb-1">
                            <AlertCircle size={13} /> ไม่พบพนักงานที่ยังไม่มีข้อมูลประวัติ
                          </p>
                          <p className="text-[10px] text-amber-600">
                            เปลี่ยนเป็นโหมด &quot;สร้างบัญชีใหม่&quot; เพื่อเพิ่มบุคลากรใหม่ได้ทันที
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Username */}
                  {(isEdit || createMode === "NEW" || (createMode === "EXISTING" && formData.userId)) && (
                    <>
                      <div className="pf-field">
                        <label className="pf-label">Username <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <UserIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              name="username" value={formData.username} onChange={handleFormChange}
                              required disabled={isEdit || createMode === "EXISTING"}
                              className={`pf-input pl-8 ${isEdit || createMode === "EXISTING" ? "bg-slate-100 font-bold text-slate-500" : ""}`}
                              placeholder="กรุณากด Auto"
                            />
                          </div>
                          {!isEdit && createMode === "NEW" && (
                            <button type="button" onClick={() => generateUsername(formData.roleId)}
                              disabled={isGeneratingUsername || !formData.roleId}
                              className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${!formData.roleId ? "bg-slate-50 text-slate-300 pointer-events-none" : "bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100"}`}>
                              {isGeneratingUsername ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                              Auto
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Password (NEW mode only) */}
                      {!isEdit && createMode === "NEW" && (
                        <div className="pf-field">
                          <label className="pf-label">Password <span className="text-red-500">*</span></label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input name="password" type={showPassword ? "text" : "password"}
                                value={formData.password} onChange={handleFormChange} required className="pf-input pl-8" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                            <button type="button" onClick={generateRandomPassword}
                              className="px-3 py-2 rounded-xl border bg-slate-50 border-slate-200 text-slate-600 text-[10px] font-bold uppercase hover:bg-slate-100 transition-all flex items-center gap-1.5">
                              <Sparkles size={12} /> Random
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Status */}
                  <div className="pf-field">
                    <label className="pf-label">สถานะบัญชี</label>
                    <select name="status" value={formData.status} onChange={handleFormChange} className="pf-input">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                    <div className="mt-2">
                      <span className="pf-badge" style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, color: statusCfg.text }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Email (Edit only) */}
                  {isEdit && formData.email && (
                    <div className="pf-field">
                      <label className="pf-label">Email</label>
                      <input name="email" type="email" value={formData.email} onChange={handleFormChange} className="pf-input" />
                    </div>
                  )}

                  {/* วันที่เริ่มงาน */}
                  <div className="pf-field">
                    <label className="pf-label">วันที่เริ่มงาน <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input name="startDate" type="date" value={formData.startDate} onChange={handleFormChange} required className="pf-input pl-8" />
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* ── Col 2-3: Personal Info + Address ─────────────── */}
            <div className="lg:col-span-2 space-y-5">
              <PersonalInfoSection data={formData} onChange={handleFormChange} />
              <AddressSection
                address={address}
                provinces={provinces}
                districts={districts}
                subdistricts={subdistricts}
                zipcodeStatus={zipcodeStatus}
                addressDetail={formData.addressDetail}
                onAddressChange={handleAddressChange}
                onAddressDetailChange={handleAddressDetailChange}
                onZipcodeChange={(zip) => { setAddressField("zipcode", zip); lookupByZipcode(zip); }}
              />
            </div>

          </div>

          {/* ── Footer Actions ─────────────────────────────────── */}
          <div className="flex items-center justify-between pt-5 mt-2 border-t border-slate-100">
            <button type="button" onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
              ยกเลิก
            </button>
            <button type="submit" form="admin-user-form" disabled={savingLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60 transition-all shadow-md shadow-orange-600/25">
              {savingLoading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {savingLoading ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้างข้อมูลพนักงาน"}
            </button>
          </div>

        </form>
        {children}
      </div>

      <SupervisorModal isOpen={isOpen} onClose={closeModal} onConfirm={handleConfirm} loading={supervisorLoading} />
    </>
  );
}

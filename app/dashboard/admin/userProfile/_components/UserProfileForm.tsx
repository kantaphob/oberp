"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/app/hooks/useToast";
import { User, JobRole, Department } from "@/app/generated/prisma";
import { useSupervisor } from "@/app/hooks/useSupervisor";
import { SupervisorModal } from "@/app/components/Supervisor/SupervisorModal";
import { useThailandAddress } from "@/app/hooks/useThailandAddress";
import {
  Loader2,
  Save,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Search,
  User as UserIcon,
  MapPin,
  Briefcase,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  Building2,
  Network,
  Wand2,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Sparkles,
} from "lucide-react";
import { getLevelColor, getStatusConfig } from "@/app/lib/ui-configs";

interface UserProfileFormProps {
  initialData?: any;
  isEdit?: boolean;
  children?: React.ReactNode;
}

export function UserProfileForm({
  initialData,
  isEdit = false,
  children,
}: UserProfileFormProps) {
  const router = useRouter();
  const {
    isOpen,
    loading: supervisorLoading,
    openModal,
    closeModal,
    handleConfirm,
  } = useSupervisor();
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);

  const {
    provinces,
    districts,
    subdistricts,
    address,
    setAddressField,
    lookupByZipcode,
    setFullAddress,
    zipcodeStatus,
  } = useThailandAddress({
    initialValue: {
      provinceId: initialData?.profile?.provinceId?.toString() ?? "",
      districtId: initialData?.profile?.districtId?.toString() ?? "",
      subdistrictId: initialData?.profile?.subdistrictId?.toString() ?? "",
      zipcode: initialData?.profile?.zipcode ?? "",
    },
  });

  const formatDate = (d?: string | Date) => {
    if (!d) return "";
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const [formData, setFormData] = useState({
    userId: initialData?.id || "",
    username: initialData?.username || "",
    email: initialData?.email || "",
    password: "",
    status: initialData?.status || "ACTIVE",
    roleId: initialData?.roleId || "",
    firstName: initialData?.profile?.firstName || "",
    lastName: initialData?.profile?.lastName || "",
    taxId: initialData?.profile?.taxId || "",
    telephoneNumber: initialData?.profile?.telephoneNumber || "",
    lineId: initialData?.profile?.lineId || "",
    addressDetail: initialData?.profile?.addressDetail || "",
    departmentId:
      initialData?.profile?.departmentId ||
      initialData?.role?.departmentId ||
      "",
    gender: initialData?.profile?.gender || "",
    nationality: initialData?.profile?.nationality || "",
    birthDate: formatDate(initialData?.profile?.birthDate),
    startDate:
      formatDate(initialData?.profile?.startDate) || formatDate(new Date()),
  });

  const [createMode, setCreateMode] = useState<"NEW" | "EXISTING">(
    initialData?.id ? "EXISTING" : "NEW",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);

  const [initialValues] = useState({ ...formData });
  const [initialAddress] = useState({ ...address });

  const isDirty =
    JSON.stringify(formData) !== JSON.stringify(initialValues) ||
    JSON.stringify(address) !== JSON.stringify(initialAddress);

  useEffect(() => {
    fetchBaseData();
  }, []);

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
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "userId") {
      const u = unassignedUsers.find((u) => u.id === value) as any;
      setFormData((p) => ({
        ...p,
        userId: value,
        username: u?.username || "",
        email: u?.email || "",
        roleId: u?.roleId || p.roleId,
        departmentId: u?.role?.departmentId || p.departmentId,
      }));
    } else if (name === "roleId") {
      const r = roles.find((r) => r.id === value);
      setFormData((p) => ({
        ...p,
        roleId: value,
        departmentId: r?.departmentId || p.departmentId,
      }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const generateUsername = async () => {
    if (!formData.roleId) {
      notify.error("กรุณาเลือกตำแหน่ง (Role) ก่อนสร้าง Username");
      return;
    }
    setIsGeneratingUsername(true);
    try {
      const res = await fetch(
        `/api/users/generate-username?roleId=${formData.roleId}`,
      );
      const data = await res.json();
      if (res.ok) {
        setFormData((p) => ({ ...p, username: data.username }));
      } else {
        notify.error(data.error || "ไม่สามารถสร้างรหัสได้");
      }
    } catch {
      notify.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsGeneratingUsername(false);
    }
  };

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = Math.floor(Math.random() * 3) + 7; // 7 to 9 chars
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((p) => ({ ...p, password: newPassword }));
    setShowPassword(true);
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setAddressField(e.target.name as any, e.target.value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && !isDirty) {
      notify.info("ไม่มีการเปลี่ยนแปลงข้อมูลที่ต้องบันทึก");
      return;
    }
    openModal(async (supervisorUsername) => {
      saveData(supervisorUsername);
    });
  };

  const handleCancel = () => {
    if (
      isDirty &&
      !confirm("คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการยกเลิกใช่หรือไม่?")
    )
      return;
    router.back();
  };

  const saveData = async (approverUsername?: string) => {
    setLoading(true);
    try {
      if (address.zipcode) {
        const r = await fetch(
          `/api/postcode/validate?zipcode=${address.zipcode}`,
        );
        const d = await r.json();
        if (!r.ok || !d.valid) {
          notify.error(d.message || "รหัสไปรษณีย์ไม่ถูกต้อง");
          setLoading(false);
          return;
        }
      }
      // โหมด EDIT: PUT /api/users/{id}
      // โหมด EXISTING: POST /api/users พร้อม userId ใน body → API จะสร้าง Profile ให้ User ที่มีอยู่
      // โหมด NEW: POST /api/users → สร้าง User + Profile ใหม่พร้อมกัน
      let url: string;
      let method: string;
      let bodyPayload: Record<string, any>;

      if (isEdit) {
        url = `/api/users/${initialData.id}`;
        method = "PUT";
        bodyPayload = {
          ...formData,
          provinceId: address.provinceId,
          districtId: address.districtId,
          subdistrictId: address.subdistrictId,
          zipcode: address.zipcode,
          approverUsername,
        };
      } else if (createMode === "EXISTING") {
        // ส่ง POST ไปที่ /api/users พร้อม userId → API จะสร้าง Profile ให้ User ที่เลือก
        url = "/api/users";
        method = "POST";
        bodyPayload = {
          ...formData,
          userId: formData.userId,
          provinceId: address.provinceId,
          districtId: address.districtId,
          subdistrictId: address.subdistrictId,
          zipcode: address.zipcode,
          approverUsername,
        };
      } else {
        // NEW mode: สร้าง User + Profile ใหม่
        url = "/api/users";
        method = "POST";
        bodyPayload = {
          ...formData,
          provinceId: address.provinceId,
          districtId: address.districtId,
          subdistrictId: address.subdistrictId,
          zipcode: address.zipcode,
          approverUsername,
        };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (res.ok) {
        notify.onSaveSuccess(
          data.message ||
            (isEdit ? "อัปเดตสำเร็จ" : "บันทึกข้อมูลและสร้างพนักงานสำเร็จ"),
        );
        router.push("/dashboard/admin/userProfile");
        router.refresh();
      } else throw new Error(data.error || "เกิดข้อผิดพลาด");
    } catch (err: any) {
      notify.onApiError(err, isEdit ? "แก้ไขข้อมูล" : "สร้างพนักงาน");
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find((r) => r.id === formData.roleId);
  const levelCfg = selectedRole ? getLevelColor(selectedRole.level) : null;
  const statusCfg = getStatusConfig(formData.status);

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto">
        <form id="user-profile-form" onSubmit={onSubmit}>
          {/* ── Page Header ─────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {isEdit ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มข้อมูลพนักงานใหม่"}
              </h1>
              <p className="text-[12px] text-slate-400 mt-0.5">
                {isEdit
                  ? `แก้ไขโปรไฟล์ · @${formData.username}`
                  : "กรอกข้อมูลพนักงานและที่อยู่ให้ครบถ้วน"}
              </p>
            </div>
            {isDirty && (
              <span className="ml-auto px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                ● มีการเปลี่ยนแปลง
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* ── Col 1: Account + Role ────────────────────── */}
            <div className="space-y-5">
              {/* Role & Dept Card */}
              <div className="pf-glass pf-card">
                <div className="pf-card-header">
                  <p className="pf-section-title">
                    <Network size={12} className="text-slate-400" />
                    ตำแหน่งและสังกัด
                  </p>
                </div>
                <div className="pf-card-body space-y-4">
                  <div className="pf-field">
                    <label className="pf-label">
                      แผนก (Department) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <select
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleChange}
                        required
                        className="pf-input pl-8"
                      >
                        <option value="">— เลือกแผนก —</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pf-field">
                    <label className="pf-label">
                      ตำแหน่ง (Job Role) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleChange}
                      required
                      className="pf-input"
                    >
                      <option value="">— เลือกตำแหน่ง —</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          [LV.{r.level}] {r.name}
                        </option>
                      ))}
                    </select>

                    {/* Role preview badge */}
                    {selectedRole && levelCfg && (
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className="pf-badge"
                          style={{
                            background: levelCfg.bg,
                            border: `1px solid ${levelCfg.border}`,
                            color: levelCfg.text,
                          }}
                        >
                          LV.{selectedRole.level}
                        </span>
                        <span className="text-[12px] font-semibold text-slate-700">
                          {selectedRole.name}
                        </span>
                        <span className="ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                          {selectedRole.prefix}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Account Card */}
              <div className="pf-glass pf-card">
                <div className="pf-card-header">
                  <p className="pf-section-title">
                    <Shield size={12} className="text-slate-400" />
                    {isEdit ? "บัญชีผู้ใช้" : "เลือกพนักงาน"}
                  </p>
                </div>
                <div className="pf-card-body space-y-4">
                  {!isEdit && (
                    <div className="flex p-1 bg-slate-100/80 rounded-xl mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCreateMode("NEW");
                          setFormData((p) => ({ ...p, userId: "" }));
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold rounded-lg transition-all ${createMode === "NEW" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        <Sparkles size={13} /> สร้างบัญชีใหม่
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateMode("EXISTING")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold rounded-lg transition-all ${createMode === "EXISTING" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        <UserIcon size={13} /> เลือกจากระบบ
                      </button>
                    </div>
                  )}

                  {!isEdit && createMode === "EXISTING" && (
                    <div className="pf-field">
                      <label className="pf-label">
                        รายชื่อพนักงาน <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        required
                        className="pf-input"
                      >
                        <option value="">— กรุณาเลือกพนักงาน —</option>
                        {unassignedUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.username}
                            {(u as any).email ? ` · ${(u as any).email}` : ""}
                          </option>
                        ))}
                      </select>
                      {unassignedUsers.length === 0 && (
                        <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                          <p className="text-[11px] text-amber-700 font-bold flex items-center gap-2 mb-2">
                            <AlertCircle size={14} />{" "}
                            ไม่พบพนักงานที่ยังไม่มีข้อมูลประวัติ
                          </p>
                          <p className="text-[10px] text-amber-600 leading-relaxed">
                            พนักงานทุกคนในระบบมีข้อมูลประวัติครบถ้วนแล้ว
                            คุณสามารถเลือกโหมด "สร้างบัญชีใหม่"
                            เพื่อเพิ่มบุคลากรคนใหม่เข้าสู่ระบบได้ทันที
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {(isEdit ||
                    createMode === "NEW" ||
                    (createMode === "EXISTING" && formData.userId)) && (
                    <>
                      {/* Account Info (New or Edit) */}
                      <div className="pf-field">
                        <label className="pf-label">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <UserIcon
                              size={13}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              required
                              disabled={isEdit || createMode === "EXISTING"}
                              className={`pf-input pl-8 ${isEdit || createMode === "EXISTING" ? "bg-slate-100 font-bold text-slate-500" : ""}`}
                              placeholder="กรุณากด Generate"
                            />
                          </div>
                          {!isEdit && createMode === "NEW" && (
                            <button
                              type="button"
                              onClick={generateUsername}
                              disabled={
                                isGeneratingUsername || !formData.roleId
                              }
                              className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${!formData.roleId ? "bg-slate-50 text-slate-300 pointer-events-none" : "bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100"}`}
                            >
                              {isGeneratingUsername ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Wand2 size={12} />
                              )}
                              Auto
                            </button>
                          )}
                        </div>
                      </div>

                      {!isEdit && createMode === "NEW" && (
                        <div className="pf-field">
                          <label className="pf-label">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Lock
                                size={13}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                              <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="pf-input pl-8"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showPassword ? (
                                  <EyeOff size={14} />
                                ) : (
                                  <Eye size={14} />
                                )}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={generateRandomPassword}
                              className="px-3 py-2 rounded-xl border bg-slate-50 border-slate-200 text-slate-600 text-[10px] font-bold uppercase hover:bg-slate-100 transition-all flex items-center gap-1.5"
                            >
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
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="pf-input"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                    <div className="mt-2">
                      <span
                        className="pf-badge"
                        style={{
                          background: statusCfg.bg,
                          border: `1px solid ${statusCfg.border}`,
                          color: statusCfg.text,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: statusCfg.dot }}
                        />
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {isEdit && formData.email && (
                    <div className="pf-field">
                      <label className="pf-label">Email</label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pf-input"
                      />
                    </div>
                  )}

                  <div className="pf-field">
                    <label className="pf-label">
                      วันที่เริ่มงาน <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="pf-input pl-8"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Col 2-3: Personal Info ───────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Personal Info */}
              <div className="pf-glass pf-card">
                <div className="pf-card-header">
                  <p className="pf-section-title">
                    <UserIcon size={12} className="text-slate-400" />
                    ข้อมูลส่วนตัว
                  </p>
                </div>
                <div className="pf-card-body space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="pf-field">
                      <label className="pf-label">
                        ชื่อจริง <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="pf-input"
                        placeholder="ชื่อจริง"
                      />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">
                        นามสกุล <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="pf-input"
                        placeholder="นามสกุล"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="pf-field">
                      <label className="pf-label">
                        เลขบัตรประชาชน (13 หลัก){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          name="taxId"
                          value={formData.taxId}
                          onChange={handleChange}
                          maxLength={13}
                          required
                          className="pf-input pl-8"
                          placeholder="x-xxxx-xxxxx-xx-x"
                        />
                      </div>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">
                        เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          name="telephoneNumber"
                          value={formData.telephoneNumber}
                          onChange={handleChange}
                          maxLength={10}
                          required
                          className="pf-input pl-8"
                          placeholder="0xx-xxx-xxxx"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="pf-field">
                      <label className="pf-label">เพศ</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="pf-input"
                      >
                        <option value="">— ระบุเพศ —</option>
                        <option value="MALE">ชาย</option>
                        <option value="FEMALE">หญิง</option>
                        <option value="OTHER">อื่นๆ</option>
                      </select>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">วันเกิด</label>
                      <input
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="pf-input"
                      />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">สัญชาติ</label>
                      <input
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="pf-input"
                        placeholder="ไทย"
                      />
                    </div>
                  </div>

                  <div className="pf-field">
                    <label className="pf-label">Line ID</label>
                    <input
                      name="lineId"
                      value={formData.lineId}
                      onChange={handleChange}
                      className="pf-input"
                      placeholder="@lineid"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="pf-glass pf-card">
                <div className="pf-card-header">
                  <p className="pf-section-title">
                    <MapPin size={12} className="text-slate-400" />
                    ที่อยู่
                  </p>
                </div>
                <div className="pf-card-body space-y-4">
                  <div className="pf-field">
                    <label className="pf-label">
                      เลขที่, หมู่, ถนน <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="addressDetail"
                      value={formData.addressDetail}
                      onChange={handleChange}
                      required
                      className="pf-input"
                      placeholder="เช่น 123 หมู่ 4 ถนนสุขุมวิท"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="pf-field">
                      <label className="pf-label">
                        จังหวัด <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="provinceId"
                        value={address.provinceId}
                        onChange={handleAddressChange}
                        required
                        className="pf-input pf-select-addr"
                      >
                        <option value="">— เลือกจังหวัด —</option>
                        {provinces.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nameTh}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">
                        อำเภอ/เขต <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="districtId"
                        value={address.districtId}
                        onChange={handleAddressChange}
                        required
                        disabled={!address.provinceId}
                        className="pf-input pf-select-addr"
                      >
                        <option value="">— เลือกอำเภอ —</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nameTh}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="pf-field">
                      <label className="pf-label">
                        ตำบล/แขวง <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subdistrictId"
                        value={address.subdistrictId}
                        onChange={handleAddressChange}
                        required
                        disabled={!address.districtId}
                        className="pf-input pf-select-addr"
                      >
                        <option value="">— เลือกตำบล —</option>
                        {subdistricts.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nameTh}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">รหัสไปรษณีย์</label>
                      <div className="relative">
                        <input
                          name="zipcode"
                          maxLength={5}
                          placeholder="เช่น 10110"
                          value={address.zipcode}
                          onChange={(e) => {
                            const zip = e.target.value.replace(/\D/g, "");
                            setAddressField("zipcode", zip);
                            lookupByZipcode(zip);
                          }}
                          className={`pf-input pr-9 ${zipcodeStatus === "found_single" ? "zipcode-ok" : zipcodeStatus === "not_found" || zipcodeStatus === "error" ? "zipcode-err" : ""}`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {zipcodeStatus === "loading" && (
                            <Loader2
                              size={14}
                              className="animate-spin text-slate-400"
                            />
                          )}
                          {(zipcodeStatus === "found_single" ||
                            zipcodeStatus === "found_multi") && (
                            <CheckCircle size={14} className="text-green-500" />
                          )}
                          {(zipcodeStatus === "not_found" ||
                            zipcodeStatus === "error") && (
                            <AlertCircle size={14} className="text-red-400" />
                          )}
                        </div>
                      </div>
                      {zipcodeStatus === "found_single" && (
                        <p className="text-[10px] text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                          <CheckCircle size={10} /> กรอกที่อยู่อัตโนมัติแล้ว
                        </p>
                      )}
                      {zipcodeStatus === "found_multi" && (
                        <p className="text-[10px] text-amber-600 font-semibold mt-1.5 flex items-center gap-1">
                          <Search size={10} /> พบหลายตำบล — กรุณาเลือก
                        </p>
                      )}
                      {zipcodeStatus === "not_found" && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                          <AlertCircle size={10} /> ไม่พบรหัสไปรษณีย์นี้
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer Actions ───────────────────────────── */}
          <div className="flex items-center justify-between pt-5 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              form="user-profile-form"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-md shadow-indigo-600/25"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {loading
                ? "กำลังบันทึก..."
                : isEdit
                  ? "บันทึกการแก้ไข"
                  : "สร้างข้อมูลพนักงาน"}
            </button>
          </div>
        </form>

        {children}
      </div>

      <SupervisorModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        loading={supervisorLoading}
      />
    </>
  );
}

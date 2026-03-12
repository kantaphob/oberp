/**
 * useUserForm — Shared Hook for User + Profile Form State
 *
 * ใช้งาน:
 *   ทุก Form (Admin, HRM, Portal) ดึง Hook นี้ไปใช้จัดการ State
 *   แต่ละ Form เขียน onSubmit + API call ของตัวเองแยกกัน
 *
 * ฟีเจอร์:
 *   - Form state + handleChange
 *   - generateUsername (auto-gen จาก roleId)
 *   - generateRandomPassword
 *   - showPassword toggle
 *   - isDirty detection
 */

"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/app/hooks/useToast";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserFormData {
  userId: string;
  username: string;
  email: string;
  password: string;
  status: string;
  roleId: string;
  firstName: string;
  lastName: string;
  taxId: string;
  telephoneNumber: string;
  lineId: string;
  addressDetail: string;
  departmentId: string;
  gender: string;
  nationality: string;
  birthDate: string;
  startDate: string;
}

export interface UseUserFormOptions {
  initialData?: any;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatDate(d?: string | Date): string {
  if (!d) return "";
  try { return new Date(d).toISOString().split("T")[0]; } catch { return ""; }
}

export function buildInitialFormData(initialData?: any): UserFormData {
  return {
    userId:          initialData?.id                    || "",
    username:        initialData?.username              || "",
    email:           initialData?.email                 || "",
    password:        "",
    status:          initialData?.status                || "ACTIVE",
    roleId:          initialData?.roleId                || "",
    firstName:       initialData?.profile?.firstName    || "",
    lastName:        initialData?.profile?.lastName     || "",
    taxId:           initialData?.profile?.taxId        || "",
    telephoneNumber: initialData?.profile?.telephoneNumber || "",
    lineId:          initialData?.profile?.lineId       || "",
    addressDetail:   initialData?.profile?.addressDetail || "",
    departmentId:    initialData?.profile?.departmentId || initialData?.role?.departmentId || "",
    gender:          initialData?.profile?.gender       || "",
    nationality:     initialData?.profile?.nationality  || "",
    birthDate:       formatDate(initialData?.profile?.birthDate),
    startDate:       formatDate(initialData?.profile?.startDate) || formatDate(new Date()),
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useUserForm(options: UseUserFormOptions = {}) {
  const { initialData } = options;
  const { notify } = useToast();

  const [formData, setFormData] = useState<UserFormData>(() => buildInitialFormData(initialData));
  const [initialValues] = useState<UserFormData>(() => buildInitialFormData(initialData));

  const [showPassword, setShowPassword]           = useState(false);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);

  // ── isDirty ─────────────────────────────────────────────────────────────────
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialValues);

  // ── handleChange ─────────────────────────────────────────────────────────────
  // สำหรับ userId: auto-fill username/email/role/dept จาก user ที่เลือก
  // สำหรับ roleId: auto-fill departmentId
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
      extraData?: { unassignedUsers?: any[]; roles?: any[] }
    ) => {
      const { name, value } = e.target;

      if (name === "userId" && extraData?.unassignedUsers) {
        const u = extraData.unassignedUsers.find((u: any) => u.id === value) as any;
        setFormData(p => ({
          ...p,
          userId:       value,
          username:     u?.username     || "",
          email:        u?.email        || "",
          roleId:       u?.roleId       || p.roleId,
          departmentId: u?.role?.departmentId || p.departmentId,
        }));
      } else if (name === "roleId" && extraData?.roles) {
        const r = extraData.roles.find((r: any) => r.id === value);
        setFormData(p => ({ ...p, roleId: value, departmentId: r?.departmentId || p.departmentId }));
      } else {
        setFormData(p => ({ ...p, [name]: value }));
      }
    },
    []
  );

  // ── generateUsername ─────────────────────────────────────────────────────────
  const generateUsername = useCallback(async (roleId?: string) => {
    const targetRoleId = roleId || formData.roleId;
    if (!targetRoleId) {
      notify.error("กรุณาเลือกตำแหน่ง (Role) ก่อนสร้าง Username");
      return;
    }
    setIsGeneratingUsername(true);
    try {
      const res  = await fetch(`/api/users/generate-username?roleId=${targetRoleId}`);
      const data = await res.json();
      if (res.ok) {
        setFormData(p => ({ ...p, username: data.username }));
      } else {
        notify.error(data.error || "ไม่สามารถสร้างรหัสได้");
      }
    } catch {
      notify.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsGeneratingUsername(false);
    }
  }, [formData.roleId, notify]);

  // ── generateRandomPassword ───────────────────────────────────────────────────
  const generateRandomPassword = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = Math.floor(Math.random() * 3) + 7; // 7–9 chars
    let pwd = "";
    for (let i = 0; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(p => ({ ...p, password: pwd }));
    setShowPassword(true);
  }, []);

  return {
    formData,
    setFormData,
    initialValues,
    isDirty,
    handleChange,
    showPassword,
    setShowPassword,
    isGeneratingUsername,
    generateUsername,
    generateRandomPassword,
  };
}

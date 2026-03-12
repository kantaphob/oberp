"use client";

/**
 * PersonalInfoSection — Shared UI Component
 *
 * แสดงฟิลด์ข้อมูลส่วนตัว: ชื่อ, นามสกุล, เลขบัตรฯ, เบอร์โทร, เพศ, วันเกิด, สัญชาติ, Line ID
 * ใช้ร่วมกันได้ทุก Form (Admin, HRM, Portal)
 *
 * Props:
 *   - data:      UserFormData จาก useUserForm
 *   - onChange:  handleChange จาก useUserForm (ส่ง extraData ถ้าต้องการ)
 *   - readOnly?  ถ้า true ฟิลด์บางเค้าจะ disabled (เช่น Portal ไม่ให้แก้ TaxID)
 */

import React from "react";
import { User as UserIcon, CreditCard, Phone } from "lucide-react";
import type { UserFormData } from "@/app/hooks/useUserForm";

interface PersonalInfoSectionProps {
  data: UserFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  /** ถ้า true = ล็อคฟิลด์ TaxID (เช่น Portal Self-service) */
  lockTaxId?: boolean;
  /** ถ้า true = ฟิลด์ทั้งหมดอ่านอย่างเดียว */
  readOnly?: boolean;
}

export function PersonalInfoSection({ data, onChange, lockTaxId = false, readOnly = false }: PersonalInfoSectionProps) {
  return (
    <div className="pf-glass pf-card">
      <div className="pf-card-header">
        <p className="pf-section-title">
          <UserIcon size={12} className="text-slate-400" />
          ข้อมูลส่วนตัว
        </p>
      </div>
      <div className="pf-card-body space-y-4">

        {/* ชื่อ + นามสกุล */}
        <div className="grid grid-cols-2 gap-4">
          <div className="pf-field">
            <label className="pf-label">ชื่อจริง <span className="text-red-500">*</span></label>
            <input
              name="firstName" value={data.firstName} onChange={onChange}
              required disabled={readOnly}
              className="pf-input" placeholder="ชื่อจริง"
            />
          </div>
          <div className="pf-field">
            <label className="pf-label">นามสกุล <span className="text-red-500">*</span></label>
            <input
              name="lastName" value={data.lastName} onChange={onChange}
              required disabled={readOnly}
              className="pf-input" placeholder="นามสกุล"
            />
          </div>
        </div>

        {/* TaxID + โทรศัพท์ */}
        <div className="grid grid-cols-2 gap-4">
          <div className="pf-field">
            <label className="pf-label">เลขบัตรประชาชน (13 หลัก) <span className="text-red-500">*</span></label>
            <div className="relative">
              <CreditCard size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="taxId" value={data.taxId} onChange={onChange}
                maxLength={13} required
                disabled={readOnly || lockTaxId}
                className={`pf-input pl-8 ${lockTaxId ? "bg-slate-100 text-slate-500" : ""}`}
                placeholder="x-xxxx-xxxxx-xx-x"
              />
            </div>
          </div>
          <div className="pf-field">
            <label className="pf-label">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
            <div className="relative">
              <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="telephoneNumber" value={data.telephoneNumber} onChange={onChange}
                maxLength={10} required disabled={readOnly}
                className="pf-input pl-8" placeholder="0xx-xxx-xxxx"
              />
            </div>
          </div>
        </div>

        {/* เพศ + วันเกิด + สัญชาติ */}
        <div className="grid grid-cols-3 gap-4">
          <div className="pf-field">
            <label className="pf-label">เพศ</label>
            <select name="gender" value={data.gender} onChange={onChange} disabled={readOnly} className="pf-input">
              <option value="">— ระบุเพศ —</option>
              <option value="MALE">ชาย</option>
              <option value="FEMALE">หญิง</option>
              <option value="OTHER">อื่นๆ</option>
            </select>
          </div>
          <div className="pf-field">
            <label className="pf-label">วันเกิด</label>
            <input name="birthDate" type="date" value={data.birthDate} onChange={onChange} disabled={readOnly} className="pf-input" />
          </div>
          <div className="pf-field">
            <label className="pf-label">สัญชาติ</label>
            <input name="nationality" value={data.nationality} onChange={onChange} disabled={readOnly} className="pf-input" placeholder="ไทย" />
          </div>
        </div>

        {/* Line ID */}
        <div className="pf-field">
          <label className="pf-label">Line ID</label>
          <input name="lineId" value={data.lineId} onChange={onChange} disabled={readOnly} className="pf-input" placeholder="@lineid" />
        </div>

      </div>
    </div>
  );
}

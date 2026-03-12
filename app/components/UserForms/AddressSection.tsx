"use client";

/**
 * AddressSection — Shared UI Component
 *
 * แสดงฟิลด์ที่อยู่ไทย: เลขที่, จังหวัด, อำเภอ, ตำบล, รหัสไปรษณีย์
 * ใช้ Hook useThailandAddress ภายใน
 *
 * ใช้ร่วมกันได้ทุก Form (Admin, HRM, Portal)
 */

import React from "react";
import { MapPin, Loader2, CheckCircle, AlertCircle, Search } from "lucide-react";
import type {
  ThailandAddressValue,
  ZipcodeStatus,
  Province,
  District,
  Subdistrict,
} from "@/app/hooks/useThailandAddress";

interface AddressSectionProps {
  address: ThailandAddressValue;
  provinces: Province[];
  districts: District[];
  subdistricts: Subdistrict[];
  zipcodeStatus: ZipcodeStatus;
  addressDetail: string;
  onAddressChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddressDetailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onZipcodeChange: (zip: string) => void;
  readOnly?: boolean;
}

export function AddressSection({
  address,
  provinces,
  districts,
  subdistricts,
  zipcodeStatus,
  addressDetail,
  onAddressChange,
  onAddressDetailChange,
  onZipcodeChange,
  readOnly = false,
}: AddressSectionProps) {
  return (
    <div className="pf-glass pf-card">
      <div className="pf-card-header">
        <p className="pf-section-title">
          <MapPin size={12} className="text-slate-400" />
          ที่อยู่
        </p>
      </div>
      <div className="pf-card-body space-y-4">

        {/* เลขที่, หมู่, ถนน */}
        <div className="pf-field">
          <label className="pf-label">เลขที่, หมู่, ถนน <span className="text-red-500">*</span></label>
          <input
            name="addressDetail" value={addressDetail}
            onChange={onAddressDetailChange}
            required disabled={readOnly}
            className="pf-input" placeholder="เช่น 123 หมู่ 4 ถนนสุขุมวิท"
          />
        </div>

        {/* จังหวัด + อำเภอ */}
        <div className="grid grid-cols-2 gap-4">
          <div className="pf-field">
            <label className="pf-label">จังหวัด <span className="text-red-500">*</span></label>
            <select
              name="provinceId" value={address.provinceId}
              onChange={onAddressChange} required disabled={readOnly}
              className="pf-input pf-select-addr"
            >
              <option value="">— เลือกจังหวัด —</option>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.nameTh}</option>)}
            </select>
          </div>
          <div className="pf-field">
            <label className="pf-label">อำเภอ/เขต <span className="text-red-500">*</span></label>
            <select
              name="districtId" value={address.districtId}
              onChange={onAddressChange} required
              disabled={readOnly || !address.provinceId}
              className="pf-input pf-select-addr"
            >
              <option value="">— เลือกอำเภอ —</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.nameTh}</option>)}
            </select>
          </div>
        </div>

        {/* ตำบล + รหัสไปรษณีย์ */}
        <div className="grid grid-cols-2 gap-4">
          <div className="pf-field">
            <label className="pf-label">ตำบล/แขวง <span className="text-red-500">*</span></label>
            <select
              name="subdistrictId" value={address.subdistrictId}
              onChange={onAddressChange} required
              disabled={readOnly || !address.districtId}
              className="pf-input pf-select-addr"
            >
              <option value="">— เลือกตำบล —</option>
              {subdistricts.map(s => <option key={s.id} value={s.id}>{s.nameTh}</option>)}
            </select>
          </div>
          <div className="pf-field">
            <label className="pf-label">รหัสไปรษณีย์</label>
            <div className="relative">
              <input
                name="zipcode" maxLength={5} placeholder="เช่น 10110"
                value={address.zipcode}
                onChange={e => {
                  const zip = e.target.value.replace(/\D/g, "");
                  onZipcodeChange(zip);
                }}
                disabled={readOnly}
                className={`pf-input pr-9 ${
                  zipcodeStatus === "found_single" ? "zipcode-ok" :
                  zipcodeStatus === "not_found" || zipcodeStatus === "error" ? "zipcode-err" : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {zipcodeStatus === "loading"       && <Loader2    size={14} className="animate-spin text-slate-400" />}
                {(zipcodeStatus === "found_single" || zipcodeStatus === "found_multi") && <CheckCircle size={14} className="text-green-500" />}
                {(zipcodeStatus === "not_found"    || zipcodeStatus === "error")       && <AlertCircle size={14} className="text-red-400" />}
              </div>
            </div>
            {zipcodeStatus === "found_single" && <p className="text-[10px] text-green-600 font-semibold mt-1.5 flex items-center gap-1"><CheckCircle size={10} /> กรอกที่อยู่อัตโนมัติแล้ว</p>}
            {zipcodeStatus === "found_multi"  && <p className="text-[10px] text-amber-600 font-semibold mt-1.5 flex items-center gap-1"><Search size={10} /> พบหลายตำบล — กรุณาเลือก</p>}
            {zipcodeStatus === "not_found"    && <p className="text-[10px] text-red-500 font-semibold mt-1.5 flex items-center gap-1"><AlertCircle size={10} /> ไม่พบรหัสไปรษณีย์นี้</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

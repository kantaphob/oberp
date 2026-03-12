/**
 * useThailandAddress — Custom Hook
 *
 * ทำอะไร:
 *   - จัดการ State และการ Fetch ข้อมูลที่อยู่ไทย (จังหวัด/อำเภอ/ตำบล/ไปรษณีย์)
 *   - Cascade Dropdown: เปลี่ยนจังหวัด → reset + โหลดอำเภอ, เปลี่ยนอำเภอ → reset + โหลดตำบล
 *   - Reverse Lookup: กรอก Zipcode 5 หลัก → Auto-fill จังหวัด/อำเภอ + กรองตำบล
 *
 * วิธีใช้:
 *   const { provinces, districts, subdistricts, address, setAddressField, lookupByZipcode, zipcodeStatus } = useThailandAddress({ provinceId: "1", ... });
 *   แล้วเอา provinces/districts/subdistricts ไปใส่ใน <select>
 *   เอา address.provinceId ฯลฯ เป็น value
 *   เรียก setAddressField("zipcode", "10400") เวลา onChange
 */

"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Province {
  id: number;
  nameTh: string;
  nameEn?: string;
}

export interface District {
  id: number;
  nameTh: string;
  nameEn?: string;
  provinceId: number;
}

export interface Subdistrict {
  id: number;
  nameTh: string;
  nameEn?: string;
  districtId: number;
  zipcode: number | null;
  district: {
    id: number;
    nameTh: string;
    province: {
      id: number;
      nameTh: string;
    };
  };
}

export interface ThailandAddressValue {
  provinceId: string;
  districtId: string;
  subdistrictId: string;
  zipcode: string;
}

/** สถานะของการค้นหาด้วย Zipcode */
export type ZipcodeStatus =
  | "idle"           // ยังไม่ได้กรอก
  | "loading"        // กำลังค้นหา
  | "found_single"   // เจอ 1 ตำบล (Auto-fill ครบ)
  | "found_multi"    // เจอหลายตำบล (auto-fill จังหวัด+อำเภอ แต่ให้เลือกตำบลเอง)
  | "not_found"      // ไม่พบรหัสไปรษณีย์
  | "error";         // เกิด Error

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseThailandAddressOptions {
  initialValue?: Partial<ThailandAddressValue>;
}

export function useThailandAddress(options: UseThailandAddressOptions = {}) {
  const { initialValue = {} } = options;

  const [address, setAddress] = useState<ThailandAddressValue>({
    provinceId: initialValue.provinceId ?? "",
    districtId: initialValue.districtId ?? "",
    subdistrictId: initialValue.subdistrictId ?? "",
    zipcode: initialValue.zipcode ?? "",
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);
  const [zipcodeStatus, setZipcodeStatus] = useState<ZipcodeStatus>("idle");

  // ── Step 1: โหลดจังหวัดทั้งหมดตอนเริ่ม ──────────────────────────────────
  useEffect(() => {
    fetch("/api/postcode/provinces")
      .then((res) => res.json())
      .then((data: Province[]) => setProvinces(data))
      .catch(() => console.error("[useThailandAddress] ดึงจังหวัดล้มเหลว"));
  }, []);

  // ── Step 2: เมื่อจังหวัดเปลี่ยน → โหลดอำเภอ ────────────────────────────
  useEffect(() => {
    if (!address.provinceId) {
      setDistricts([]);
      return;
    }
    fetch(`/api/postcode/districts?provinceId=${address.provinceId}`)
      .then((res) => res.json())
      .then((data: District[]) => setDistricts(data))
      .catch(() => console.error("[useThailandAddress] ดึงอำเภอล้มเหลว"));
  }, [address.provinceId]);

  // ── Step 3: เมื่ออำเภอเปลี่ยน → โหลดตำบล ────────────────────────────────
  useEffect(() => {
    if (!address.districtId) {
      setSubdistricts([]);
      return;
    }
    fetch(`/api/postcode/subdistricts?districtId=${address.districtId}`)
      .then((res) => res.json())
      .then((data: Subdistrict[]) => setSubdistricts(data))
      .catch(() => console.error("[useThailandAddress] ดึงตำบลล้มเหลว"));
  }, [address.districtId]);

  // ── Step 4: เมื่อตำบลเปลี่ยน → Auto-fill Zipcode ────────────────────────
  useEffect(() => {
    if (!address.subdistrictId || subdistricts.length === 0) return;

    const selected = subdistricts.find(
      (s) => s.id.toString() === address.subdistrictId
    );
    if (selected?.zipcode) {
      const zip = selected.zipcode.toString();
      setAddress((prev) => {
        // ป้องกัน loop: อัปเดตเฉพาะตอนที่ค่าต่างกัน
        if (prev.zipcode === zip) return prev;
        return { ...prev, zipcode: zip };
      });
    }
  }, [address.subdistrictId, subdistricts]);

  /**
   * setAddressField — ฟังก์ชันสำหรับ onChange ของ input/select ทุกตัว
   *
   * จัดการ Cascade reset ให้อัตโนมัติ:
   *   - เปลี่ยน province → reset district, subdistrict, zipcode
   *   - เปลี่ยน district → reset subdistrict, zipcode
   */
  const setAddressField = useCallback(
    (field: keyof ThailandAddressValue, value: string) => {
      setAddress((prev) => {
        switch (field) {
          case "provinceId":
            return {
              ...prev,
              provinceId: value,
              districtId: "",
              subdistrictId: "",
              zipcode: "",
            };
          case "districtId":
            return {
              ...prev,
              districtId: value,
              subdistrictId: "",
              zipcode: "",
            };
          default:
            return { ...prev, [field]: value };
        }
      });

      // reset zipcodeStatus ถ้าเปลี่ยน dropdown
      if (field !== "zipcode") {
        setZipcodeStatus("idle");
      }
    },
    []
  );

  /**
   * lookupByZipcode — Reverse Lookup
   *
   * เรียกเมื่อ zipcode ครบ 5 หลัก
   * Logic:
   *   - ได้ 1 ตำบล → Auto-fill ครบทุก Level
   *   - ได้ หลายตำบล (แต่ province+district เดียวกัน) → lock จังหวัด+อำเภอ, ให้เลือกตำบล
   *   - ไม่พบ → แจ้ง not_found
   */
  const lookupByZipcode = useCallback(async (zip: string) => {
    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) return;

    setZipcodeStatus("loading");

    try {
      const res = await fetch(`/api/postcode/subdistricts?zipcode=${zip}`);
      if (!res.ok) {
        setZipcodeStatus("error");
        return;
      }

      const data: Subdistrict[] = await res.json();

      if (!data || data.length === 0) {
        setZipcodeStatus("not_found");
        return;
      }

      const provinceId = data[0].district.province.id.toString();
      const districtId = data[0].district.id.toString();

      // ตรวจสอบว่าทุก subdistrict ใช้ district เดียวกันหรือไม่
      const allSameDistrict = data.every(
        (s) => s.district.id.toString() === districtId
      );

      if (data.length === 1) {
        // ✅ ครบทุก Level
        setAddress({
          provinceId,
          districtId,
          subdistrictId: data[0].id.toString(),
          zipcode: zip,
        });
        setZipcodeStatus("found_single");
      } else if (allSameDistrict) {
        // ✅ Lock จังหวัด+อำเภอ, ให้เลือกตำบลเอง
        setAddress((prev) => ({
          ...prev,
          provinceId,
          districtId,
          subdistrictId: "",
          zipcode: zip,
        }));
        // ตำบลจะ refetch อัตโนมัติจาก useEffect ที่ watch districtId
        setZipcodeStatus("found_multi");
      } else {
        // กรณีหายาก: zipcode ข้าม district (ใน DB จริงแทบไม่เจอ)
        setAddress((prev) => ({
          ...prev,
          provinceId,
          districtId: "",
          subdistrictId: "",
          zipcode: zip,
        }));
        setZipcodeStatus("found_multi");
      }
    } catch {
      setZipcodeStatus("error");
    }
  }, []);

  /**
   * resetAddress — ล้างข้อมูลที่อยู่ทั้งหมด
   * ใช้ตอนที่ต้องการ Reset Form
   */
  const resetAddress = useCallback(() => {
    setAddress({ provinceId: "", districtId: "", subdistrictId: "", zipcode: "" });
    setZipcodeStatus("idle");
  }, []);

  /**
   * setFullAddress — ตั้งค่าที่อยู่ทั้งหมดครั้งเดียว
   * ใช้ตอน initialData โหลดมาจาก Server (เช่น Edit Mode)
   */
  const setFullAddress = useCallback((value: Partial<ThailandAddressValue>) => {
    setAddress((prev) => ({ ...prev, ...value }));
  }, []);

  return {
    // ── Data สำหรับ Dropdown ───────────────────────────────────────────────
    provinces,
    districts,
    subdistricts,

    // ── State ที่อยู่ปัจจุบัน ────────────────────────────────────────────────
    address,

    // ── Helpers ────────────────────────────────────────────────────────────
    setAddressField,    // ใช้ใน onChange ของทุก field
    lookupByZipcode,    // ใช้ใน onBlur หรือ onChange ของ input zipcode
    resetAddress,       // ใช้ตอน Reset Form
    setFullAddress,     // ใช้ตอน Edit Mode (โหลด initialData)

    // ── sStatus รหัสไปรษณีย์ (สำหรับแสดง feedback ให้ User) ─────────────
    zipcodeStatus,
  };
}

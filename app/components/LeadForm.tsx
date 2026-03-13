"use client";

import React, { useState } from "react";
import { useToast } from "../hooks/useToast";
import { useLeads } from "../hooks/useLeads";

import { ServiceType, SERVICE_CONFIG } from "../lib/services"
// --- Hardcoded Enums ---
const CUSTOMER_TYPE = {
  INDIVIDUAL: "INDIVIDUAL",
  COMPANY: "COMPANY",
} as const;
type CustomerType = (typeof CUSTOMER_TYPE)[keyof typeof CUSTOMER_TYPE];

// --- Hardcoded Loader Component (เปลี่ยนสีเป็นสีดำเพื่อให้เข้ากับปุ่มสีขาว) ---
const ButtonLoader = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black inline-block"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default function LeadForm() {
  const { showToast } = useToast();
  const { createLead } = useLeads();
  const [customerType, setCustomerType] = useState<CustomerType>(
    CUSTOMER_TYPE.INDIVIDUAL,
  );

  const [formData, setFormData] = useState<{
    companyName: string;
    firstName: string;
    lastName: string;
    telephoneNumber: string;
    email: string;
    lineId: string;
    services: ServiceType | "";
    message: string;
  }>({
    companyName: "",
    firstName: "",
    lastName: "",
    telephoneNumber: "",
    email: "",
    lineId: "",
    services: "",
    message: "",
  });

  const [isConsentAccepted, setIsConsentAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State สำหรับเก็บสถานะ Error ของแต่ละช่อง
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // เคลียร์ Error ทันทีเมื่อผู้ใช้เริ่มพิมพ์ในช่องนั้นๆ
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }

    if (name === "telephoneNumber") {
      let onlyNumbers = value.replace(/\D/g, "");
      if (onlyNumbers.length > 0 && onlyNumbers[0] !== "0") {
        onlyNumbers = "0" + onlyNumbers;
      }
      onlyNumbers = onlyNumbers.slice(0, 10);
      setFormData((prev) => ({ ...prev, telephoneNumber: onlyNumbers }));
      return;
    }

    if (name === "services") {
      // store as ServiceType (or empty string when unselected)
      setFormData((prev) => ({
        ...prev,
        services: (value as ServiceType) || "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: CustomerType) => {
    setCustomerType(type);
    setErrors({}); // เคลียร์ Error เมื่อเปลี่ยนประเภทลูกค้า
    setFormData((prev) => ({
      ...prev,
      firstName: "",
      lastName: "",
      companyName: "",
    }));

    // Show toast notification for type change
    if (type === CUSTOMER_TYPE.INDIVIDUAL) {
      showToast("เปลี่ยนเป็นลูกค้าบุคคลธรรมดา", "info");
    } else {
      showToast("เปลี่ยนเป็นลูกค้านิติบุคคล", "info");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ask user to confirm submission
    const ok = await confirm("ต้องการส่งฟอร์มหรือไม่?");
    if (!ok) return;

    // --- Validation Logic ---
    const newErrors: Record<string, boolean> = {};

    if (customerType === CUSTOMER_TYPE.INDIVIDUAL) {
      if (!formData.firstName.trim()) newErrors.firstName = true;
      if (!formData.lastName.trim()) newErrors.lastName = true;
    } else {
      if (!formData.companyName.trim()) newErrors.companyName = true;
    }

    if (formData.telephoneNumber.length !== 10)
      newErrors.telephoneNumber = true;
    if (!formData.services) newErrors.services = true;
    if (!formData.message.trim()) newErrors.message = true;
    if (!isConsentAccepted) newErrors.consent = true;

    // หากมี Error เกิดขึ้น ให้เซ็ต State และหยุดการส่งฟอร์ม
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("กรุณากรอกข้อมูลให้ครบถ้วนทุกช่องที่จำเป็น", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      await createLead({
        type: customerType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName:
          customerType === CUSTOMER_TYPE.INDIVIDUAL
            ? null
            : formData.companyName,
        phone: formData.telephoneNumber,
        email: formData.email || null,
        lineId: formData.lineId || null,
        service: formData.services as ServiceType,
        message: formData.message || null,
      });

      showToast(
        "ส่งข้อมูลเรียบร้อยแล้ว! ทีมงานจะติดต่อกลับโดยเร็วที่สุด",
        "success",
      );

      // Reset
      setCustomerType(CUSTOMER_TYPE.INDIVIDUAL);
      setFormData({
        companyName: "",
        firstName: "",
        lastName: "",
        telephoneNumber: "",
        email: "",
        lineId: "",
        services: "",
        message: "",
      });
      setIsConsentAccepted(false);
      setErrors({});
    } catch {
      showToast("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Dynamic Style Generator (Liquid Glass & Dark Theme) ---
  const getInputClassName = (fieldName: string) => {
    const baseClass =
      "mt-2 w-full px-5 py-4 rounded-xl border transition-all duration-300 outline-none backdrop-blur-md shadow-sm ";

    // ❌ ERROR STATE (priority สูงสุด)
    if (errors[fieldName]) {
      return (
        baseClass +
        "bg-red-500/10 border-red-500/50 text-red-200 placeholder-red-300/50 focus:ring-4 focus:ring-red-500/20 focus:border-red-500"
      );
    }

    // ✅ VALUE FILLED → GREEN SUCCESS
    const hasValue = (formData as Record<string, unknown>)[fieldName];

    if (hasValue && hasValue.toString().trim() !== "") {
      return (
        baseClass +
        "bg-emerald-500/5 border-emerald-400/40 text-white placeholder-zinc-400 focus:bg-emerald-500/10 focus:ring-4 focus:ring-emerald-400/20 focus:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
      );
    }

    // 🟢 DEFAULT
    return (
      baseClass +
      "bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:bg-emerald-500/5 focus:ring-4 focus:ring-emerald-400/20 focus:border-emerald-400"
    );
  };

  // ปรับ Label ให้เป็นสไตล์ Luxury (ตัวเล็ก พิมพ์ใหญ่ เว้นช่องไฟ)
  const labelClassName =
    "text-[11px] font-bold text-zinc-400 ml-1 uppercase tracking-widest";

  return (
    // เอา bg-slate-50 ออก และปรับให้พื้นหลังโปร่งใส (transparent) เพื่อให้กลืนกับ Section หลัก
    <div className="relative w-full py-8 md:py-16 px-4 sm:px-6 flex items-center justify-center overflow-hidden">
      {/* --- Ambient Background Glows (White/Grey for Dark Theme) --- */}
      <div className="absolute top-[0%] left-[-10%] w-100 h-100 bg-white/2 rounded-full blur-[100px] pointer-events-none"></div>

      {/* --- Main Glass Container (Dark Liquid Glass) --- */}
      <div className="relative max-w-2xl w-full mx-auto z-10">
        <div className="text-center md:text-left mb-10">
          <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-3">
            Contact & <span className="font-bold">Inquiry</span>
          </h2>
          <p className="text-zinc-400 font-light text-sm md:text-base">
            กรอกรายละเอียดโครงการของคุณ เพื่อให้ทีมงานผู้เชี่ยวชาญติดต่อกลับ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ส่วนเลือกประเภทลูกค้า (Dark Glass Toggle) */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-fit backdrop-blur-md mx-auto md:mx-0">
            <button
              type="button"
              onClick={() => handleTypeChange(CUSTOMER_TYPE.INDIVIDUAL)}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 uppercase tracking-widest ${
                customerType === CUSTOMER_TYPE.INDIVIDUAL
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              บุคคลธรรมดา
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange(CUSTOMER_TYPE.COMPANY)}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 uppercase tracking-widest ${
                customerType === CUSTOMER_TYPE.COMPANY
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              นิติบุคคล
            </button>
          </div>

          {/* Conditional Rendering Inputs */}
          <div>
            {customerType === CUSTOMER_TYPE.INDIVIDUAL ? (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClassName}>ชื่อจริง *</label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={getInputClassName("firstName")}
                      placeholder="ระบุชื่อจริง"
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-xs mt-2 ml-1 font-medium">
                        กรุณาระบุชื่อจริง
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClassName}>นามสกุล *</label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={getInputClassName("lastName")}
                      placeholder="ระบุนามสกุล"
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-xs mt-2 ml-1 font-medium">
                        กรุณาระบุนามสกุล
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <label className={labelClassName}>
                  ชื่อบริษัท / หน่วยงาน *
                </label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={getInputClassName("companyName")}
                  placeholder="เช่น บริษัท โอบนิธิ คอนสตรัคชั่น จำกัด"
                />
                {errors.companyName && (
                  <p className="text-red-400 text-xs mt-2 ml-1 font-medium">
                    กรุณาระบุชื่อบริษัท/หน่วยงาน
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClassName}>เบอร์โทรศัพท์ *</label>
              <input
                name="telephoneNumber"
                value={formData.telephoneNumber}
                onChange={handleChange}
                className={`${getInputClassName("telephoneNumber")} font-mono`}
                placeholder="0XXXXXXXXX"
              />
              {errors.telephoneNumber && (
                <p className="text-red-400 text-xs mt-2 ml-1 font-medium">
                  ระบุเบอร์โทรศัพท์ 10 หลัก
                </p>
              )}
            </div>

            <div>
              <label className={labelClassName}>Line ID</label>
              <input
                name="lineId"
                value={formData.lineId}
                onChange={handleChange}
                className={getInputClassName("lineId")}
                placeholder="เพิ่มเพื่อนทางไลน์"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClassName}>E-mail</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={getInputClassName("email")}
                placeholder="example@company.com"
              />
            </div>
          </div>

          {/* Services Dropdown */}
          <div>
            <label className={labelClassName}>หัวข้อบริการ *</label>
            <select
              name="services"
              value={formData.services}
              onChange={handleChange}
              className={`${getInputClassName("services")} cursor-pointer`}
            >
              <option value="" disabled>
                เลือกหัวข้อบริการที่สนใจ
              </option>

              {SERVICE_CONFIG.map((cfg) => (
                <option
                  key={cfg.value}
                  value={cfg.value}
                  disabled={!cfg.active}
                >
                  {cfg.label}
                </option>
              ))}
            </select>
            {errors.services && (
              <p className="text-red-400 text-xs mt-2 ml-1 font-medium">
                กรุณาเลือกหัวข้อบริการ
              </p>
            )}
          </div>

          {/* Message Textarea */}
          <div>
            <label htmlFor="message" className={labelClassName}>
              รายละเอียดเพิ่มเติม *
            </label>
            <textarea
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className={`${getInputClassName("message")} resize-none`}
              placeholder="ระบุรายละเอียดพื้นที่, ขนาดที่ดิน ,จังหวัดพื้นที่ก่อสร้าง หรือความต้องการเบื้องต้น..."
            />
            {errors.message && (
              <p className="text-red-400 text-xs mt-2 ml-1 font-medium">
                กรุณาระบุรายละเอียดเบื้องต้น
              </p>
            )}
          </div>

          {/* Consent Checkbox (Dark Version) */}
          <div
            className={`bg-white/5 border p-5 rounded-2xl flex items-start gap-4 mt-6 backdrop-blur-md transition-colors ${
              errors.consent
                ? "border-red-500/50 bg-red-500/10"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center h-6 mt-0.5 relative">
              <input
                id="consent"
                type="checkbox"
                checked={isConsentAccepted}
                onChange={(e) => {
                  setIsConsentAccepted(e.target.checked);
                  if (e.target.checked) {
                    showToast("ขอบคุณที่ยอมรับเงื่อนไขการใช้บริการ", "success");
                    if (errors.consent) {
                      setErrors((prev) => ({ ...prev, consent: false }));
                    }
                  }
                }}
                className={`w-5 h-5 appearance-none border rounded transition-colors cursor-pointer peer ${
                  errors.consent
                    ? "border-red-500 bg-red-500/20"
                    : "border-zinc-600 bg-zinc-800/50 checked:bg-white checked:border-white"
                }`}
              />
              <svg
                className={`absolute w-3 h-3 left-1 top-1 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity ${
                  errors.consent ? "text-red-400" : "text-black"
                }`}
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5L4.5 8.5L13 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <label
              htmlFor="consent"
              className={`text-xs cursor-pointer leading-relaxed font-light ${
                errors.consent ? "text-red-300" : "text-zinc-400"
              }`}
            >
              ข้าพเจ้าได้อ่านและยอมรับ{" "}
              <a
                href="/terms"
                className="font-bold text-white hover:text-zinc-300 underline decoration-zinc-600 transition-all"
                target="_blank"
              >
                เงื่อนไขการใช้บริการ
              </a>{" "}
              และ{" "}
              <a
                href="/privacy"
                className="font-bold text-white hover:text-zinc-300 underline decoration-zinc-600 transition-all"
                target="_blank"
              >
                นโยบายความเป็นส่วนตัว
              </a>{" "}
              แล้ว และยินยอมให้บริษัทฯ{" "}
              <strong className="text-white font-medium">
                เก็บรักษาข้อมูลทั้งหมดนี้เป็นความลับทางธุรกิจ
              </strong>{" "}
              เพื่อใช้ในการติดต่อกลับ นำเสนอราคา
              และดำเนินการที่เกี่ยวข้องเท่านั้น
            </label>
          </div>

          {/* Submit Button (Luxury White Button) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 mt-4
              ${
                isSubmitting
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-zinc-200 hover:scale-[1.01] shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              }
            `}
          >
            {isSubmitting ? (
              <>
                <ButtonLoader />
                <span className="ml-2 font-medium tracking-normal text-black">
                  กำลังส่งข้อมูล...
                </span>
              </>
            ) : (
              "ส่งข้อมูลติดต่อ"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

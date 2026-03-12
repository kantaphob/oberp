// ไฟล์: app/lib/documentTypes.ts

export interface DocumentTypeInfo {
  code: string;
  label: string;
  hasExpiry?: boolean;
}

export interface DocumentCategory {
  id: string;
  name: string;
  types: DocumentTypeInfo[];
}

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    id: "PERSONAL",
    name: "1. หมวดเอกสารส่วนบุคคล",
    types: [
      { code: "ID_CARD", label: "สำเนาบัตรประชาชน" },
      { code: "HOUSE_REG", label: "สำเนาทะเบียนบ้าน" },
      { code: "MILITARY", label: "เอกสารเกณฑ์ทหาร (สด.8 / สด.43)" },
      { code: "NAME_CHANGE", label: "ใบเปลี่ยนชื่อ-นามสกุล" },
    ]
  },
  {
    id: "EDUCATION",
    name: "2. หมวดประวัติและการศึกษา",
    types: [
      { code: "RESUME", label: "เรซูเม่ / ประวัติการทำงาน" },
      { code: "DEGREE", label: "สำเนาวุฒิการศึกษา / ทรานสคริปต์" },
      { code: "EMPLOYMENT_CERT", label: "หนังสือรับรองการผ่านงาน" },
    ]
  },
  {
    id: "PROFESSIONAL",
    name: "3. หมวดเอกสารวิชาชีพและหน้าไซต์",
    types: [
      { code: "LICENSE_ENG", label: "ใบอนุญาตประกอบวิชาชีพ (ใบ กว.)", hasExpiry: true },
      { code: "LICENSE_SAFETY", label: "ใบรับรองการฝึกอบรมความปลอดภัย (จป.)", hasExpiry: true },
      { code: "DRIVERS_LICENSE", label: "สำเนาใบอนุญาตขับขี่", hasExpiry: true },
    ]
  },
  {
    id: "FINANCE_MEDICAL",
    name: "4. หมวดการเงินและสวัสดิการ",
    types: [
      { code: "BOOK_BANK", label: "หน้าสมุดบัญชีธนาคาร" },
      { code: "MEDICAL_CERT", label: "ใบรับรองแพทย์ (สุขภาพกาย)" },
      { code: "MENTAL_HEALTH_CERT", label: "แบบฟอร์มรับรองสุขภาพจิตพนักงาน" }, 
      { code: "SOCIAL_SECURITY_REG", label: "แบบขึ้นทะเบียนผู้ประกันตน (สปส.)" }, 
      { code: "GROUP_INSURANCE", label: "เอกสารประกันกลุ่มของบริษัท" }, 
    ]
  },
  {
    id: "COMPANY_FORMS",
    name: "5. หมวดแบบฟอร์มบริษัทและหนังสือยินยอม",
    types: [
      { code: "JOB_APPLICATION", label: "ใบสมัครงานของบริษัท" },
      { code: "PDPA_CONSENT", label: "หนังสือยินยอมเก็บรวบรวมข้อมูลส่วนบุคคล (PDPA)" },
      { code: "BACKGROUND_CHECK", label: "หนังสือยินยอมให้ตรวจประวัติบุคคล" },
      { code: "GUARANTOR_CONSENT", label: "แบบฟอร์มให้ความยินยอมเปิดบัญชีค้ำประกัน" },
    ]
  },
  {
    id: "OTHERS",
    name: "6. หมวดเอกสารอื่นๆ และผลงาน",
    types: [
      { code: "PORTFOLIO", label: "แฟ้มสะสมผลงาน (Portfolio)" },
      { code: "CRIMINAL_RECORD", label: "ใบตรวจสอบประวัติอาชญากรรม" },
      { code: "OTHER", label: "เอกสารอื่นๆ (ระบุเพิ่มเติม)" },
    ]
  }
];
"use client";

import React from "react";
import PayslipComponent, { PayslipData } from "@/app/components/payroll/PayslipComponent";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ShowPayslipPage() {
  // 💡 สมมติข้อมูลที่ดึงมาจาก Database (ตาราง Payslip)
  const mockPayslipData: PayslipData = {
    periodMonth: "มีนาคม 2026",
    employee: {
      id: "EMP-0012",
      name: "นายสมชาย ช่างทอง",
      role: "Project Manager (PM)",
      department: "ปฏิบัติการหน้าไซต์ (OPS)",
    },
    earnings: {
      baseSalary: 35000,
      otAmount: 4500,
      incentive: 2000,
      allowances: 1000,
    },
    deductions: {
      sso: 750,
      tax: 1200,
      guarantee: 500,
      others: 300,
      otherDetails: "หักค่าชุด PPE (INV-001)",
    },
    summary: {
      totalEarnings: 42500,
      totalDeductions: 2750,
      netIncome: 39750,
    },
    guaranteeAccumulated: 5000,
  };

  // ฟังก์ชันสั่ง Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 print:hidden">
        <Link 
          href="/dashboard/hrm/payroll"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft size={18} /> กลับสู่หน้าสรุป
        </Link>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all"
        >
          <Printer size={18} /> พิมพ์เป็นเอกสาร PDF
        </button>
      </div>

      {/* เรียกใช้งาน Component สลิป */}
      <PayslipComponent data={mockPayslipData} />
    </div>
  );
}

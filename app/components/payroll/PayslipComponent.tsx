import React from "react";

// 🌟 กำหนดโครงสร้างข้อมูลที่ต้องส่งเข้ามาใน Component นี้
export interface PayslipData {
  companyName?: string;
  payDate: string; // วันที่จ่ายเงิน
  payPeriod: string; // งวดเดือนที่จ่าย
  payYear: string; // ปีที่จ่าย
  employee: {
    id: string; // รหัสพนักงาน
    username: string; // User ID
    name: string;
    taxId?: string; // เลขประจำตัวผู้เสียภาษี
    role: string;
    division: string; // ฝ่าย
    department: string; // แผนก
    startDate?: string; // วันเริ่มงาน
    bankAccount?: string; // เลขบัญชี
    baseSalary: number; // ฐานเงินเดือน
  };
  earnings: {
    baseSalary: number;
    otAmount?: number;
    commission?: number;
    incentive?: number;
    allowances?: number;
    others?: number;
  };
  deductions: {
    sso: number;
    tax: number;
    guarantee?: number;
    leave?: number;
    others?: number;
    otherDetails?: string; 
  };
  summary: {
    totalEarnings: number;
    totalDeductions: number;
    netIncome: number;
  };
  remarks?: string;
  guaranteeAccumulated?: number;
}

interface PayslipProps {
  data: PayslipData;
}

export default function PayslipComponent({ data }: PayslipProps) {
  // ฟังก์ชันช่วยจัดฟอร์แมตตัวเลขให้มี คอมม่า และ ทศนิยม 2 ตำแหน่ง
  const formatNum = (num: number | undefined) => {
    return (num || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white p-10 w-full max-w-4xl mx-auto border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
      
      {/* ── หัวกระดาษ (Header) ── */}
      <div className="text-center mb-8 border-b-2 border-slate-900 pb-6 relative">
        <h1 className="text-2xl font-black text-slate-900 tracking-widest uppercase">
          {data.companyName || "บริษัท โอบนิธิ คอนสตรัคชั่น จำกัด"}
        </h1>
        <h2 className="text-lg font-bold text-slate-600 mt-1 uppercase tracking-tighter">ใบจ่ายเงินเดือน (PAYSLIP)</h2>
        <div className="mt-4 flex justify-between text-[11px] font-black uppercase text-slate-400">
           <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 italic">งวด: <span className="text-slate-900">{data.payPeriod} / {data.payYear}</span></div>
           <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 italic">วันที่จ่าย: <span className="text-slate-900">{data.payDate}</span></div>
        </div>
      </div>

      {/* ── ข้อมูลพนักงาน (Employee Detailed Info) ── */}
      <div className="mb-8 text-[11px] font-bold text-slate-700 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
        <div className="space-y-1">
           <p className="text-slate-400 uppercase tracking-widest text-[9px]">Employee ID / Name</p>
           <p className="text-slate-900">[{data.employee.id}] {data.employee.username}</p>
           <p className="text-slate-900 font-black text-sm">{data.employee.name}</p>
        </div>
        <div className="space-y-1">
           <p className="text-slate-400 uppercase tracking-widest text-[9px]">Tax ID / Start Date</p>
           <p className="text-slate-900 font-black">{data.employee.taxId || "-"}</p>
           <p className="text-slate-600 italic">เริ่มงาน: {data.employee.startDate || "-"}</p>
        </div>
        <div className="space-y-1">
           <p className="text-slate-400 uppercase tracking-widest text-[9px]">Account Number</p>
           <p className="text-slate-900 font-black">{data.employee.bankAccount || "-"}</p>
        </div>

        <div className="space-y-1">
           <p className="text-slate-400 uppercase tracking-widest text-[9px]">Position / Role</p>
           <p className="text-slate-900 font-black">{data.employee.role}</p>
        </div>
        <div className="space-y-1">
           <p className="text-slate-400 uppercase tracking-widest text-[9px]">Division / Department</p>
           <p className="text-slate-900">{data.employee.division}</p>
           <p className="text-slate-600 font-medium italic">{data.employee.department}</p>
        </div>
        <div className="space-y-1">
           <p className="text-slate-400 uppercase tracking-widest text-[9px]">Base Salary</p>
           <p className="text-slate-900 font-black text-sm">{formatNum(data.employee.baseSalary)} ฿</p>
        </div>
      </div>

      {/* ── ตารางแยก 2 ฝั่ง (Earnings vs Deductions) ── */}
      <div className="grid grid-cols-2 gap-8 border-t border-b border-slate-300 py-6 mb-6">
        
        {/* 🟢 ฝั่งซ้าย: รายการเงินได้ (Earnings) */}
        <div>
          <h3 className="font-black text-slate-900 bg-emerald-50 text-emerald-700 p-3 mb-4 text-center rounded-xl border border-emerald-100 uppercase tracking-widest text-[10px]">
            รายการเงินเพิ่ม / ค่าตอบแทน (COMPENSATION)
          </h3>
          <div className="space-y-4 text-[11px] font-bold text-slate-600 px-2 min-h-[150px]">
            {data.earnings.baseSalary > 0 && <div className="flex justify-between"><span className="text-slate-500">เงินเดือนพื้นฐาน/ค่าแรง</span> <span className="text-slate-900">{formatNum(data.earnings.baseSalary)}</span></div>}
            {(data.earnings.otAmount || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">ค่าล่วงเวลา (OT)</span> <span className="text-slate-900">{formatNum(data.earnings.otAmount)}</span></div>}
            {(data.earnings.commission || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">ค่าคอมมิชชั่น</span> <span className="text-slate-900">{formatNum(data.earnings.commission)}</span></div>}
            {(data.earnings.incentive || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">เงินจูงใจ (Incentive)</span> <span className="text-slate-900">{formatNum(data.earnings.incentive)}</span></div>}
            {(data.earnings.allowances || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">สวัสดิการ/เบี้ยเลี้ยง</span> <span className="text-slate-900">{formatNum(data.earnings.allowances)}</span></div>}
            {(data.earnings.others || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">รายได้อื่นๆ</span> <span className="text-slate-900">{formatNum(data.earnings.others)}</span></div>}
          </div>
        </div>

        {/* 🔴 ฝั่งขวา: รายการหัก (Deductions) */}
        <div>
          <h3 className="font-black text-slate-900 bg-rose-50 text-rose-700 p-3 mb-4 text-center rounded-xl border border-rose-100 uppercase tracking-widest text-[10px]">
            รายการหัก (DEDUCTIONS)
          </h3>
          <div className="space-y-4 text-[11px] font-bold text-slate-600 px-2 min-h-[150px]">
            {(data.deductions.sso || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">เงินสมทบประกันสังคม</span> <span className="text-rose-600">{formatNum(data.deductions.sso)}</span></div>}
            {(data.deductions.tax || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">ภาษีหัก ณ ที่จ่าย (WHT)</span> <span className="text-rose-600">{formatNum(data.deductions.tax)}</span></div>}
            {(data.deductions.guarantee || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">เงินค้ำประกัน</span> <span className="text-rose-600">{formatNum(data.deductions.guarantee)}</span></div>}
            {(data.deductions.leave || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">หักขาด/ลา/มาสาย</span> <span className="text-rose-600">{formatNum(data.deductions.leave)}</span></div>}
            {(data.deductions.others || 0) > 0 && (
              <div className="flex justify-between items-start">
                 <span className="flex flex-col text-slate-500">
                   รายการหักอื่นๆ 
                   {data.deductions.otherDetails && <span className="text-[9px] text-slate-400 mt-0.5 uppercase">Ref: {data.deductions.otherDetails}</span>}
                 </span> 
                 <span className="text-rose-600">{formatNum(data.deductions.others)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── สรุปยอดรวม (Summary) ── */}
      <div className="grid grid-cols-2 gap-8 py-4 px-2 font-black text-base text-slate-900">
        <div className="flex justify-between">
          <span className="text-slate-500 text-sm uppercase tracking-widest">รวมค่าตอบแทน</span> 
          <span>{formatNum(data.summary.totalEarnings)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 text-sm uppercase tracking-widest">รวมรายการหัก</span> 
          <span className="text-rose-600">{formatNum(data.summary.totalDeductions)}</span>
        </div>
      </div>

      {/* ── เงินรับสุทธิ (Net Pay) ── */}
      <div className="mt-6 bg-slate-900 text-white p-6 flex justify-between items-center rounded-2xl shadow-xl print:bg-slate-100 print:text-slate-900 print:shadow-none print:border-2 print:border-slate-900">
        <span className="text-sm font-black uppercase tracking-widest">ยอดจ่ายสุทธิ (Net Payout)</span>
        <span className="text-4xl font-black">฿ {formatNum(data.summary.netIncome)}</span>
      </div>

      {/* ── หมายเหตุ (Remarks) ── */}
      {(data.remarks || data.guaranteeAccumulated !== undefined) && (
        <div className="mt-8 text-xs text-slate-500 font-bold bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-slate-700 uppercase tracking-widest">หมายเหตุ (Remarks):</span>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            {data.guaranteeAccumulated !== undefined && (
              <li>ยอดเงินค้ำประกันสะสมปัจจุบัน: <span className="text-slate-900">฿ {formatNum(data.guaranteeAccumulated)}</span></li>
            )}
            {data.remarks && <li>{data.remarks}</li>}
          </ul>
        </div>
      )}

      {/* ── ลายเซ็นต์ (Signatures - สำหรับ Print) ── */}
      <div className="grid grid-cols-2 gap-8 mt-20 text-center text-sm font-bold text-slate-600">
        <div>
          <div className="w-48 border-b border-slate-400 mx-auto mb-2"></div>
          <p>ผู้จ่ายเงิน / ผู้จัดทำ</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase">Prepared By</p>
        </div>
        <div>
          <div className="w-48 border-b border-slate-400 mx-auto mb-2"></div>
          <p>ผู้รับเงิน</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase">Received By</p>
        </div>
      </div>

    </div>
  );
}
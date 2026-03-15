import React from "react";
import { prisma } from "@/app/lib/prisma";
import UserPayrollTable from "../../../components/payroll/UserPayrollTable";

export default async function Payroll() {
  const [users, departments, pendingAdjustments, incompleteAttendance] =
    await Promise.all([
      prisma.user.findMany({
        include: {
          profile: true,
          role: {
            include: {
              jobLine: true,
              department: true,
            },
          },
          employeeCompensation: true,
          earnings: {
            where: { status: "PENDING" },
          },
          payrollDeductions: {
            where: { status: "PENDING" },
          },
          // We'll also need payslips to see the status (DRAFT, APPROVED, PAID)
          // For simplicity in this demo, we'll assume current active month
          payslips: {
            take: 1,
            orderBy: { periodMonth: "desc" },
          },
        },
        orderBy: { username: "asc" },
      }),
      prisma.department.findMany({
        select: { id: true, name: true },
      }),
      prisma.salaryAdjustment.count({
        where: { status: "PENDING" },
      }),
      prisma.attendance.count({
        where: {
          checkInTime: { not: null },
          checkOutTime: null,
        },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/50 p-6 rounded-[2.5rem] border border-white shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Payroll System
          </h1>
          <p className="text-slate-500 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            รอบบัญชีประจำเดือน มีนาคม 2026
          </p>
        </div>
      </div>

      <UserPayrollTable
        initialUsers={users}
        departments={departments}
        pendingAdjustments={pendingAdjustments}
        incompleteAttendance={incompleteAttendance}
      />
    </div>
  );
}

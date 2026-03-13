import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

/**
 * POST /api/setup/seed-positions
 * Creates all Departments, JobLines, and JobRoles in the database
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { secretKey, mode = "safe" } = body;

    // Security check
    if (secretKey !== process.env.SETUP_SECRET_KEY && secretKey !== "setup-admin-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      departments: { created: 0, existing: 0, items: [] as string[] },
      jobLines: { created: 0, existing: 0, items: [] as string[] },
      jobRoles: { created: 0, existing: 0, items: [] as string[] },
    };

    // =========================================
    // 🏢 PHASE 1: Departments (8 แผนก)
    // =========================================
    const departments = [
      { code: "EXC", name: "บริหารจัดการ (Executive)", description: "กำหนดนโยบาย อนุมัติงบประมาณโครงการภาพรวม" },
      { code: "OPS", name: "ปฏิบัติการหน้าไซต์ (Operations)", description: "คุมงานก่อสร้างหน้าไซต์ ควบคุมคนงาน" },
      { code: "ENG", name: "วิศวกรรมและออกแบบ (Engineering)", description: "ออกแบบ เคลียร์แบบก่อสร้าง คำนวณโครงสร้าง" },
      { code: "PRO", name: "จัดซื้อและคลังสินค้า (Procurement)", description: "สรรหาวัสดุก่อสร้าง ต่อรองราคา จัดการคลัง" },
      { code: "FIN", name: "การเงินและบัญชี (Finance)", description: "บริหารกระแสเงินสด จ่ายเงินเดือน วางบิล" },
      { code: "SAL", name: "ขายและการตลาด (Sales)", description: "หาโปรเจกต์ใหม่ นำเสนองานลูกค้า ปิดการขาย" },
      { code: "HRA", name: "บุคคลและธุรการ (HR)", description: "สรรหาพนักงาน จัดการวันลา เอกสารสารบรรณ" },
      { code: "SVC", name: "บริการหลังการขาย (Service)", description: "ดูแลลูกค้าหลังการขาย แก้ไขปัญหา" },
    ];

    const deptMap = new Map<string, string>(); // code -> id

    for (const dept of departments) {
      const existing = await prisma.department.findUnique({ where: { code: dept.code } });
      if (existing) {
        results.departments.existing++;
        deptMap.set(dept.code, existing.id);
      } else {
        const created = await prisma.department.create({
          data: { code: dept.code, name: dept.name, description: dept.description },
        });
        results.departments.created++;
        results.departments.items.push(dept.name);
        deptMap.set(dept.code, created.id);
      }
    }

    // =========================================
    // 🛤️ PHASE 2: Job Lines (9 สายงาน)
    // =========================================
    const jobLines = [
      { code: "MGT", name: "สายงานบริหารองค์กร", description: "บริหารภาพรวมองค์กร" },
      { code: "PMT", name: "สายงานบริหารโครงการ", description: "บริหารโครงการก่อสร้าง" },
      { code: "CST", name: "สายงานก่อสร้างและควบคุมงาน", description: "งานก่อสร้างหน้าไซต์" },
      { code: "ENG", name: "สายงานวิศวกรรม", description: "ออกแบบและคำนวณโครงสร้าง" },
      { code: "ARC", name: "สายงานสถาปัตยกรรม", description: "ออกแบบสถาปัตยกรรม" },
      { code: "QSE", name: "สายงานประเมินราคา", description: "QS / ประเมินราคา" },
      { code: "PRO", name: "สายงานจัดซื้อและโลจิสติกส์", description: "จัดซื้อและคลังสินค้า" },
      { code: "FIN", name: "สายงานบัญชีและการเงิน", description: "บัญชีและการเงิน" },
      { code: "HRA", name: "สายงานบุคคลและธุรการ", description: "HR และธุรการ" },
    ];

    const jlMap = new Map<string, string>(); // code -> id

    for (const jl of jobLines) {
      const existing = await prisma.jobLine.findUnique({ where: { code: jl.code } });
      if (existing) {
        results.jobLines.existing++;
        jlMap.set(jl.code, existing.id);
      } else {
        const created = await prisma.jobLine.create({
          data: { code: jl.code, name: jl.name, description: jl.description },
        });
        results.jobLines.created++;
        results.jobLines.items.push(jl.name);
        jlMap.set(jl.code, created.id);
      }
    }

    // =========================================
    // 🌳 PHASE 3: Job Roles (17+ ตำแหน่ง)
    // =========================================
    const jobRoles = [
      // Level 0 - Founder
      { prefix: "FND", name: "Founder / Co-Founder", level: 0, deptCode: "EXC", jlCode: "MGT", parentPrefix: null, description: "God Mode — มีสิทธิ์สูงสุด ดูและอนุมัติได้ทุกอย่าง" },
      // Level 1
      { prefix: "MD", name: "Managing Director / Board", level: 1, deptCode: "EXC", jlCode: "MGT", parentPrefix: "FND", description: "Top Executive — บริหารภาพรวมบริษัท" },
      // Level 2
      { prefix: "CEO", name: "CEO / President", level: 2, deptCode: "EXC", jlCode: "MGT", parentPrefix: "MD", description: "Chief Executive — ผู้นำสูงสุดด้านปฏิบัติการ" },
      // Level 3 - C-Level
      { prefix: "CFO", name: "Chief Financial Officer (CFO)", level: 3, deptCode: "FIN", jlCode: "FIN", parentPrefix: "CEO", description: "Domain Executive — ควบคุมการเงินทั้งหมด" },
      { prefix: "CTO", name: "Chief Technology Officer (CTO)", level: 3, deptCode: "ENG", jlCode: "ENG", parentPrefix: "CEO", description: "Domain Executive — ควบคุมงานวิศวกรรม" },
      { prefix: "COO", name: "Chief Operating Officer (COO)", level: 3, deptCode: "OPS", jlCode: "PMT", parentPrefix: "CEO", description: "Domain Executive — ควบคุมงานปฏิบัติการ" },
      // Level 4
      { prefix: "DIR", name: "Director / VP", level: 4, deptCode: "OPS", jlCode: "PMT", parentPrefix: "CTO", description: "Department Head — ผู้อำนวยการฝ่าย" },
      // Level 5 - Managers
      { prefix: "MGR", name: "Manager / Project Director", level: 5, deptCode: "OPS", jlCode: "PMT", parentPrefix: "DIR", description: "Management — ผู้จัดการแผนก หรือผู้อำนวยการโครงการ" },
      { prefix: "FIN-MGR", name: "Finance Manager", level: 5, deptCode: "FIN", jlCode: "FIN", parentPrefix: "CFO", description: "Finance Manager — คุมบัญชีและการเงิน" },
      { prefix: "HR-MGR", name: "HR Manager", level: 5, deptCode: "HRA", jlCode: "HRA", parentPrefix: "CEO", description: "HR Manager — คุมทรัพยากรบุคคล" },
      { prefix: "ENG-MGR", name: "Engineering Manager", level: 5, deptCode: "ENG", jlCode: "ENG", parentPrefix: "CTO", description: "Engineering Manager — คุมทีมออกแบบ" },
      // Level 6 - Project Level
      { prefix: "PM", name: "Project Manager (PM)", level: 6, deptCode: "OPS", jlCode: "PMT", parentPrefix: "MGR", description: "Project Lead — ผู้จัดการโครงการ" },
      { prefix: "QS", name: "Quantity Surveyor (QS)", level: 6, deptCode: "ENG", jlCode: "QSE", parentPrefix: "ENG-MGR", description: "QS — ประเมินราคาและต้นทุน" },
      { prefix: "PUR", name: "Purchasing Officer", level: 6, deptCode: "PRO", jlCode: "PRO", parentPrefix: "PM", description: "Purchasing Officer — จัดซื้อวัสดุ" },
      { prefix: "SE", name: "Site Engineer", level: 6, deptCode: "OPS", jlCode: "CST", parentPrefix: "PM", description: "Site Engineer — วิศวกรหน้าไซต์" },
      // Level 7 - Assistant/Senior Officers
      { prefix: "ASM", name: "Assistant Manager / หัวหน้าส่วน", level: 7, deptCode: "OPS", jlCode: "PMT", parentPrefix: "PM", description: "Sub-Lead — รองผู้จัดการ หรือ Chief QS" },
      { prefix: "ARC", name: "Architect", level: 7, deptCode: "ENG", jlCode: "ARC", parentPrefix: "ENG-MGR", description: "Architect — สถาปนิกออกแบบ" },
      // Level 8 - Senior
      { prefix: "SNR", name: "Senior (อาวุโส)", level: 8, deptCode: "OPS", jlCode: "ENG", parentPrefix: "ASM", description: "Senior Professional — Senior Site Engineer, Senior QS" },
      { prefix: "FM", name: "Foreman / Supervisor", level: 8, deptCode: "OPS", jlCode: "CST", parentPrefix: "SE", description: "Site Ops Leader — หัวหน้าคนงาน โฟร์แมน" },
      // Level 9 - Officers
      { prefix: "OFC", name: "Officer (พนักงานระดับกลาง)", level: 9, deptCode: "ENG", jlCode: "ENG", parentPrefix: "SNR", description: "Professional — วิศวกร สถาปนิก พนักงานจัดซื้อ" },
      { prefix: "ACC", name: "Accountant (นักบัญชี)", level: 9, deptCode: "FIN", jlCode: "FIN", parentPrefix: "FIN-MGR", description: "Accountant — บันทึกบัญชี จ่ายเงิน" },
      { prefix: "ADM", name: "Admin Officer", level: 9, deptCode: "HRA", jlCode: "HRA", parentPrefix: "HR-MGR", description: "Admin — ธุรการ เอกสาร" },
      { prefix: "DRF", name: "Draftsman", level: 9, deptCode: "ENG", jlCode: "ARC", parentPrefix: "ARC", description: "Draftsman — ช่างเขียนแบบ" },
      // Level 10 - Junior
      { prefix: "JUN", name: "Junior / Coordinator", level: 10, deptCode: "HRA", jlCode: "HRA", parentPrefix: "OFC", description: "Support — แอดมินไซต์ ธุรการ Document Controller" },
      { prefix: "DC", name: "Document Controller", level: 10, deptCode: "OPS", jlCode: "PMT", parentPrefix: "PM", description: "DC — ควบคุมเอกสารโครงการ" },
      // Level 11-13 - Site Workers
      { prefix: "SPV", name: "Supervisor / หัวหน้าช่าง", level: 11, deptCode: "OPS", jlCode: "CST", parentPrefix: "FM", description: "Supervisor — หัวหน้าช่างเฉพาะทาง" },
      { prefix: "SKL", name: "Skilled Labor (ช่างฝีมือ)", level: 12, deptCode: "OPS", jlCode: "CST", parentPrefix: "SPV", description: "Site Ops Worker — ช่างปูน ช่างไม้ ช่างเหล็ก" },
      { prefix: "LBR", name: "General Labor (คนงานทั่วไป)", level: 13, deptCode: "OPS", jlCode: "CST", parentPrefix: "SPV", description: "Site Ops Basic — กรรมกร" },
      { prefix: "DRV", name: "Driver / Messenger", level: 13, deptCode: "HRA", jlCode: "HRA", parentPrefix: "ADM", description: "Driver — พนักงานขับรถ ส่งเอกสาร" },
    ];

    const roleMap = new Map<string, string>(); // prefix -> id

    // First pass: Create all roles without parent
    for (const role of jobRoles) {
      const existing = await prisma.jobRole.findUnique({ where: { prefix: role.prefix } });
      if (existing) {
        results.jobRoles.existing++;
        roleMap.set(role.prefix, existing.id);
      } else {
        const deptId = deptMap.get(role.deptCode);
        const jlId = jlMap.get(role.jlCode);
        
        if (!deptId || !jlId) {
          console.warn(`Skipping ${role.prefix}: missing dept or jobLine`);
          continue;
        }

        const created = await prisma.jobRole.create({
          data: {
            prefix: role.prefix,
            name: role.name,
            level: role.level,
            departmentId: deptId,
            jobLineId: jlId,
            description: role.description,
          },
        });
        results.jobRoles.created++;
        results.jobRoles.items.push(`${role.prefix} - ${role.name}`);
        roleMap.set(role.prefix, created.id);
      }
    }

    // Second pass: Update parent relationships
    for (const role of jobRoles) {
      if (role.parentPrefix) {
        const roleId = roleMap.get(role.prefix);
        const parentId = roleMap.get(role.parentPrefix);
        
        if (roleId && parentId) {
          await prisma.jobRole.update({
            where: { id: roleId },
            data: { parentRoleId: parentId },
          });
        }
      }
    }

    return NextResponse.json({
      message: "สร้างตำแหน่งงานทั้งหมดสำเร็จ",
      summary: {
        departments: {
          total: results.departments.created + results.departments.existing,
          created: results.departments.created,
          existing: results.departments.existing,
        },
        jobLines: {
          total: results.jobLines.created + results.jobLines.existing,
          created: results.jobLines.created,
          existing: results.jobLines.existing,
        },
        jobRoles: {
          total: results.jobRoles.created + results.jobRoles.existing,
          created: results.jobRoles.created,
          existing: results.jobRoles.existing,
        },
      },
      details: results,
    }, { status: 201 });

  } catch (error) {
    console.error("Seed Positions Error:", error);
    return NextResponse.json(
      { error: "Failed to seed positions", details: (error as Error).message },
      { status: 500 }
    );
  }
}

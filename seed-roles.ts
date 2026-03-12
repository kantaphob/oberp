import 'dotenv/config';
import { prisma } from './app/lib/prisma';

async function main() {
  console.log('🧹 กำลังล้างข้อมูลเก่า (Users, Roles, Permissions)...')
  
  // ล้างข้อมูลตามลำดับความสัมพันธ์ (จากปลายทางมาต้นทาง)
  await prisma.activityLog.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.permission.deleteMany()
  
  // ลบ Hierarchy ของ Roles (ต้องลบความสัมพันธ์ parentRoleId ก่อนในบางกรณี หรือลบทั้งหมด)
  await prisma.jobRole.updateMany({ data: { parentRoleId: null } })
  await prisma.jobRole.deleteMany()

  console.log('🌱 เริ่มต้นการ Seed ข้อมูลโครงสร้างองค์กรใหม่ (14 ระดับ)...')

  // ==========================================================
  // 1. สร้างข้อมูลแผนก (Departments)
  // ==========================================================
  const deptEXC = await prisma.department.upsert({ where: { code: 'EXC' }, update: {}, create: { name: 'บริหารจัดการ (Executive)', code: 'EXC' } })
  const deptOPS = await prisma.department.upsert({ where: { code: 'OPS' }, update: {}, create: { name: 'ปฏิบัติการหน้าไซต์ (Operations)', code: 'OPS' } })
  const deptENG = await prisma.department.upsert({ where: { code: 'ENG' }, update: {}, create: { name: 'วิศวกรรมและออกแบบ (Engineering)', code: 'ENG' } })
  const deptPRO = await prisma.department.upsert({ where: { code: 'PRO' }, update: {}, create: { name: 'จัดซื้อและคลังสินค้า (Procurement)', code: 'PRO' } })
  const deptFIN = await prisma.department.upsert({ where: { code: 'FIN' }, update: {}, create: { name: 'การเงินและบัญชี (Finance)', code: 'FIN' } })
  const deptSAL = await prisma.department.upsert({ where: { code: 'SAL' }, update: {}, create: { name: 'ขายและการตลาด (Sales & Marketing)', code: 'SAL' } })
  const deptHRA = await prisma.department.upsert({ where: { code: 'HRA' }, update: {}, create: { name: 'บุคคลและธุรการ (HR & Admin)', code: 'HRA' } })
  console.log('✅ Seed: Departments สำเร็จ')

  // ==========================================================
  // 2. สร้างข้อมูลสายงาน (Job Lines)
  // ==========================================================
  const jlMGT = await prisma.jobLine.upsert({ where: { code: 'MGT' }, update: {}, create: { name: 'สายงานบริหารองค์กร', code: 'MGT' } })
  const jlPMT = await prisma.jobLine.upsert({ where: { code: 'PMT' }, update: {}, create: { name: 'สายงานบริหารโครงการ', code: 'PMT' } })
  const jlCST = await prisma.jobLine.upsert({ where: { code: 'CST' }, update: {}, create: { name: 'สายงานก่อสร้างและควบคุมงาน', code: 'CST' } })
  const jlENG = await prisma.jobLine.upsert({ where: { code: 'ENG' }, update: {}, create: { name: 'สายงานวิศวกรรม', code: 'ENG' } })
  const jlARC = await prisma.jobLine.upsert({ where: { code: 'ARC' }, update: {}, create: { name: 'สายงานสถาปัตยกรรม', code: 'ARC' } })
  const jlQSE = await prisma.jobLine.upsert({ where: { code: 'QSE' }, update: {}, create: { name: 'สายงานประเมินราคา', code: 'QSE' } })
  const jlPRO = await prisma.jobLine.upsert({ where: { code: 'PRO' }, update: {}, create: { name: 'สายงานจัดซื้อและโลจิสติกส์', code: 'PRO' } })
  const jlFIN = await prisma.jobLine.upsert({ where: { code: 'FIN' }, update: {}, create: { name: 'สายงานบัญชีและการเงิน', code: 'FIN' } })
  const jlSAL = await prisma.jobLine.upsert({ where: { code: 'SAL' }, update: {}, create: { name: 'สายงานขายและการตลาด', code: 'SAL' } })
  const jlHRA = await prisma.jobLine.upsert({ where: { code: 'HRA' }, update: {}, create: { name: 'สายงานบุคคลและธุรการ', code: 'HRA' } })
  console.log('✅ Seed: Job Lines สำเร็จ')

  // ==========================================================
  // 3. สร้างข้อมูลตำแหน่ง (Job Roles) **ตามระดับที่ลูกค้าระบุ (Level 0 - 13)**
  // ==========================================================

  // Level 0: Founder / Co-Founder
  const roleFND = await prisma.jobRole.upsert({
    where: { prefix: 'FND' },
    update: { level: 0, description: 'God Mode (แตะต้องไม่ได้) - มีสิทธิ์สูงสุด ไม่มีใครลบหรือแก้ไขบัญชีนี้ได้ ดูได้ทุกอย่าง อนุมัตได้ทุกอย่าง' },
    create: { name: 'Founder / Co-Founder', prefix: 'FND', level: 0, departmentId: deptEXC.id, jobLineId: jlMGT.id, description: 'God Mode (แตะต้องไม่ได้) - มีสิทธิ์สูงสุด ไม่มีใครลบหรือแก้ไขบัญชีนี้ได้ ดูได้ทุกอย่าง อนุมัตได้ทุกอย่าง' }
  })

  // Level 1: MD / Board
  const roleMD = await prisma.jobRole.upsert({
    where: { prefix: 'MD' },
    update: { level: 1, description: 'Top Executive - บริหารภาพรวมบริษัท สร้าง/แก้ไข CEO ได้ แต่ มองไม่เห็นปุ่มแก้ไขของ Level 0' },
    create: { name: 'Managing Director / Board', prefix: 'MD', level: 1, departmentId: deptEXC.id, jobLineId: jlMGT.id, parentRoleId: roleFND.id, description: 'Top Executive - บริหารภาพรวมบริษัท สร้าง/แก้ไข CEO ได้ แต่ มองไม่เห็นปุ่มแก้ไขของ Level 0' }
  })

  // Level 2: CEO / President
  const roleCEO = await prisma.jobRole.upsert({
    where: { prefix: 'CEO' },
    update: { level: 2, description: 'Chief Executive - ผู้นำสูงสุดในการปฏิบัติการ (Operations) ดูงบได้ทุกโปรเจกต์ แต่ไม่มีสิทธิ์ยุ่งกับข้อมูลของบอร์ดหรือผู้ก่อตั้ง' },
    create: { name: 'CEO / President', prefix: 'CEO', level: 2, departmentId: deptEXC.id, jobLineId: jlMGT.id, parentRoleId: roleMD.id, description: 'Chief Executive - ผู้นำสูงสุดในการปฏิบัติการ (Operations) ดูงบได้ทุกโปรเจกต์ แต่ไม่มีสิทธิ์ยุ่งกับข้อมูลของบอร์ดหรือผู้ก่อตั้ง' }
  })

  // Level 3: C-Level
  const roleCFO = await prisma.jobRole.upsert({
    where: { prefix: 'CFO' },
    update: { level: 3, description: 'Domain Executive - CFO คุมการเงินทั้งหมด สร้างตำแหน่ง VP/Director ลงไปได้' },
    create: { name: 'Chief Financial Officer (CFO)', prefix: 'CFO', level: 3, departmentId: deptFIN.id, jobLineId: jlFIN.id, parentRoleId: roleCEO.id, description: 'Domain Executive - CFO คุมการเงินทั้งหมด สร้างตำแหน่ง VP/Director ลงไปได้' }
  })
  const roleCTO = await prisma.jobRole.upsert({
    where: { prefix: 'CTO' },
    update: { level: 3, description: 'Domain Executive - CTO คุมเทคโนโลยีและวิศวกรรม สร้างตำแหน่ง VP/Director ลงไปได้' },
    create: { name: 'Chief Technology Officer (CTO)', prefix: 'CTO', level: 3, departmentId: deptENG.id, jobLineId: jlENG.id, parentRoleId: roleCEO.id, description: 'Domain Executive - CTO คุมเทคโนโลยีและวิศวกรรม สร้างตำแหน่ง VP/Director ลงไปได้' }
  })

  // Level 4: Director / VP
  const roleDIR = await prisma.jobRole.upsert({
    where: { prefix: 'DIR' },
    update: { level: 4, description: 'Department Head - ผู้อำนวยการฝ่าย (เช่น ผอ.ฝ่ายวิศวกรรม, ผอ.ฝ่ายจัดซื้อ)' },
    create: { name: 'Director / VP', prefix: 'DIR', level: 4, departmentId: deptOPS.id, jobLineId: jlPMT.id, parentRoleId: roleCEO.id, description: 'Department Head - ผู้อำนวยการฝ่าย (เช่น ผอ.ฝ่ายวิศวกรรม, ผอ.ฝ่ายจัดซื้อ)' }
  })

  // Level 5: Manager / Project Director
  const roleMGR = await prisma.jobRole.upsert({
    where: { prefix: 'MGR' },
    update: { level: 5, description: 'Management - ผู้จัดการแผนก หรือผู้อำนวยการโครงการ (คุม PM อีกที)' },
    create: { name: 'Manager / Project Director', prefix: 'MGR', level: 5, departmentId: deptOPS.id, jobLineId: jlPMT.id, parentRoleId: roleDIR.id, description: 'Management - ผู้จัดการแผนก หรือผู้อำนวยการโครงการ (คุม PM อีกที)' }
  })

  // Level 6: Project Manager (PM)
  const rolePM = await prisma.jobRole.upsert({
    where: { prefix: 'PM' },
    update: { level: 6, description: 'Project Lead - ผู้จัดการโครงการ (คุมสิทธิ์หน้าไซต์งานของตัวเองทั้งหมด)' },
    create: { name: 'Project Manager (PM)', prefix: 'PM', level: 6, departmentId: deptOPS.id, jobLineId: jlPMT.id, parentRoleId: roleMGR.id, description: 'Project Lead - ผู้จัดการโครงการ (คุมสิทธิ์หน้าไซต์งานของตัวเองทั้งหมด)' }
  })

  // Level 7: Assistant Manager
  const roleASM = await prisma.jobRole.upsert({
    where: { prefix: 'ASM' },
    update: { level: 7, description: 'Sub-Lead - รองผู้จัดการ หรือ หัวหน้าส่วนงานประเมินราคา (Chief QS)' },
    create: { name: 'Assistant Manager / หัวหน้าส่วน', prefix: 'ASM', level: 7, departmentId: deptOPS.id, jobLineId: jlPMT.id, parentRoleId: rolePM.id, description: 'Sub-Lead - รองผู้จัดการ หรือ หัวหน้าส่วนงานประเมินราคา (Chief QS)' }
  })

  // Level 8: Senior
  const roleSNR = await prisma.jobRole.upsert({
    where: { prefix: 'SNR' },
    update: { level: 8, description: 'Senior Professional - Senior Site Engineer, Senior QS (คนที่มีอำนาจตัดสินใจในงานเทคนิค)' },
    create: { name: 'Senior (อาวุโส)', prefix: 'SNR', level: 8, departmentId: deptOPS.id, jobLineId: jlENG.id, parentRoleId: rolePM.id, description: 'Senior Professional - Senior Site Engineer, Senior QS (คนที่มีอำนาจตัดสินใจในงานเทคนิค)' }
  })

  // Level 9: Officer
  const roleOFC = await prisma.jobRole.upsert({
    where: { prefix: 'OFC' },
    update: { level: 9, description: 'Professional - วิศวกร, สถาปนิก, พนักงานจัดซื้อ, พนักงานบัญชี' },
    create: { name: 'Officer (พนักงานระดับกลาง)', prefix: 'OFC', level: 9, departmentId: deptENG.id, jobLineId: jlENG.id, parentRoleId: roleSNR.id, description: 'Professional - วิศวกร, สถาปนิก, พนักงานจัดซื้อ, พนักงานบัญชี' }
  })

  // Level 10: Junior
  const roleJUN = await prisma.jobRole.upsert({
    where: { prefix: 'JUN' },
    update: { level: 10, description: 'Support - แอดมินไซต์, ธุรการ, Document Controller (เน้นคีย์ข้อมูล)' },
    create: { name: 'Junior / Coordinator', prefix: 'JUN', level: 10, departmentId: deptHRA.id, jobLineId: jlHRA.id, parentRoleId: roleOFC.id, description: 'Support - แอดมินไซต์, ธุรการ, Document Controller (เน้นคีย์ข้อมูล)' }
  })

  // Level 11: Foreman
  const roleFM = await prisma.jobRole.upsert({
    where: { prefix: 'FM' },
    update: { level: 11, description: 'Site Ops - Leader - หัวหน้าคนงาน, โฟร์แมน (ดูเฉพาะงานหน้าไซต์ เบิกของ)' },
    create: { name: 'Foreman / Supervisor', prefix: 'FM', level: 11, departmentId: deptOPS.id, jobLineId: jlCST.id, parentRoleId: rolePM.id, description: 'Site Ops - Leader - หัวหน้าคนงาน, โฟร์แมน (ดูเฉพาะงานหน้าไซต์ เบิกของ)' }
  })

  // Level 12: Skilled Labor
  const roleSKL = await prisma.jobRole.upsert({
    where: { prefix: 'SKL' },
    update: { level: 12, description: 'Site Ops - Worker - ช่างปูน, ช่างไม้ (ลงเวลาเข้างาน, รับมอบหมาย Task)' },
    create: { name: 'Skilled Labor (ช่างฝีมือ)', prefix: 'SKL', level: 12, departmentId: deptOPS.id, jobLineId: jlCST.id, parentRoleId: roleFM.id, description: 'Site Ops - Worker - ช่างปูน, ช่างไม้ (ลงเวลาเข้างาน, รับมอบหมาย Task)' }
  })

  // Level 13: General Labor
  const roleLBR = await prisma.jobRole.upsert({
    where: { prefix: 'LBR' },
    update: { level: 13, description: 'Site Ops - Basic - กรรมกร (มีแค่โปรไฟล์ในระบบให้ HR ทำเงินเดือน ไม่ต้องมีรหัส Login)' },
    create: { name: 'General Labor (คนงานทั่วไป)', prefix: 'LBR', level: 13, departmentId: deptOPS.id, jobLineId: jlCST.id, parentRoleId: roleFM.id, description: 'Site Ops - Basic - กรรมกร (มีแค่โปรไฟล์ในระบบให้ HR ทำเงินเดือน ไม่ต้องมีรหัส Login)' }
  })

  console.log('✅ Seed: Job Roles (14 ระดับ) สำเร็จ')

  // ลบทิ้งหรืออัปเดตตำแหน่งเก่าๆ ที่ไม่อยู่ในสารบบใหม่ (ถ้าจำเป็น)
  // ในที่นี้จะปล่อยไว้ก่อน หรืออาจจะลบถ้าแน่ใจว่าไม่ได้ใช้งานแล้ว
  
  console.log('🎉 ข้อมูล Master Data โครงสร้างองค์กรใหม่พร้อมใช้งานแล้ว!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


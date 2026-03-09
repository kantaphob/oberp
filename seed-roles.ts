import 'dotenv/config';
import { prisma } from './app/lib/prisma';

async function main() {
  console.log('🌱 เริ่มต้นการ Seed ข้อมูล...')

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
  // 3. สร้างข้อมูลตำแหน่ง (Job Roles) **เรียงลำดับจากบนลงล่าง Top-Down**
  // ==========================================================
  
  // Level 0: MD
  const roleMD = await prisma.jobRole.upsert({
    where: { prefix: 'MD' },
    update: {},
    create: { name: 'Managing Director', prefix: 'MD', level: 0, departmentId: deptEXC.id, jobLineId: jlMGT.id }
  })

  // Level 1: GM
  const roleGM = await prisma.jobRole.upsert({
    where: { prefix: 'GM' },
    update: {},
    create: { name: 'General Manager', prefix: 'GM', level: 1, departmentId: deptEXC.id, jobLineId: jlMGT.id, parentRoleId: roleMD.id }
  })

  // Level 2: PD (Project Director)
  const rolePD = await prisma.jobRole.upsert({
    where: { prefix: 'PD' },
    update: {},
    create: { name: 'Project Director', prefix: 'PD', level: 2, departmentId: deptOPS.id, jobLineId: jlPMT.id, parentRoleId: roleGM.id }
  })

  // Level 3: Managers ของแต่ละแผนก
  const rolePM = await prisma.jobRole.upsert({
    where: { prefix: 'PM' }, update: {},
    create: { name: 'Project Manager', prefix: 'PM', level: 3, departmentId: deptOPS.id, jobLineId: jlPMT.id, parentRoleId: rolePD.id }
  })
  const roleDM = await prisma.jobRole.upsert({
    where: { prefix: 'DM' }, update: {},
    create: { name: 'Design Manager', prefix: 'DM', level: 3, departmentId: deptENG.id, jobLineId: jlARC.id, parentRoleId: roleGM.id }
  })
  const roleQSM = await prisma.jobRole.upsert({
    where: { prefix: 'QSM' }, update: {},
    create: { name: 'QS Manager', prefix: 'QSM', level: 3, departmentId: deptENG.id, jobLineId: jlQSE.id, parentRoleId: roleGM.id }
  })
  const rolePROM = await prisma.jobRole.upsert({
    where: { prefix: 'PROM' }, update: {},
    create: { name: 'Procurement Manager', prefix: 'PROM', level: 3, departmentId: deptPRO.id, jobLineId: jlPRO.id, parentRoleId: roleGM.id }
  })
  const roleFINM = await prisma.jobRole.upsert({
    where: { prefix: 'FINM' }, update: {},
    create: { name: 'Finance Manager', prefix: 'FINM', level: 3, departmentId: deptFIN.id, jobLineId: jlFIN.id, parentRoleId: roleGM.id }
  })
  const roleHRM = await prisma.jobRole.upsert({
    where: { prefix: 'HRM' }, update: {},
    create: { name: 'HR Manager', prefix: 'HRM', level: 3, departmentId: deptHRA.id, jobLineId: jlHRA.id, parentRoleId: roleGM.id }
  })

  // Level 4: ผู้ช่วยผู้จัดการ (Assistant Managers)
  const roleAPM = await prisma.jobRole.upsert({
    where: { prefix: 'APM' }, update: {},
    create: { name: 'Asst. Project Manager', prefix: 'APM', level: 4, departmentId: deptOPS.id, jobLineId: jlPMT.id, parentRoleId: rolePM.id }
  })

  // Level 5-6: Senior & Specialist
  const roleS_ARC = await prisma.jobRole.upsert({
    where: { prefix: 'S-ARC' }, update: {},
    create: { name: 'Senior Architect', prefix: 'S-ARC', level: 5, departmentId: deptENG.id, jobLineId: jlARC.id, parentRoleId: roleDM.id }
  })
  const roleARC = await prisma.jobRole.upsert({
    where: { prefix: 'ARC' }, update: {},
    create: { name: 'Architect', prefix: 'ARC', level: 6, departmentId: deptENG.id, jobLineId: jlARC.id, parentRoleId: roleS_ARC.id }
  })
  const roleS_SE = await prisma.jobRole.upsert({
    where: { prefix: 'S-SE' }, update: {},
    create: { name: 'Senior Site Engineer', prefix: 'S-SE', level: 5, departmentId: deptOPS.id, jobLineId: jlENG.id, parentRoleId: rolePM.id }
  })
  const roleSE = await prisma.jobRole.upsert({
    where: { prefix: 'SE' }, update: {},
    create: { name: 'Site Engineer', prefix: 'SE', level: 6, departmentId: deptOPS.id, jobLineId: jlENG.id, parentRoleId: roleS_SE.id }
  })
  const roleQS = await prisma.jobRole.upsert({
    where: { prefix: 'QS' }, update: {},
    create: { name: 'Quantity Surveyor', prefix: 'QS', level: 6, departmentId: deptENG.id, jobLineId: jlQSE.id, parentRoleId: roleQSM.id }
  })
  const roleACC = await prisma.jobRole.upsert({
    where: { prefix: 'ACC' }, update: {},
    create: { name: 'Accountant', prefix: 'ACC', level: 6, departmentId: deptFIN.id, jobLineId: jlFIN.id, parentRoleId: roleFINM.id }
  })

  // Level 7-8: Supervisor & Officer
  const rolePUR = await prisma.jobRole.upsert({
    where: { prefix: 'PUR' }, update: {},
    create: { name: 'Purchaser', prefix: 'PUR', level: 7, departmentId: deptPRO.id, jobLineId: jlPRO.id, parentRoleId: rolePROM.id }
  })
  const roleFM = await prisma.jobRole.upsert({
    where: { prefix: 'FM' }, update: {},
    create: { name: 'Foreman', prefix: 'FM', level: 8, departmentId: deptOPS.id, jobLineId: jlCST.id, parentRoleId: roleSE.id }
  })
  const roleSTR = await prisma.jobRole.upsert({
    where: { prefix: 'STR' }, update: {},
    create: { name: 'Store / Inventory', prefix: 'STR', level: 8, departmentId: deptPRO.id, jobLineId: jlPRO.id, parentRoleId: rolePUR.id }
  })

  // Level 9-10: General Staff & Worker
  const roleADM = await prisma.jobRole.upsert({
    where: { prefix: 'ADM' }, update: {},
    create: { name: 'Admin', prefix: 'ADM', level: 9, departmentId: deptHRA.id, jobLineId: jlHRA.id, parentRoleId: roleHRM.id }
  })
  const roleGW = await prisma.jobRole.upsert({
    where: { prefix: 'GW' }, update: {},
    create: { name: 'General Worker', prefix: 'GW', level: 10, departmentId: deptOPS.id, jobLineId: jlCST.id, parentRoleId: roleFM.id }
  })

  console.log('✅ Seed: Job Roles สำเร็จ')
  console.log('🎉 ข้อมูล Master Data โครงสร้างองค์กรพร้อมใช้งานแล้ว!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

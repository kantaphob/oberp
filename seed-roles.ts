import 'dotenv/config';
import { prisma } from './app/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ ห้ามรัน Seed ใน Production!');
  }

  console.log('🚀 Full Reset & Re-seed Org Structure\n');

  // =========================================
  // 🧹 PHASE 1: Full Reset
  // =========================================
  console.log('🧹 1/5 ลบข้อมูลเก่าทั้งหมด...');
  await prisma.activityLog.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.pendingAction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.jobRole.updateMany({ data: { parentRoleId: null } });
  await prisma.jobRole.deleteMany();
  await prisma.department.deleteMany();
  await prisma.jobLine.deleteMany();
  console.log('   ✅ ล้างข้อมูลเก่าสำเร็จ\n');

  // =========================================
  // 🏢 PHASE 2: Departments
  // =========================================
  console.log('🏢 2/5 สร้างแผนก...');
  const deptEXC = await prisma.department.create({ data: { name: 'บริหารจัดการ (Executive)', code: 'EXC' } });
  const deptOPS = await prisma.department.create({ data: { name: 'ปฏิบัติการหน้าไซต์ (Operations)', code: 'OPS' } });
  const deptENG = await prisma.department.create({ data: { name: 'วิศวกรรมและออกแบบ (Engineering)', code: 'ENG' } });
  const deptPRO = await prisma.department.create({ data: { name: 'จัดซื้อและคลังสินค้า (Procurement)', code: 'PRO' } });
  const deptFIN = await prisma.department.create({ data: { name: 'การเงินและบัญชี (Finance)', code: 'FIN' } });
  await prisma.department.create({ data: { name: 'ขายและการตลาด (Sales)', code: 'SAL' } });
  const deptHRA = await prisma.department.create({ data: { name: 'บุคคลและธุรการ (HR)', code: 'HRA' } });
  await prisma.department.create({ data: { name: 'บริการหลังการขาย (Service)', code: 'SVC' } });
  console.log('   ✅ 8 แผนก\n');

  // =========================================
  // 🛤️ PHASE 3: Job Lines
  // =========================================
  console.log('🛤️ 3/5 สร้างสายงาน...');
  const jlMGT = await prisma.jobLine.create({ data: { name: 'สายงานบริหารองค์กร', code: 'MGT' } });
  const jlPMT = await prisma.jobLine.create({ data: { name: 'สายงานบริหารโครงการ', code: 'PMT' } });
  const jlCST = await prisma.jobLine.create({ data: { name: 'สายงานก่อสร้างและควบคุมงาน', code: 'CST' } });
  const jlENG = await prisma.jobLine.create({ data: { name: 'สายงานวิศวกรรม', code: 'ENG' } });
  await prisma.jobLine.create({ data: { name: 'สายงานสถาปัตยกรรม', code: 'ARC' } });
  await prisma.jobLine.create({ data: { name: 'สายงานประเมินราคา', code: 'QSE' } });
  const jlPRO = await prisma.jobLine.create({ data: { name: 'สายงานจัดซื้อและโลจิสติกส์', code: 'PRO' } });
  const jlFIN = await prisma.jobLine.create({ data: { name: 'สายงานบัญชีและการเงิน', code: 'FIN' } });
  const jlHRA = await prisma.jobLine.create({ data: { name: 'สายงานบุคคลและธุรการ', code: 'HRA' } });
  console.log('   ✅ 9 สายงาน\n');

  // =========================================
  // 🌳 PHASE 4: Job Roles (14 ระดับ)
  // =========================================
  console.log('🌳 4/5 สร้างแผนผังองค์กร (14 ระดับ)...');

  const roleFND = await prisma.jobRole.create({
    data: { name: 'Founder / Co-Founder', prefix: 'FND', level: 0, departmentId: deptEXC.id, jobLineId: jlMGT.id, description: 'God Mode — มีสิทธิ์สูงสุด ดูและอนุมัติได้ทุกอย่าง' }
  });
  const roleMD = await prisma.jobRole.create({
    data: { name: 'Managing Director / Board', prefix: 'MD', level: 1, departmentId: deptEXC.id, jobLineId: jlMGT.id, parentRoleId: roleFND.id, description: 'Top Executive — บริหารภาพรวมบริษัท' }
  });
  const roleCEO = await prisma.jobRole.create({
    data: { name: 'CEO / President', prefix: 'CEO', level: 2, departmentId: deptEXC.id, jobLineId: jlMGT.id, parentRoleId: roleMD.id, description: 'Chief Executive — ผู้นำสูงสุดด้านปฏิบัติการ' }
  });
  const roleCFO = await prisma.jobRole.create({
    data: { name: 'Chief Financial Officer (CFO)', prefix: 'CFO', level: 3, departmentId: deptFIN.id, jobLineId: jlFIN.id, parentRoleId: roleCEO.id, description: 'Domain Executive — ควบคุมการเงินทั้งหมด' }
  });
  const roleCTO = await prisma.jobRole.create({
    data: { name: 'Chief Technology Officer (CTO)', prefix: 'CTO', level: 3, departmentId: deptENG.id, jobLineId: jlENG.id, parentRoleId: roleCEO.id, description: 'Domain Executive — ควบคุมงานวิศวกรรม' }
  });
  const roleDIR = await prisma.jobRole.create({
    data: { name: 'Director / VP', prefix: 'DIR', level: 4, departmentId: deptOPS.id, jobLineId: jlPMT.id, parentRoleId: roleCTO.id, description: 'Department Head — ผู้อำนวยการฝ่าย' }
  });
  const roleMGR = await prisma.jobRole.create({
    data: { name: 'Manager / Project Director', prefix: 'MGR', level: 5, departmentId: deptOPS.id, jobLineId: jlPMT.id, parentRoleId: roleDIR.id, description: 'Management — ผู้จัดการแผนก หรือผู้อำนวยการโครงการ' }
  });
  const rolePM = await prisma.jobRole.create({
    data: { name: 'Project Manager (PM)', prefix: 'PM', level: 6, departmentId: deptOPS.id, jobLineId: jlPMT.id, parentRoleId: roleMGR.id, description: 'Project Lead — ผู้จัดการโครงการ' }
  });
  const roleASM = await prisma.jobRole.create({
    data: { name: 'Assistant Manager / หัวหน้าส่วน', prefix: 'ASM', level: 7, departmentId: deptOPS.id, jobLineId: jlPMT.id, parentRoleId: rolePM.id, description: 'Sub-Lead — รองผู้จัดการ หรือ Chief QS' }
  });
  const roleSNR = await prisma.jobRole.create({
    data: { name: 'Senior (อาวุโส)', prefix: 'SNR', level: 8, departmentId: deptOPS.id, jobLineId: jlENG.id, parentRoleId: roleASM.id, description: 'Senior Professional — Senior Site Engineer, Senior QS' }
  });
  const roleOFC = await prisma.jobRole.create({
    data: { name: 'Officer (พนักงานระดับกลาง)', prefix: 'OFC', level: 9, departmentId: deptENG.id, jobLineId: jlENG.id, parentRoleId: roleSNR.id, description: 'Professional — วิศวกร สถาปนิก พนักงานจัดซื้อ' }
  });
  await prisma.jobRole.create({
    data: { name: 'Junior / Coordinator', prefix: 'JUN', level: 10, departmentId: deptHRA.id, jobLineId: jlHRA.id, parentRoleId: roleOFC.id, description: 'Support — แอดมินไซต์ ธุรการ Document Controller' }
  });
  const roleFM = await prisma.jobRole.create({
    data: { name: 'Foreman / Supervisor', prefix: 'FM', level: 11, departmentId: deptOPS.id, jobLineId: jlCST.id, parentRoleId: rolePM.id, description: 'Site Ops Leader — หัวหน้าคนงาน โฟร์แมน' }
  });
  await prisma.jobRole.create({
    data: { name: 'Skilled Labor (ช่างฝีมือ)', prefix: 'SKL', level: 12, departmentId: deptOPS.id, jobLineId: jlCST.id, parentRoleId: roleFM.id, description: 'Site Ops Worker — ช่างปูน ช่างไม้' }
  });
  await prisma.jobRole.create({
    data: { name: 'General Labor (คนงานทั่วไป)', prefix: 'LBR', level: 13, departmentId: deptOPS.id, jobLineId: jlCST.id, parentRoleId: roleFM.id, description: 'Site Ops Basic — กรรมกร ไม่ต้องมีรหัส Login' }
  });
  // Finance branch under CFO
  const roleFinMgr = await prisma.jobRole.create({
    data: { name: 'Finance Manager', prefix: 'FIN-MGR', level: 5, departmentId: deptFIN.id, jobLineId: jlFIN.id, parentRoleId: roleCFO.id, description: 'Finance Manager — คุมบัญชีและการเงิน' }
  });
  await prisma.jobRole.create({
    data: { name: 'Accountant (นักบัญชี)', prefix: 'ACC', level: 9, departmentId: deptFIN.id, jobLineId: jlFIN.id, parentRoleId: roleFinMgr.id, description: 'Accountant — บันทึกบัญชี จ่ายเงิน' }
  });
  // Procurement branch under PM
  await prisma.jobRole.create({
    data: { name: 'Purchasing Officer', prefix: 'PUR', level: 9, departmentId: deptPRO.id, jobLineId: jlPRO.id, parentRoleId: rolePM.id, description: 'Purchasing Officer — จัดซื้อวัสดุ' }
  });
  console.log('   ✅ 17 ตำแหน่ง (Level 0–13 + Finance & Procurement branches)\n');

  // =========================================
  // 👤 PHASE 5: Founder User
  // =========================================
  console.log('👤 5/5 สร้าง Founder User...');
  const hashedPassword = await bcrypt.hash('Roots', 10);
  await prisma.user.create({
    data: {
      username: 'FND291202',
      passwordHash: hashedPassword,
      status: 'ACTIVE',
      roleId: roleFND.id,
    }
  });
  console.log('   ✅ FND291202 / Roots (Level 0)\n');

  console.log('═'.repeat(50));
  console.log('🎉 Full Reset & Re-seed สำเร็จ!');
  console.log('   🏢 8 Departments');
  console.log('   🛤️  9 Job Lines');
  console.log('   🌳 17 Job Roles (Level 0–13)');
  console.log('   👤 FND291202 / Roots');
  console.log('═'.repeat(50));
}

main()
  .catch((e) => {
    console.error('\n❌ พบข้อผิดพลาด:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

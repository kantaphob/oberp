import 'dotenv/config';
import { prisma } from './app/lib/prisma';

async function main() {
  console.log('🌱 เริ่มต้นการ Seed ข้อมูลเพิ่มเติม (HSE, QC, Sales, Surveyor)...');

  // 1. New JobLines
  const jlHSE = await prisma.jobLine.upsert({ 
    where: { code: 'HSE' }, 
    update: {}, 
    create: { name: 'สายงานความปลอดภัยและสิ่งแวดล้อม', code: 'HSE', description: 'ดูแลความปลอดภัย งาน จป.' } 
  });
  
  const jlQAC = await prisma.jobLine.upsert({ 
    where: { code: 'QAC' }, 
    update: {}, 
    create: { name: 'สายงานควบคุมคุณภาพ', code: 'QAC', description: 'ตรวจสอบคุณภาพงาน QA/QC' } 
  });
  
  // Existing JobLines
  const jlENG = await prisma.jobLine.findUnique({ where: { code: 'ENG' } });
  const jlSAL = await prisma.jobLine.findUnique({ where: { code: 'SAL' } });

  // 2. Departments
  const deptOPS = await prisma.department.findUnique({ where: { code: 'OPS' } });
  const deptSAL = await prisma.department.findUnique({ where: { code: 'SAL' } });

  // 3. Parent Roles
  const rolePD = await prisma.jobRole.findUnique({ where: { prefix: 'PD' } });
  const rolePM = await prisma.jobRole.findUnique({ where: { prefix: 'PM' } });
  const roleGM = await prisma.jobRole.findUnique({ where: { prefix: 'GM' } });
  const roleSE = await prisma.jobRole.findUnique({ where: { prefix: 'SE' } });

  if (!deptOPS || !jlSAL || !deptSAL || !rolePD || !rolePM || !roleGM || !roleSE || !jlENG) {
    throw new Error('Missing prerequisite data in DB. Ensure you run seed-roles.ts first.');
  }

  // ==========================================
  // Group 1: Safety / HSE
  // ==========================================
  const roleSAFM = await prisma.jobRole.upsert({
    where: { prefix: 'SAFM' },
    update: {},
    create: { name: 'Safety Manager', prefix: 'SAFM', level: 3, description: 'จป. ระดับบริหาร', departmentId: deptOPS.id, jobLineId: jlHSE.id, parentRoleId: rolePD.id }
  });

  const roleHSE = await prisma.jobRole.upsert({
    where: { prefix: 'HSE' },
    update: {},
    create: { name: 'Safety Officer (จป.)', prefix: 'HSE', level: 6, description: 'จป. วิชาชีพ / จป. เทคนิค', departmentId: deptOPS.id, jobLineId: jlHSE.id, parentRoleId: roleSAFM.id }
  });

  // ==========================================
  // Group 2: QA/QC
  // ==========================================
  const roleQC = await prisma.jobRole.upsert({
    where: { prefix: 'QC' },
    update: {},
    create: { name: 'QA/QC Engineer', prefix: 'QC', level: 6, description: 'วิศวกรควบคุมคุณภาพ', departmentId: deptOPS.id, jobLineId: jlQAC.id, parentRoleId: rolePM.id }
  });

  // ==========================================
  // Group 3: Sales Team
  // ==========================================
  const roleSM = await prisma.jobRole.upsert({
    where: { prefix: 'SM' },
    update: {},
    create: { name: 'Sales & Marketing Manager', prefix: 'SM', level: 3, departmentId: deptSAL.id, jobLineId: jlSAL.id, parentRoleId: roleGM.id }
  });
  
  const roleSALE = await prisma.jobRole.upsert({
    where: { prefix: 'SALE' },
    update: {},
    create: { name: 'Sales Executive', prefix: 'SALE', level: 6, description: 'เซลส์โปรเจกต์', departmentId: deptSAL.id, jobLineId: jlSAL.id, parentRoleId: roleSM.id }
  });

  // ==========================================
  // Group 4: Surveyor
  // ==========================================
  const roleSUR = await prisma.jobRole.upsert({
    where: { prefix: 'SUR' },
    update: {},
    create: { name: 'Surveyor', prefix: 'SUR', level: 7, description: 'ช่างสำรวจ/ช่างรังวัด', departmentId: deptOPS.id, jobLineId: jlENG.id, parentRoleId: roleSE.id }
  });

  console.log('✅ Seed: Additional Job Roles สำเร็จ');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

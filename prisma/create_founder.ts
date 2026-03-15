import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

async function createFounder() {
  console.log('🚀 เริ่มต้นการสร้างผู้ใช้ Founder...');

  const username = 'FND291202';
  const plainPassword = 'Roots';
  const firstName = 'ชยณัฐวรเดช';
  const lastName = 'ธะรงค์';

  // 1. ค้นหา Role และ Department
  const role = await prisma.jobRole.findFirst({ where: { name: 'Founder / Co-Founder' } });
  const dept = await prisma.department.findFirst({ where: { name: 'บริหารจัดการ (Executive)' } });

  if (!role || !dept) {
    throw new Error('ไม่พบ Role หรือ Department ที่ระบุ');
  }

  // 2. Hash Password
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // 3. สร้าง User
  const user = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
      roleId: role.id,
      status: 'ACTIVE',
      hasProfile: true
    },
    create: {
      username,
      passwordHash,
      roleId: role.id,
      status: 'ACTIVE',
      hasProfile: true
    }
  });

  console.log(`✅ จัดการ User @${username} สำเร็จ`);

  // 4. สร้าง UserProfile
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      firstName,
      lastName,
      departmentId: dept.id,
      roleId: role.id,
    },
    create: {
      userId: user.id,
      firstName,
      lastName,
      departmentId: dept.id,
      roleId: role.id,
      taxId: '0000000000000', // Dummy
      telephoneNumber: '0000000000', // Dummy
      addressDetail: 'Head Office',
    }
  });

  console.log(`✅ จัดการ UserProfile สำหรับ ${firstName} ${lastName} สำเร็จ`);
  console.log('🎉 เสร็จสมบูรณ์!');
}

createFounder()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาด:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

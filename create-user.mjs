import bcrypt from 'bcrypt';
import { PrismaClient } from './app/generated/prisma/index.js';

const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

const username = process.argv[2] || 'FND291295';
const plainPassword = process.argv[3] || 'ohmspkNtr';

async function main() {
  const role = await prisma.jobRole.findFirst({ where: { level: 0 } });
  if (!role) {
    throw new Error('ไม่พบ JobRole ระดับ 0 (Level 0) ในฐานข้อมูล');
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    await prisma.user.update({
      where: { username },
      data: {
        passwordHash,
        status: 'ACTIVE',
        roleId: role.id,
      },
    });
    console.log(`อัปเดตผู้ใช้ ${username} แล้ว (ตั้ง Level 0 และรีเซ็ตรหัสผ่าน)`);
  } else {
    await prisma.user.create({
      data: {
        username,
        passwordHash,
        status: 'ACTIVE',
        roleId: role.id,
      },
    });
    console.log(`สร้างผู้ใช้ ${username} สำเร็จ (Level 0)`);
  }
}

main()
  .catch((e) => {
    console.error('เกิดข้อผิดพลาด:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

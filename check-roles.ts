import { prisma } from './app/lib/prisma';

async function main() {
  const roles = await prisma.jobRole.findMany({
    orderBy: { level: 'asc' },
    select: {
      prefix: true,
      name: true,
      level: true,
      parentRole: { select: { prefix: true } },
      _count: { select: { users: true } }
    }
  });

  console.log('\n📋 Job Roles ใน DB ปัจจุบัน:\n');
  console.log('Lvl\tPrefix\t\tParent\t\tUsers\tName');
  console.log('─'.repeat(80));
  roles.forEach(r => {
    const parent = r.parentRole?.prefix ?? '(root)';
    console.log(`${r.level}\t${r.prefix.padEnd(10)}\t${parent.padEnd(12)}\t${r._count.users}\t${r.name}`);
  });
  console.log('\nรวม:', roles.length, 'ตำแหน่ง');
  await prisma.$disconnect();
}

main().catch(console.error);

const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

async function checkData() {
  const rolesNodept = await prisma.jobRole.count({ where: { departmentId: null } });
  console.log('Roles with no department count:', rolesNodept);
  
  const user = await prisma.user.findUnique({ where: { id: "hr-uuid-123" } });
  console.log('User hr-uuid-123 exists:', !!user);
}

checkData();

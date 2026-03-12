import { PrismaClient } from './app/generated/prisma/index.js';

async function checkUser() {
  const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });
  const user = await prisma.user.findFirst({
    where: { username: 'md260001' },
    include: { role: true }
  });
  console.log("User details:", JSON.stringify(user, null, 2));
}

checkUser().catch(console.error);

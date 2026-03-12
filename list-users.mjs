import { PrismaClient } from './app/generated/prisma/index.js';

async function listUsers() {
  const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });
  const users = await prisma.user.findMany({ select: { username: true, email: true, status: true, id: true } });
  console.log("Users:", users);
}

listUsers().catch(console.error);

import { PrismaClient } from '../generated/prisma';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

console.log("Prisma Models Initialized:", Object.keys(prisma).filter(k => !k.startsWith("_")));

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

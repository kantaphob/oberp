import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
            globalForPrisma.prisma ||
            new PrismaClient({
                        // ✅ นำ URL แบบ Pooler มาใส่ตรงนี้เพื่อให้แอปพลิเคชันทำงานได้เร็วและรับโหลดได้เยอะ
                        datasourceUrl: process.env.DATABASE_URL,
            });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
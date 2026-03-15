import { PrismaClient } from './app/generated/prisma';

async function test() {
  const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
  });
  try {
    const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("Tables in DB:", result);
  } catch (error) {
    console.error("Query Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();

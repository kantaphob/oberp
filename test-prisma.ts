import { PrismaClient } from './app/generated/prisma';

async function test() {
  const prisma = new PrismaClient();
  try {
    const config = await prisma.payrollConfig.findFirst();
    console.log("Success! Config found or null:", config);
  } catch (error) {
    console.error("Prisma Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();

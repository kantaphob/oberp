import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

const companyServices = [
  {
    code: 'SRV-CON',
    name: 'รับเหมาก่อสร้าง (Construction)',
    description: 'งานก่อสร้างอาคาร บ้านใหม่ คอนโด ตั้งแต่โครงสร้างจนจบงาน'
  },
  {
    code: 'SRV-EXT',
    name: 'ต่อเติม (Extension)',
    description: 'งานต่อเติมพื้นที่จากโครงสร้างเดิม เช่น ต่อเติมครัว โรงจอดรถ'
  },
  {
    code: 'SRV-REN',
    name: 'รีโนเวท (Renovation)',
    description: 'งานปรับปรุง ซ่อมแซม และตกแต่งใหม่บนโครงสร้างเดิม'
  },
  {
    code: 'SRV-DES',
    name: 'ออกแบบ (Design)',
    description: 'งานบริการออกแบบสถาปัตยกรรม ภายใน และเขียนแบบ'
  },
  {
    code: 'SRV-INS',
    name: 'ตรวจบ้าน (Home Inspection)',
    description: 'งานบริการตรวจรับบ้าน คอนโด ก่อนโอน หรือตรวจรอยร้าว'
  },
  {
    code: 'SRV-OTH',
    name: 'อื่นๆ (Others)',
    description: 'งานบริการพิเศษ งานจิปาถะ หรือโปรเจกต์ที่ยังไม่ระบุหมวดหมู่ชัดเจน'
  },
];

async function seedServices() {
  console.log('🌱 Seeding company services...');

  try {
    // Clear existing services
    await prisma.serviceUs.deleteMany();
    console.log('🗑️  Cleared existing services');

    // Insert new services
    for (const service of companyServices) {
      await prisma.serviceUs.create({
        data: {
          ...service,
          isActive: true,
        },
      });
      console.log(`✅ Created service: ${service.code} - ${service.name}`);
    }

    console.log('🎉 Services seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  }
}

async function main() {
  await seedServices();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

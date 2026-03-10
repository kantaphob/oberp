import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const mockServices = [
  {
    code: 'SRV-CON',
    name: 'รับเหมาก่อสร้าง (Construction)',
    description: 'งานก่อสร้างอาคาร บ้านใหม่ คอนโด ตั้งแต่โครงสร้างจนจบงาน',
    isActive: true,
  },
  {
    code: 'SRV-EXT',
    name: 'ต่อเติม (Extension)',
    description: 'งานต่อเติมพื้นที่จากโครงสร้างเดิม เช่น ต่อเติมครัว โรงจอดรถ',
    isActive: true,
  },
  {
    code: 'SRV-REN',
    name: 'รีโนเวท (Renovation)',
    description: 'งานปรับปรุง ซ่อมแซม และตกแต่งใหม่บนโครงสร้างเดิม',
    isActive: true,
  },
  {
    code: 'SRV-DES',
    name: 'ออกแบบ (Design)',
    description: 'งานบริการออกแบบสถาปัตยกรรม ภายใน และเขียนแบบ',
    isActive: true,
  },
  {
    code: 'SRV-INS',
    name: 'ตรวจบ้าน (Home Inspection)',
    description: 'งานบริการตรวจรับบ้าน คอนโด ก่อนโอน หรือตรวจรอยร้าว',
    isActive: true,
  },
  {
    code: 'SRV-OTH',
    name: 'อื่นๆ (Others)',
    description: 'งานบริการพิเศษ งานจิปาถะ หรือโปรเจกต์ที่ยังไม่ระบุหมวดหมู่ชัดเจน',
    isActive: true,
  },
];

async function main() {
  const { prisma } = await import('../app/lib/prisma') as any;
  for (const { code, name, description, isActive } of mockServices) {
    const existing = await prisma.serviceUs.findUnique({
      where: { code }
    });
    if (!existing) {
      await prisma.serviceUs.create({
        data: {
          code,
          name,
          description,
          isActive
        }
      });
      console.log(`Created service ${code}`);
    } else {
      await prisma.serviceUs.update({
        where: { code },
        data: { name, description, isActive }
      });
      console.log(`Updated service ${code}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    console.log('Done');
  });

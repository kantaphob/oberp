import 'dotenv/config';
import { prisma } from './app/lib/prisma';

async function main() {
  const departments = [
    {
      code: 'EXC',
      name: 'ฝ่ายบริหารงาน (Executive & Board)',
      description: 'กำหนดนโยบาย อนุมัติงบประมาณโครงการภาพรวม และเซ็นสัญญาอนุมัติขั้นสูงสุด | ตำแหน่ง: Managing Director (MD), General Manager (GM), Board of Directors',
    },
    {
      code: 'OPS',
      name: 'ฝ่ายปฏิบัติการและก่อสร้าง (Operations / Construction)',
      description: 'เป็น "ทัพหน้า" ของบริษัท คุมงานก่อสร้างหน้าไซต์ให้เสร็จตามกำหนดเวลา ควบคุมคนงาน และทำรายงาน Daily Report ส่งเข้าบริษัท | ตำแหน่ง: Project Manager (PM), Site Engineer, Foreman, พนักงานหน้าไซต์',
    },
    {
      code: 'ENG',
      name: 'ฝ่ายวิศวกรรมและสถาปัตยกรรม (Engineering & Architecture)',
      description: 'ออกแบบ เคลียร์แบบก่อสร้าง (Shop Drawing) คำนวณโครงสร้าง และประเมินราคากลาง (BOQ) เพื่อไม่ให้หน้าไซต์ทำงานผิดพลาด | ตำแหน่ง: สถาปนิก (Architect), วิศวกรผู้ออกแบบ, ผู้ถอดแบบประเมินราคา (QS - Quantity Surveyor), ดราฟต์แมน (Draftsman)',
    },
    {
      code: 'PRO',
      name: 'ฝ่ายจัดซื้อและคลังสินค้า (Procurement & Inventory)',
      description: 'สรรหาวัสดุก่อสร้างตามที่หน้าไซต์ทำใบ PR (Purchase Request) เข้ามา ต่อรองราคากับร้านค้า ออกใบสั่งซื้อ (PO) และจัดการของที่เข้าคลัง | ตำแหน่ง: ผู้จัดการฝ่ายจัดซื้อ, เจ้าหน้าที่จัดซื้อ (Purchaser), เจ้าหน้าที่สโตร์/คลังสินค้า',
    },
    {
      code: 'FIN',
      name: 'ฝ่ายการเงินและบัญชี (Finance & Accounting)',
      description: 'บริหารกระแสเงินสด (Cash Flow) วางบิล เรียกเก็บเงินงวดจากลูกค้า ทำเรื่องจ่ายเงินร้านค้าวัสดุ และจ่ายเงินเดือนพนักงาน | ตำแหน่ง: ผู้จัดการฝ่ายการเงินและบัญชี, สมุห์บัญชี, เจ้าหน้าที่การเงิน',
    },
    {
      code: 'SAL',
      name: 'ฝ่ายขายและการตลาด (Sales & Marketing)',
      description: 'หาโปรเจกต์ใหม่ๆ เข้าบริษัท นำเสนองานลูกค้า (Pitching) ปิดการขาย และดูแลความพึงพอใจของลูกค้า (CRM) | ตำแหน่ง: ผู้จัดการฝ่ายขาย, พนักงานขาย (Sales Executive), เจ้าหน้าที่การตลาด',
    },
    {
      code: 'HRA',
      name: 'ฝ่ายทรัพยากรบุคคลและธุรการ (Human Resources & Admin)',
      description: 'สรรหาพนักงานใหม่ จัดการเรื่องวันลา/ขาด/สาย/OT ของทั้งพนักงานออฟฟิศและคนงานหน้าไซต์ ดูแลเอกสารสารบรรณ ไปรษณีย์ และความเรียบร้อยของสำนักงาน | ตำแหน่ง: ผู้จัดการฝ่ายบุคคล, เจ้าหน้าที่ HR, ธุรการ (Admin), พนักงานขับรถ/รับส่งเอกสาร (Messenger), แม่บ้าน',
    },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {
        name: dept.name,
        description: dept.description,
      },
      create: {
        code: dept.code,
        name: dept.name,
        description: dept.description,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seeded departments');
  });

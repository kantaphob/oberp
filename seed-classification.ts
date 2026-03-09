import 'dotenv/config';
import { prisma } from './app/lib/prisma';

async function main() {
  const departments = [
    {
      code: 'EXC',
      name: 'แผนกบริหารจัดการ (Executive)',
      description: 'ควบคุมทิศทางบริษัทและอนุมัติงบโครงการภาพรวม และเซ็นสัญญาอนุมัติขั้นสูงสุด',
    },
    {
      code: 'ENG',
      name: 'แผนกวิศวกรรมและสถาปัตยกรรม (Engineering & Architecture)',
      description: 'ออกแบบ เคลียร์แบบก่อสร้าง (Shop Drawing) คำนวณโครงสร้าง และประเมินราคากลาง (BOQ)',
    },
    {
      code: 'OPS',
      name: 'แผนกปฏิบัติการหน้าไซต์ (Operations)',
      description: 'คุมงานก่อสร้างหน้าไซต์ให้เสร็จตามกำหนดเวลา ควบคุมคนงาน และทำรายงาน',
    },
    {
      code: 'PRO',
      name: 'แผนกจัดซื้อและคลังสินค้า (Procurement & Inventory)',
      description: 'สรรหาวัสดุก่อสร้างตามใบ PR ต่อรองราคากับร้านค้า ออกใบ PO และจัดการคลัง',
    },
    {
      code: 'FIN',
      name: 'แผนกการเงินและบัญชี (Finance & Accounting)',
      description: 'บริหารกระแสเงินสด วางบิล เรียกเก็บเงินงวด และจ่ายเงินร้านค้าหรือผู้รับเหมา',
    },
    {
      code: 'SAL',
      name: 'แผนกขายและการตลาด (Sales & Marketing)',
      description: 'หาโปรเจกต์ใหม่ๆ นำเสนองานลูกค้า ปิดการขาย และดูแลความพึงพอใจ',
    },
    {
      code: 'HRA',
      name: 'แผนกทรัพยากรบุคคลและธุรการ (HR & Admin)',
      description: 'สรรหาพนักงาน จัดการเรื่องส่วนตัวพนักงาน ดูแลความเรียบร้อยของสำนักงาน',
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

  const jobLines = [
    {
      code: "MGT",
      name: "สายงานบริหารองค์กร",
      description: "ควบคุมทิศทางบริษัทและอนุมัติงบ (เช่น MD, General Manager)"
    },
    {
      code: "ARC",
      name: "สายงานสถาปัตยกรรมและออกแบบ",
      description: "ออกแบบสถาปัตยกรรมและตกแต่งภายใน (เช่น Architect, Interior Designer)"
    },
    {
      code: "ENG",
      name: "สายงานวิศวกรรม",
      description: "ออกแบบโครงสร้างและระบบ รวมถึงแก้ปัญหาหน้างาน (เช่น Structural Engineer, MEP Engineer, Site Engineer)"
    },
    {
      code: "QSE",
      name: "สายงานประเมินราคา",
      description: "ถอดแบบและทำราคากลาง BOQ (เช่น QS, Estimator)"
    },
    {
      code: "PMT",
      name: "สายงานบริหารโครงการ",
      description: "บริหารไทม์ไลน์และงบประมาณ (เช่น Project Manager, Asst. PM)"
    },
    {
      code: "CST",
      name: "สายงานก่อสร้างและควบคุมงาน",
      description: "คุมงานผู้รับเหมาและคนงาน (เช่น Foreman, Site Supervisor)"
    },
    {
      code: "PRO",
      name: "สายงานจัดซื้อและโลจิสติกส์",
      description: "สรรหาวัสดุและจัดการคลัง (เช่น Purchaser, Store Officer)"
    },
    {
      code: "FIN",
      name: "สายงานบัญชีและการเงิน",
      description: "จัดการกระแสเงินสดและจ่ายเงินผู้รับเหมา (เช่น Accountant, Finance Officer)"
    },
    {
      code: "SAL",
      name: "สายงานขายและการตลาด",
      description: "หาโปรเจกต์ใหม่และดูแลลูกค้า (เช่น Sales Executive, Marketing Officer)"
    },
    {
      code: "HRA",
      name: "สายงานทรัพยากรบุคคลและธุรการ",
      description: "ดูแลบุคลากรและงานเอกสาร (เช่น HR Officer, Admin, Messenger)"
    }
  ];

  for (const jl of jobLines) {
    await prisma.jobLine.upsert({
      where: { code: jl.code },
      update: {
        name: jl.name,
        description: jl.description,
      },
      create: {
        code: jl.code,
        name: jl.name,
        description: jl.description,
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
    console.log('Seeded departments and joblines successfully');
  });

import 'dotenv/config';
import { prisma } from './app/lib/prisma';

async function main() {
  console.log('🏗️ เริ่มต้นการ Seed ข้อมูลระบบฐานข้อมูลประเมินราคา (Estimation)...')

  // ==========================================================
  // 1. สร้างข้อมูลหน่วยนับมาตรฐาน (Unit Base)
  // ==========================================================
  console.log('📏 กำลังสร้าง Master Data หน่วยนับ...')

  const unitNames = [
    // ความยาว
    'เมตร', 'ซม.', 'มม.', 'ท่อน', 'เส้น', 'ม้วน',
    // พื้นที่
    'ตร.ม.', 'ตร.ว.',
    // ปริมาตร
    'ลบ.ม. (คิว)', 'ลิตร', 'แกลลอน', 'ถัง',
    // น้ำหนัก
    'กก.', 'ตัน',
    // ชิ้นส่วน/บรรจุภัณฑ์
    'ชิ้น', 'อัน', 'ชุด', 'บาน', 'แผ่น', 'ถุง', 'กล่อง', 'กระป๋อง',
    // บริการ/เหมา
    'เหมา', 'เที่ยว', 'งาน', 'จุด'
  ];

  for (const name of unitNames) {
    await prisma.unit.upsert({
      where: { name: name },
      update: {},
      create: { name: name, isActive: true }
    });
  }
  console.log(`✅ สร้างหน่วยนับสำเร็จ ${unitNames.length} รายการ`)

  // Fetch some units for catalog seeding
  const unitSqm = await prisma.unit.findUnique({ where: { name: 'ตร.ม.' } });
  const unitCum = await prisma.unit.findUnique({ where: { name: 'ลบ.ม. (คิว)' } });
  const unitKg = await prisma.unit.findUnique({ where: { name: 'กก.' } });
  const unitBag = await prisma.unit.findUnique({ where: { name: 'ถุง' } });

  if (!unitSqm || !unitCum || !unitKg || !unitBag) {
    throw new Error("Missing required standard units, seed failed");
  }

  // ==========================================================
  // 2. สร้างหมวดหมู่วัสดุ (Material Category)
  // ==========================================================
  console.log('🗂️ 2. กำลังสร้างหมวดหมู่วัสดุ...')
  const catMat = await prisma.materialCategory.upsert({
    where: { name: 'หมวดวัสดุก่อสร้างหลัก' }, update: {}, create: { name: 'หมวดวัสดุก่อสร้างหลัก' }
  })
  const catLabor = await prisma.materialCategory.upsert({
    where: { name: 'หมวดค่าแรงและพนักงาน' }, update: {}, create: { name: 'หมวดค่าแรงและพนักงาน' }
  })
  const catEqp = await prisma.materialCategory.upsert({
    where: { name: 'หมวดเครื่องจักรและอุปกรณ์' }, update: {}, create: { name: 'หมวดเครื่องจักรและอุปกรณ์' }
  })
  const catSub = await prisma.materialCategory.upsert({
    where: { name: 'หมวดผู้รับเหมาช่วง (Sub-contractor)' }, update: {}, create: { name: 'หมวดผู้รับเหมาช่วง (Sub-contractor)' }
  })
  const catSrv = await prisma.materialCategory.upsert({
    where: { name: 'หมวดค่าดำเนินการและบริการ' }, update: {}, create: { name: 'หมวดค่าดำเนินการและบริการ' }
  })

  // ==========================================================
  // 3. สร้างระบบ WBS แบบมีลำดับชั้น (Hierarchy)
  // ==========================================================
  console.log('📂 3. กำลังสร้าง WBS (หมวดงาน)...')

  // 3.1 สร้างหมวดหลัก (Parent Level 1)
  const wbs01 = await prisma.wBSGroup.upsert({
    where: { code: '01' }, update: {}, create: { code: '01', name: 'งานเตรียมบริเวณและงานดิน' }
  })
  const wbs02 = await prisma.wBSGroup.upsert({
    where: { code: '02' }, update: {}, create: { code: '02', name: 'งานโครงสร้าง' }
  })
  const wbs03 = await prisma.wBSGroup.upsert({
    where: { code: '03' }, update: {}, create: { code: '03', name: 'งานสถาปัตยกรรม' }
  })

  // 3.2 สร้างหมวดย่อย (Child Level 2) โดยอ้างอิง parentId ไปหาหมวดหลัก
  await prisma.wBSGroup.upsert({
    where: { code: '02.1' }, update: {},
    create: { code: '02.1', name: 'งานเสาเข็มและฐานราก', parentId: wbs02.id }
  })
  await prisma.wBSGroup.upsert({
    where: { code: '02.2' }, update: {},
    create: { code: '02.2', name: 'งานคอนกรีตโครงสร้าง', parentId: wbs02.id }
  })
  await prisma.wBSGroup.upsert({
    where: { code: '02.3' }, update: {},
    create: { code: '02.3', name: 'งานเหล็กเสริมคอนกรีต', parentId: wbs02.id }
  })
  await prisma.wBSGroup.upsert({
    where: { code: '03.1' }, update: {},
    create: { code: '03.1', name: 'งานก่ออิฐและฉาบปูน', parentId: wbs03.id }
  })
  await prisma.wBSGroup.upsert({
    where: { code: '03.2' }, update: {},
    create: { code: '03.2', name: 'งานวัสดุปูพื้นและผนัง', parentId: wbs03.id }
  })

  // ==========================================================
  // 4. สร้างฐานข้อมูลแคตตาล็อกวัสดุ (Material Catalog)
  // ==========================================================
  console.log('🧱 4. กำลังสร้างแคตตาล็อกวัสดุ...')

  const unitDay = await prisma.unit.findUnique({ where: { name: 'วัน' } }) || unitKg;
  const unitMonth = await prisma.unit.findUnique({ where: { name: 'เดือน' } }) || unitKg;
  const unitPile = await prisma.unit.upsert({ where: { name: 'ต้น' }, update: {}, create: { name: 'ต้น', isActive: true } });
  const unitLump = await prisma.unit.findUnique({ where: { name: 'เหมา' } }) || unitKg;
  const unitManday = await prisma.unit.upsert({ where: { name: 'แมนเดย์' }, update: {}, create: { name: 'แมนเดย์', isActive: true } });

  const materials = [
    // 🟡 กลุ่ม MATERIAL (M) -> มีราคาของ (อาจมีหรือไม่มีค่าแรงแฝงก็ได้)
    { code: 'M-001', name: 'ปูนซีเมนต์ปอร์ตแลนด์ Type 1', brand: 'SCG', categoryId: catMat.id, costType: 'MATERIAL' as const, unitId: unitBag.id, unitPrice: 135, laborPrice: 0 },
    { code: 'M-002', name: 'กระเบื้องแกรนิตโต้ 60x60 ซม.', brand: 'COTTO', categoryId: catMat.id, costType: 'MATERIAL' as const, unitId: unitSqm.id, unitPrice: 350, laborPrice: 200 },

    // 🔵 กลุ่ม LABOR (L) -> เป็นค่าแรงล้วนๆ (unitPrice ต้องเป็น 0)
    { code: 'L-001', name: 'ค่าแรงผูกเหล็กและเทคอนกรีต', brand: null, categoryId: catLabor.id, costType: 'LABOR' as const, unitId: unitSqm.id, unitPrice: 0, laborPrice: 150 },
    { code: 'L-002', name: 'ค่าแรงกรรมกร (รายวัน)', brand: null, categoryId: catLabor.id, costType: 'LABOR' as const, unitId: unitManday.id, unitPrice: 0, laborPrice: 450 },

    // 🔴 กลุ่ม EQUIPMENT (E) -> ค่าเช่าเครื่องจักร
    { code: 'E-001', name: 'ค่าเช่ารถแบ็คโฮ (PC120) พร้อมคนขับ', brand: 'Komatsu', categoryId: catEqp.id, costType: 'EQUIPMENT' as const, unitId: unitDay.id, unitPrice: 6500, laborPrice: 0 },
    { code: 'E-002', name: 'ค่าเช่าเครื่องตบดิน', brand: 'Mikasa', categoryId: catEqp.id, costType: 'EQUIPMENT' as const, unitId: unitDay.id, unitPrice: 800, laborPrice: 0 },

    // 🟠 กลุ่ม SUBCONTRACTOR (S) -> จ้างเหมาช่วง (เหมาจบรวมของรวมแรง)
    { code: 'S-001', name: 'ผู้รับเหมาช่วง: งานติดตั้งฝ้าเพดานฉาบเรียบ', brand: '-', categoryId: catSub.id, costType: 'SUBCONTRACTOR' as const, unitId: unitSqm.id, unitPrice: 450, laborPrice: 0 },
    { code: 'S-002', name: 'ผู้รับเหมาช่วง: งานเสาเข็มเจาะระบบแห้ง', brand: '-', categoryId: catSub.id, costType: 'SUBCONTRACTOR' as const, unitId: unitPile.id, unitPrice: 12000, laborPrice: 0 },

    // 🟢 กลุ่ม SERVICE (F) -> บริการ/ค่าใช้จ่ายอื่นๆ
    { code: 'F-001', name: 'ค่าธรรมเนียมขออนุญาตก่อสร้าง', brand: '-', categoryId: catSrv.id, costType: 'SERVICE' as const, unitId: unitLump.id, unitPrice: 5000, laborPrice: 0 },
    { code: 'F-002', name: 'ค่าจ้างที่ปรึกษาควบคุมงาน (Consult)', brand: '-', categoryId: catSrv.id, costType: 'SERVICE' as const, unitId: unitMonth.id, unitPrice: 35000, laborPrice: 0 },
  ]

  for (const item of materials) {
    await prisma.materialCatalog.upsert({
      where: { code: item.code },
      update: {
        unitPrice: item.unitPrice,
        laborPrice: item.laborPrice,
        brand: item.brand,
        categoryId: item.categoryId,
        costType: item.costType,
        unitId: item.unitId
      },
      create: item
    })
  }

  console.log('✅ Seed: ข้อมูลประเมินราคา (Estimation) สำเร็จเรียบร้อย!')
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

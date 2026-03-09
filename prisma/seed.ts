import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma';
import fs from 'fs';
import path from 'path';


const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

async function parseProvinces() {
  const data = fs.readFileSync(path.join(__dirname, 'db/province.sql'), 'utf8');
  const matches = data.match(/\((\d+),\s*'([^']*)',\s*'([^']*)'\)/g);

  return matches?.map(match => {
    const [, id, nameTh, nameEn] = match.match(/\((\d+),\s*'([^']*)',\s*'([^']*)'\)/) || [];
    return {
      id: parseInt(id!),
      nameTh: nameTh!,
      nameEn: nameEn || null
    };
  }) || [];
}

async function parseDistricts() {
  const data = fs.readFileSync(path.join(__dirname, 'db/district.sql'), 'utf8');
  const matches = data.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)'\)/g);

  return matches?.map(match => {
    const [, id, provinceId, nameTh, nameEn] = match.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)'\)/) || [];
    return {
      id: parseInt(id!),
      provinceId: parseInt(provinceId!),
      nameTh: nameTh!,
      nameEn: nameEn || null
    };
  }) || [];
}

async function parseSubdistricts() {
  const data = fs.readFileSync(path.join(__dirname, 'db/subdistrict.sql'), 'utf8');
  const matches = data.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+)\)/g);

  return matches?.map(match => {
    const [, id, districtId, nameTh, nameEn, lat, lng, zipcode] = match.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+)\)/) || [];
    return {
      id: parseInt(id!),
      districtId: parseInt(districtId!),
      nameTh: nameTh!,
      nameEn: nameEn || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      zipcode: parseInt(zipcode!)
    };
  }) || [];
}

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    await prisma.subdistrict.deleteMany();
    await prisma.district.deleteMany();
    await prisma.province.deleteMany();

    console.log('📁 Parsing data files...');
    const provinces = await parseProvinces();
    const districts = await parseDistricts();
    const subdistricts = await parseSubdistricts();

    console.log(`📍 Found ${provinces.length} provinces`);
    console.log(`🏢 Found ${districts.length} districts`);
    console.log(`🏘️ Found ${subdistricts.length} subdistricts`);

    // Insert provinces
    console.log('💾 Inserting provinces...');
    await prisma.province.createMany({
      data: provinces
    });

    // Insert districts
    console.log('💾 Inserting districts...');
    await prisma.district.createMany({
      data: districts
    });

    // Insert subdistricts
    console.log('💾 Inserting subdistricts...');
    await prisma.subdistrict.createMany({
      data: subdistricts
    });

    console.log('✅ Database seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

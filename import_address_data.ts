import { PrismaClient } from './app/generated/prisma';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function importProvinces(): Promise<void> {
  console.log('Importing provinces...');

  const provinceSQL = fs.readFileSync(path.join(__dirname, 'prisma/db/province.sql'), 'utf8');

  // Extract INSERT statements
  const insertMatches = provinceSQL.match(/INSERT INTO `province`[\s\S]*?;/);
  if (!insertMatches) {
    console.log('No INSERT statements found for provinces');
    return;
  }

  const insertStatement = insertMatches[0];

  // Extract values using regex
  const valueMatches = insertStatement.match(/\((\d+),\s*'([^']*)',\s*'([^']*)'\)/g);

  if (valueMatches) {
    for (const match of valueMatches) {
      const parts = match.match(/\((\d+),\s*'([^']*)',\s*'([^']*)'\)/);
      if (parts) {
        const [, id, nameTh, nameEn] = parts;
        await prisma.province.create({
          data: {
            id: parseInt(id),
            nameTh: nameTh,
            nameEn: nameEn || null
          }
        });
        console.log(`Inserted province: ${id} - ${nameTh}`);
      }
    }
  }

  console.log('Provinces imported successfully');
}

async function importDistricts(): Promise<void> {
  console.log('Importing districts...');

  const districtSQL = fs.readFileSync(path.join(__dirname, 'prisma/db/district.sql'), 'utf8');

  // Extract INSERT statements
  const insertMatches = districtSQL.match(/INSERT INTO `district`[\s\S]*?;/);
  if (!insertMatches) {
    console.log('No INSERT statements found for districts');
    return;
  }

  const insertStatement = insertMatches[0];

  // Extract values using regex
  const valueMatches = insertStatement.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)'\)/g);

  if (valueMatches) {
    for (const match of valueMatches) {
      const parts = match.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)'\)/);
      if (parts) {
        const [, id, provinceId, nameTh, nameEn] = parts;
        await prisma.district.create({
          data: {
            id: parseInt(id),
            provinceId: parseInt(provinceId),
            nameTh: nameTh,
            nameEn: nameEn || null
          }
        });
        console.log(`Inserted district: ${id} - ${nameTh}`);
      }
    }
  }

  console.log('Districts imported successfully');
}

async function importSubdistricts(): Promise<void> {
  console.log('Importing subdistricts...');

  const subdistrictSQL = fs.readFileSync(path.join(__dirname, 'prisma/db/subdistrict.sql'), 'utf8');

  // Extract all INSERT statements
  const insertMatches = subdistrictSQL.match(/INSERT INTO `subdistrict`[\s\S]*?;/g);

  if (insertMatches) {
    for (const insertStatement of insertMatches) {
      // Extract values using regex
      const valueMatches = insertStatement.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+)\)/g);

      if (valueMatches) {
        for (const match of valueMatches) {
          const parts = match.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+)\)/);
          if (parts) {
            const [, id, districtId, nameTh, nameEn, lat, lng, zipcode] = parts;
            await prisma.subdistrict.create({
              data: {
                id: parseInt(id),
                districtId: parseInt(districtId),
                nameTh: nameTh,
                nameEn: nameEn || null,
                lat: lat ? parseFloat(lat) : null,
                lng: lng ? parseFloat(lng) : null,
                zipcode: zipcode ? parseInt(zipcode) : null
              }
            });
            console.log(`Inserted subdistrict: ${id} - ${nameTh}`);
          }
        }
      }
    }
  }

  console.log('Subdistricts imported successfully');
}

async function main(): Promise<void> {
  try {
    console.log('Starting address data import...');

    await importProvinces();
    await importDistricts();
    await importSubdistricts();

    console.log('Address data import completed successfully!');
  } catch (error) {
    console.error('Error importing address data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Use direct database URL for seeding
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://7a7849055122e98f03aa3c90d61894e453ea9b2f1120bd8fa17d97e6c9cfaf21:sk_YPDvvxYOaiUJCZpo6CZW4@db.prisma.io:5432/postgres?sslmode=require'
    }
  }
});

async function importProvinces() {
  console.log('📁 Importing provinces...');
  try {
    const data = fs.readFileSync(path.join(__dirname, 'prisma/db/province.sql'), 'utf8');
    const matches = data.match(/\((\d+),\s*'([^']*)',\s*'([^']*)'\)/g);
    
    if (matches) {
      const provinces = matches.map(match => {
        const parts = match.match(/\((\d+),\s*'([^']*)',\s*'([^']*)'\)/);
        return {
          id: parseInt(parts[1]),
          nameTh: parts[2],
          nameEn: parts[3] || null
        };
      });
      
      await prisma.province.createMany({
        data: provinces,
        skipDuplicates: true
      });
      console.log(`✅ Imported ${provinces.length} provinces`);
    }
  } catch (error) {
    console.error('❌ Error importing provinces:', error.message);
  }
}

async function importDistricts() {
  console.log('📁 Importing districts...');
  try {
    const data = fs.readFileSync(path.join(__dirname, 'prisma/db/district.sql'), 'utf8');
    const matches = data.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)'\)/g);
    
    if (matches) {
      const districts = matches.map(match => {
        const parts = match.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)'\)/);
        return {
          id: parseInt(parts[1]),
          provinceId: parseInt(parts[2]),
          nameTh: parts[3],
          nameEn: parts[4] || null
        };
      });
      
      await prisma.district.createMany({
        data: districts,
        skipDuplicates: true
      });
      console.log(`✅ Imported ${districts.length} districts`);
    }
  } catch (error) {
    console.error('❌ Error importing districts:', error.message);
  }
}

async function importSubdistricts() {
  console.log('📁 Importing subdistricts...');
  try {
    const data = fs.readFileSync(path.join(__dirname, 'prisma/db/subdistrict.sql'), 'utf8');
    const matches = data.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+)\)/g);
    
    if (matches) {
      const subdistricts = matches.map(match => {
        const parts = match.match(/\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+)\)/);
        return {
          id: parseInt(parts[1]),
          districtId: parseInt(parts[2]),
          nameTh: parts[3],
          nameEn: parts[4] || null,
          lat: parts[5] ? parseFloat(parts[5]) : null,
          lng: parts[6] ? parseFloat(parts[6]) : null,
          zipcode: parseInt(parts[7])
        };
      });
      
      // Import in batches to avoid timeout
      const batchSize = 100;
      for (let i = 0; i < subdistricts.length; i += batchSize) {
        const batch = subdistricts.slice(i, i + batchSize);
        await prisma.subdistrict.createMany({
          data: batch,
          skipDuplicates: true
        });
        console.log(`📊 Progress: ${Math.min(i + batchSize, subdistricts.length)}/${subdistricts.length} subdistricts`);
      }
      
      console.log(`✅ Imported ${subdistricts.length} subdistricts`);
    }
  } catch (error) {
    console.error('❌ Error importing subdistricts:', error.message);
  }
}

async function main() {
  console.log('🌱 Starting simple database seed...');
  
  try {
    await importProvinces();
    await importDistricts();
    await importSubdistricts();
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Verify data
    const provinceCount = await prisma.province.count();
    const districtCount = await prisma.district.count();
    const subdistrictCount = await prisma.subdistrict.count();
    
    console.log(`📊 Final counts:`);
    console.log(`   Provinces: ${provinceCount}`);
    console.log(`   Districts: ${districtCount}`);
    console.log(`   Subdistricts: ${subdistrictCount}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

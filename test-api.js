const http = require('http');

async function run() {
  const payload = {
    username: 'testu' + Date.now(),
    email: 'test' + Date.now() + '@test.com',
    password: 'password123',
    status: 'ACTIVE',
    roleId: 'replace_me',
    firstName: 'Test',
    lastName: 'User',
    taxId: '1234567890123',
    telephoneNumber: '0812345678',
    addressDetail: '123 Test St',
    isAdmin: true
  };

  const { PrismaClient } = require('./app/generated/prisma');
  const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });
  const role = await prisma.jobRole.findFirst();
  
  if (!role) {
    console.log("No roles found. Cannot test.");
    process.exit(1);
  }
  
  payload.roleId = role.id;

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(payload))
    }
  };

  const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => {
      responseBody += chunk;
    });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', responseBody);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(JSON.stringify(payload));
  req.end();
}

run();

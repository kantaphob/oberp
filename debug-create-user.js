const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });
const bcrypt = require('bcrypt');

async function testCreate() {
  try {
    const roleId = "0c79fca1-1977-4cf0-bb4b-eabcb6eb8bce"; // Will be overridden
    const role = await prisma.jobRole.findFirst();
    if (!role) {
      console.log("No role found");
      return;
    }

    let profileDepartmentId = role.departmentId;
    if (!profileDepartmentId) {
      const currentDept = await prisma.department.findFirst();
      profileDepartmentId = currentDept.id;
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    const newUser = await prisma.user.create({
      data: {
        username: 'testu' + Date.now(),
        email: 'test' + Date.now() + '@test.com',
        passwordHash: hashedPassword,
        status: "ACTIVE",
        roleId: role.id,
        // createdById: null,
        // approvedById: null,
        profile: {
          create: {
            firstName: "Test",
            lastName: "User",
            taxId: "1234567890123",
            telephoneNumber: "0812345678",
            departmentId: profileDepartmentId,
            roleId: role.id,
            addressDetail: "123 Test St",
            startDate: new Date(),
          }
        }
      },
      include: {
        role: true,
        profile: true
      }
    });
    console.log("Success", newUser);
  } catch (err) {
    console.error("Error creating user:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testCreate();

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { 
      username, password, email, 
      firstName, lastName, taxId, telephoneNumber, addressDetail 
    } = body;

    if (!username || !password || !firstName || !lastName || !taxId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const exist = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: email || undefined }
        ]
      }
    });

    if (exist) {
      return NextResponse.json({ error: "Username or Email already exists in the system" }, { status: 400 });
    }

    // Assign to a generic Level 10 JobRole for PENDING
    let role10 = await prisma.jobRole.findFirst({
      where: { level: 10 }
    });

    let defaultDepartmentId = null;
    
    // If no Level 10 exists, we create a generic 'Guest / Pending' one
    if (!role10) {
      const firstDept = await prisma.department.findFirst();
      role10 = await prisma.jobRole.create({
        data: {
          name: "Pending Verification",
          prefix: "PENDING",
          level: 10,
          isActive: true,
          departmentId: firstDept?.id || null
        }
      });
      defaultDepartmentId = firstDept?.id || null;
    } else {
      defaultDepartmentId = role10.departmentId;
    }

    // If no department found (empty system), attempt to grab the first or wait
    if (!defaultDepartmentId) {
      const someDept = await prisma.department.findFirst();
      if (!someDept) {
        return NextResponse.json({ error: "System not ready: Requires at least 1 department configured" }, { status: 500 });
      }
      defaultDepartmentId = someDept.id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email: email || null,
        passwordHash: hashedPassword,
        status: "PENDING", // Enforce pending status
        roleId: role10.id,
        profile: {
          create: {
            firstName: firstName || "-",
            lastName: lastName || "-",
            taxId: taxId || "0000000000000",
            telephoneNumber: telephoneNumber || "0000000000",
            addressDetail: addressDetail || "-",
            departmentId: defaultDepartmentId,
            roleId: role10.id,
          }
        }
      },
      include: {
        profile: true
      }
    });

    return NextResponse.json({ 
      message: "Registration successful. Please wait for admin approval.", 
      user: { id: newUser.id, username: newUser.username }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Failed to perform registration" }, { status: 500 });
  }
}

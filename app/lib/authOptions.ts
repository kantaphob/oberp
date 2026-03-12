import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember Me", type: "text" } // 
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
          }

          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: credentials.identifier },
                { email: credentials.identifier }
              ]
            },
            include: {
              role: {
                include: {
                  jobLine: true
                }
              },
              profile: {
                include: {
                  department: true
                }
              }
            }
          });

          if (!user || user.status !== "ACTIVE") {
            throw new Error("ไม่พบชื่อผู้ใช้หรือบัญชีไม่พร้อมใช้งาน");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            throw new Error("รหัสผ่านไม่ถูกต้อง");
          }

          const role = user.role;
          const profile = user.profile;

          return {
            id: user.id,
            username: user.username,
            level: role?.level ?? 999,
            roleId: user.roleId,
            roleName: role?.name || "Unknown Role",
            firstName: profile?.firstName,
            lastName: profile?.lastName,
            isAdmin: role?.level === 0 || role?.name === "Admin" || role?.name === "Founder",
            sessionMaxAge: 8 * 60 * 60,
            rememberMe: credentials.remember === "true",
            departmentId: profile?.departmentId ?? undefined,
            departmentName: profile?.department?.name ?? undefined,
            jobLineId: role?.jobLineId ?? undefined,
            jobLineName: role?.jobLine?.name ?? undefined
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Handle remember me on sign in
      if (user) {
        token.id = user.id;
        token.username = user.username as string;
        token.level = user.level as number;
        token.roleId = user.roleId as string;
        token.roleName = user.roleName as string;
        token.firstName = user.firstName as string | undefined;
        token.lastName = user.lastName as string | undefined;
        token.isAdmin = user.isAdmin as boolean;
        token.rememberMe = user.rememberMe as boolean;
        token.sessionMaxAge = user.sessionMaxAge as number;
        // 🌟 Add department and job information to JWT
        token.departmentId = user.departmentId as string | undefined;
        token.departmentName = user.departmentName as string | undefined;
        token.jobLineId = user.jobLineId as string | undefined;
        token.jobLineName = user.jobLineName as string | undefined;
      }

      // Update token when remember me preference changes
      if (trigger === "update" && session?.rememberMe !== undefined) {
        token.rememberMe = session.rememberMe;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.level = token.level as number;
        session.user.roleId = token.roleId as string;
        session.user.roleName = token.roleName as string;
        session.user.firstName = token.firstName as string | undefined;
        session.user.lastName = token.lastName as string | undefined;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.rememberMe = token.rememberMe as boolean;
        // 🌟 Add department and job information to session
        session.user.departmentId = token.departmentId as string | undefined;
        session.user.departmentName = token.departmentName as string | undefined;
        session.user.jobLineId = token.jobLineId as string | undefined;
        session.user.jobLineName = token.jobLineName as string | undefined;
      }

      // Set session expiration dynamically
      if (token.sessionMaxAge && typeof token.sessionMaxAge === 'number') {
        session.expires = new Date(Date.now() + token.sessionMaxAge * 1000).toISOString();
      }

      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // Default session age (8 hours) - will be adjusted dynamically
    maxAge: 8 * 60 * 60, // 8 hours in seconds
  },
  secret: process.env.NEXTAUTH_SECRET || "vPWcL5Fk/7H0RcEI8iRw3cA3SVymPzZdP5InvoC5L10=",
};

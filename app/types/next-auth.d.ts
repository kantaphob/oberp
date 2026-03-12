import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      level: number;
      roleId: string;
      roleName: string;
      firstName?: string;
      lastName?: string;
      isAdmin: boolean;
      rememberMe?: boolean; // 🌟 Add remember me to session
      departmentId?: string; // 🌟 Add department info
      departmentName?: string;
      jobLineId?: string; // 🌟 Add job line info
      jobLineName?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    level: number;
    roleId: string;
    roleName: string;
    firstName?: string;
    lastName?: string;
    isAdmin: boolean;
    rememberMe?: boolean; // 🌟 Add remember me to user
    sessionMaxAge?: number; // 🌟 Add session max age to user
    departmentId?: string; // 🌟 Add department info
    departmentName?: string;
    jobLineId?: string; // 🌟 Add job line info
    jobLineName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    level: number;
    roleId: string;
    roleName: string;
    firstName?: string;
    lastName?: string;
    isAdmin: boolean;
    rememberMe?: boolean; // 🌟 Add remember me to JWT
    sessionMaxAge?: number; // 🌟 Add session max age to JWT
    departmentId?: string; // 🌟 Add department info
    departmentName?: string;
    jobLineId?: string; // 🌟 Add job line info
    jobLineName?: string;
  }
}

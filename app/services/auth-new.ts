import { signIn, signOut, getSession } from "next-auth/react";

export type LoginData = {
  email: string;
  password: string;
};

export type AuthResult = {
  success: boolean;
  message?: string;
  user?: any;
};

export async function login(data: LoginData): Promise<AuthResult> {
  try {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        message: result.error === "CredentialsSignin" 
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" 
          : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      };
    }

    if (result?.ok) {
      const session = await getSession();
      return {
        success: true,
        message: "เข้าสู่ระบบสำเร็จ",
        user: session?.user,
      };
    }

    return {
      success: false,
      message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
    };
  }
}

export async function logout(): Promise<void> {
  await signOut({ redirect: false });
}

export async function verifyToken(): Promise<AuthResult> {
  try {
    const session = await getSession();
    
    if (session?.user) {
      return {
        success: true,
        user: session.user,
      };
    }

    return {
      success: false,
      message: "ไม่พบข้อมูลผู้ใช้",
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล",
    };
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return !!session?.user;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
}

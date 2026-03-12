"use client";

import React, { useState, useEffect } from "react";
import "../globals.css";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { login, isAuthenticated } from "../services/auth";
import { showToast } from "../lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false); // 🌟 Add remember me state
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // ตรวจสอบว่า user login อยู่แล้วหรือไม่
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        router.push("/dashboard");
      }
    };
    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error เมื่อ user เริ่มพิมพ์
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate inputs
    if (!formData.identifier.trim()) {
      setErrorMessage("กรุณากรอก Username หรืออีเมล");
      showToast.error("กรุณากรอก Username หรืออีเมล");
      return;
    }

    if (!formData.password.trim()) {
      setErrorMessage("กรุณากรอกรหัสผ่าน");
      showToast.error("กรุณากรอกรหัสผ่าน");
      return;
    }

    if (formData.password.length < 4) {
      setErrorMessage("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร");
      showToast.error("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const healthResponse = await fetch("/api/auth/health", {
        method: "GET",
        cache: "no-store",
      });
      if (!healthResponse.ok) {
        const healthData = (await healthResponse.json()) as {
          message?: string;
        };
        throw new Error(
          healthData.message ??
            "ระบบยืนยันตัวตนไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง",
        );
      }

      // เรียก API login จริง
      const result = await login({
        identifier: formData.identifier.trim(),
        password: formData.password,
        remember: rememberMe, // 🌟 Pass remember me preference
      });

      if (result.success) {
        setStatus("success");
        showToast.success("เข้าสู่ระบบสำเร็จ!");

        // Redirect ไปหน้า Dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        throw new Error(result.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (error) {
      setStatus("error");

      const errorMsg =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      setErrorMessage(errorMsg);
      showToast.error(errorMsg);

      // Reset status หลัง 2 วินาที
      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    }
  };

  // ปรับ Input ให้ดูเป็นรอยบุ๋มของน้ำ (Inner Shadow) และใสขึ้น
  const inputClasses = (fieldName: string) => `
    w-full bg-white/20 backdrop-blur-md
    border border-white/40
    shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]
    px-4 py-4 pl-12
    font-medium text-gray-900
    placeholder:text-gray-500
    transition-all duration-300 ease-out
    focus:outline-none 
    rounded-2xl
    ${
      focusedField === fieldName
        ? "bg-white/40 border-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.08)] translate-y-[-2px]"
        : "hover:bg-white/30"
    }
  `;

  return (
    <div className="min-h-screen bg-[#E5E9EC] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden selection:bg-black/10 font-sans">
      {/* ================= Water Drop Environment (Background) ================= */}
      {/* พื้นหลังต้องมีลวดลายเพื่อให้ความใสของหยดน้ำหักเหแสงได้ชัดเจนขึ้น */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[50vw] h-[50vw] bg-gradient-to-br from-white to-transparent rounded-full blur-[80px] opacity-80 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-gradient-to-tl from-gray-400 to-transparent rounded-full blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute top-[30%] left-[40%] w-[30vw] h-[30vw] bg-white rounded-full blur-[120px] opacity-50"></div>
      </div>

      {/* ================= THE WATER DROP CONTAINER ================= */}
      <div
        className="
          w-full max-w-6xl 
          bg-gradient-to-br from-white/40 via-white/10 to-transparent 
          backdrop-blur-[40px] 
          border border-white/60 border-b-white/20 border-r-white/20 
          rounded-[3rem] 
          shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15),inset_0_2px_20px_rgba(255,255,255,0.9),inset_0_-10px_30px_rgba(0,0,0,0.05)] 
          overflow-hidden relative z-10 flex flex-col lg:flex-row
        "
      >
        {/* ================= LEFT SIDE: Branding / Image ================= */}
        <div className="hidden lg:flex lg:w-1/2 p-4 relative">
          <div className="w-full h-full relative rounded-[2.5rem] overflow-hidden group shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"
              alt="Architecture"
              className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-in-out"
            />
            {/* Soft Glass Overlay to keep the water feel */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80"></div>

            {/* Content inside image */}
            <div className="absolute inset-0 p-12 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-lg">
                  <span className="font-black text-white text-xl">O</span>
                </div>
                <span className="font-black tracking-tighter text-lg text-white">
                  OBNITHI <span className="font-light opacity-80">CON</span>
                </span>
              </div>

              <div className="text-white space-y-4">
                <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-xs font-bold tracking-widest uppercase shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)]">
                  Welcome Back
                </div>
                <h1 className="text-4xl xl:text-5xl font-black leading-tight drop-shadow-lg">
                  Crafting spaces <br />
                  that inspire.
                </h1>
                <p className="text-white/80 font-medium max-w-sm drop-shadow-md">
                  Log in to access your project dashboard, track progress, and
                  communicate with our team.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Login Form ================= */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center relative">
          <div className="max-w-md w-full mx-auto space-y-10 relative z-10">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/40 backdrop-blur-md border border-white/60 rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.1)]">
                <span className="font-black text-black text-xl">O</span>
              </div>
              <span className="font-black tracking-tighter text-lg text-black">
                OBNITHI <span className="font-light text-gray-500">CON</span>
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-black text-black tracking-tight drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]">
                Sign In
              </h2>
              <p className="text-gray-500 font-medium">
                Please enter your details to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message Display */}
              {errorMessage && (
                <div className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-start gap-3 animate-shake">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              {/* Username / Email Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors z-10">
                  <Mail size={20} />
                </div>
                <input
                  type="text"
                  name="identifier"
                  placeholder="User Name or Email"
                  className={inputClasses("identifier")}
                  value={formData.identifier}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("identifier")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={status === "loading" || status === "success"}
                  autoComplete="username"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors z-10">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={inputClasses("password")}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={status === "loading" || status === "success"}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors z-10"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm font-medium">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe} // 🌟 Bind to state
                    onChange={(e) => setRememberMe(e.target.checked)} // 🌟 Handle change
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black transition-all cursor-pointer bg-white/50"
                  />
                  <span className="text-gray-600 group-hover:text-black transition-colors">
                    จดจำการเข้าสู่ระบบ
                  </span>
                </label>
                <a
                  href="#"
                  className="text-black hover:underline underline-offset-4 decoration-black/30 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button (Premium Interactive) */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="group relative w-full h-14 rounded-xl font-bold text-lg border-2 border-white bg-white text-black overflow-hidden flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Animated Background Fill */}
                  <div className="absolute inset-0 w-full h-full bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)]"></div>

                  <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-white transition-colors duration-500 ease-in-out">
                    {status === "loading" ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        <span>Authenticating...</span>
                      </>
                    ) : status === "success" ? (
                      <span>เข้าสู่ระบบสำเร็จ ✓</span>
                    ) : (
                      <>
                        <span className="tracking-wide">Sign In</span>
                        {/* Premium Arrow Animation (Diagonal Slide) */}
                        <div className="relative w-6 h-6 overflow-hidden flex items-center justify-center">
                          <ArrowRight
                            size={20}
                            strokeWidth={2.5}
                            className="absolute transform transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] group-hover:translate-x-[150%] group-hover:-translate-y-[150%]"
                          />
                          <ArrowRight
                            size={20}
                            strokeWidth={2.5}
                            className="absolute transform -translate-x-[150%] translate-y-[150%] transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] group-hover:translate-x-0 group-hover:translate-y-0"
                          />
                        </div>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Quick Test Buttons */}
            <div className="mt-8 p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm">
              <p className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wider text-center">
                Quick Test Login
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      identifier: "FND291295",
                      password: "ohmspkNtr",
                    });
                    setRememberMe(true); // 🌟 Enable remember me for demo
                  }}
                  className="w-full relative overflow-hidden group px-4 py-3 bg-white/60 hover:bg-white border border-white/50 rounded-xl transition-all duration-300 text-left flex items-center justify-between shadow-sm active:scale-[0.98]"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">
                      ผู้ดูแลระบบ (จดจำ)
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      admin@obnithi.com • หมดเวลา 23:59 วันนี้
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <ArrowRight
                      size={14}
                      className="opacity-50 group-hover:opacity-100"
                    />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      identifier: "JUN26001",
                      password: "1234",
                    });
                    setRememberMe(false); //
                  }}
                  className="w-full relative overflow-hidden group px-4 py-3 bg-white/60 hover:bg-white border border-white/50 rounded-xl transition-all duration-300 text-left flex items-center justify-between shadow-sm active:scale-[0.98]"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">
                      ผู้ดูแลระบบ (ปกติ)
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      admin@obnithi.com • 8 ชั่วโมง
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <ArrowRight
                      size={14}
                      className="opacity-50 group-hover:opacity-100"
                    />
                  </div>
                </button>
              </div>
              <div className="mt-3 p-2 bg-white/30 rounded-lg">
                <p className="text-xs text-gray-700 text-center">
                  ⏰ <strong>จดจำการเข้าสู่ระบบ:</strong> ทำงานถึง 23:59
                  ของวันนี้เท่านั้น
                </p>
                <p className="text-xs text-gray-600 text-center mt-1">
                  Admin: สูงสุด 4 ชม. | ทั่วไป: ถึง 23:59 | ปกติ: 8 ชม.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

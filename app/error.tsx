"use client";
import { useEffect } from "react";
import Link from "next/link";
import "./globals.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <section className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-50">
      
      {/* z-0: Background decorations (Purple/Pink accent for errors) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-15%] w-[50vw] h-[50vw] bg-pink-300/20 rounded-full blur-[150px]"></div>
        <div className="absolute top-1/4 left-[-10%] w-[40vw] h-[40vw] bg-purple-300/20 rounded-full blur-[120px]"></div>
      </div>

      {/* z-10: Main content container */}
      <div className="relative z-10 w-full max-w-lg">
        
        {/* Liquid Glass container */}
        <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/40 to-white/20 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-[2.5rem] p-10 md:p-12 text-center group">
          
          {/* Inner glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none rounded-[2.5rem]"></div>
          
          {/* Content wrapper */}
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-slate-800 mb-3 group-hover:scale-105 transition-all duration-500">
              เกิดข้อผิดพลาด
            </h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              ระบบไม่สามารถประมวลผลคำขอของคุณได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                onClick={() => reset()}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 text-white font-medium rounded-xl shadow-lg hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300"
              >
                ลองใหม่อีกครั้ง
              </button>

              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto px-6 py-3.5 bg-white/50 text-slate-800 font-medium rounded-xl border border-white/60 hover:bg-white/80 hover:-translate-y-1 transition-all duration-300"
              >
                กลับหน้า Dashboard
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
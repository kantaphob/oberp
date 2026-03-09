import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  return (
    <section className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-50">
      
      {/* z-0: Background decorations (blurs, glows) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Blue circular glow - bottom left */}
        <div className="absolute bottom-[-10%] left-[-15%] w-[50vw] h-[50vw] bg-blue-300/20 rounded-full blur-[150px]"></div>
        {/* Emerald circular glow - right side */}
        <div className="absolute top-1/4 right-[-10%] w-[40vw] h-[40vw] bg-emerald-200/20 rounded-full blur-[120px]"></div>
      </div>

      {/* z-10: Main content container */}
      <div className="relative z-10 w-full max-w-lg">
        
        {/* Liquid Glass container */}
        <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/40 to-white/20 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-[2.5rem] p-10 md:p-16 text-center group">
          
          {/* Inner glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none rounded-[2.5rem]"></div>
          
          {/* Content wrapper */}
          <div className="relative z-10">
            <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 mb-4 group-hover:scale-105 transition-all duration-500">
              404
            </h1>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">ไม่พบหน้าที่ต้องการ</h2>
            <p className="text-slate-600 mb-8">
              ขออภัย หน้าเว็บที่คุณกำลังค้นหาอาจถูกลบไปแล้ว หรือไม่มีอยู่จริง
            </p>

            <Link 
              href="/dashboard" 
              className="inline-block px-8 py-3.5 bg-slate-900 text-white font-medium rounded-xl shadow-lg hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300"
            >
              กลับสู่หน้า Dashboard
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
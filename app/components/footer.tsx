"use client";

import React from "react";

// --- FooterMenu Component ---
const navLinks = [
  { href: "/#info", label: "ข้อมูล" },
  { href: "/#about", label: "เกี่ยวกับเรา" },
  { href: "/#vision", label: "วิสัยทัศน์" },
  { href: "/#service", label: "บริการ" },
  { href: "/#portfolio", label: "ผลงาน" },
  { href: "/#contact", label: "ติดต่อเรา" },
];

function FooterMenu() {
  return (
    <div className="w-full py-8 px-8 flex flex-wrap justify-center items-center gap-x-10 gap-y-4 relative z-10">
      {navLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          // เปลี่ยน group ปกติ เป็น group/link เพื่อแยก scope การ hover ออกจาก group ของ Footer ตัวนอก
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-widest relative group/link"
        >
          {link.label}
          {/* เปลี่ยน group-hover เป็น group-hover/link ให้วิ่งตามแค่ลิงก์ของตัวเองเท่านั้น */}
          <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover/link:w-full"></span>
        </a>
      ))}
    </div>
  );
}
// -------------------------------------------------------------------------

export default function Footer() {
  return (
    <footer className="w-full px-6 pb-6 pt-2 relative z-10">
      {/* Wrapper สำหรับ Liquid Glass Effect ที่มี class "group" คุมแสงด้านหลัง */}
      <div className="relative mx-auto max-w-screen-2xl rounded-[2.5rem] overflow-hidden group">
        
        {/* --- Liquid Blobs (แสงสะท้อนด้านในกระจก) --- */}
        <div className="absolute -top-1/2 -left-10 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-white/20 transition-colors duration-1000"></div>
        <div className="absolute -bottom-1/2 -right-10 w-72 h-72 bg-zinc-600/20 rounded-full blur-[80px] pointer-events-none"></div>

        {/* --- Glass Surface (พื้นผิวกระจกบานเดียวที่ครอบทั้ง 2 Components) --- */}
        <div className="relative bg-gradient-to-br from-white/[0.05] via-transparent to-black/40 backdrop-blur-3xl border border-white/10 border-t-white/20 border-l-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.15)] flex flex-col transition-all duration-500">
          
          {/* ส่วนบน: เรียกใช้ Component FooterMenu */}
          <div className="w-full">
            <FooterMenu />
          </div>

          {/* เส้นแบ่ง (Divider) บางๆ แบบไล่ระดับสี (Gradient) */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          {/* ส่วนล่าง: Logo, Copyright & Legal Links */}
          <div className="w-full py-6 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left Section: Logo & Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="relative group/logo cursor-pointer">
                {/* Liquid Glow Effect for Logo */}
                <div className="absolute inset-0 bg-white/20 blur-md opacity-40 rounded-xl group-hover/logo:opacity-70 group-hover/logo:scale-110 transition-all duration-500"></div>
                {/* Glass Logo Box */}
                <div className="relative w-10 h-10 bg-white/[0.02] backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 border-t-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]">
                  <span className="text-white text-xl font-black italic drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                    O
                  </span>
                </div>
              </div>

              <div className="flex flex-col text-center md:text-left">
                <p className="text-xs text-zinc-400 font-light tracking-wide">
                  © 2026 By{" "}
                  <span className="font-bold text-white tracking-widest uppercase drop-shadow-sm">
                    OBNITHI CONSTRUCTION CO., LTD.
                  </span>
                </p>
              </div>
            </div>

            {/* Right Section: Legal Links */}
            <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-white/[0.02] border border-transparent hover:bg-white/10 hover:border-white/20 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300"
              >
                Privacy
              </a>

              {/* Glass Separator Dot */}
              <div className="w-1.5 h-1.5 bg-white/20 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>

              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-white/[0.02] border border-transparent hover:bg-white/10 hover:border-white/20 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300"
              >
                Terms
              </a>

              {/* Glass Separator Dot */}
              <div className="w-1.5 h-1.5 bg-white/20 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>

              <a
                href="/cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-white/[0.02] border border-transparent hover:bg-white/10 hover:border-white/20 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300"
              >
                Cookies
              </a>
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
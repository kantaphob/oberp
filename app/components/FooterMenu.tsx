"use client";

import React from "react";

const navLinks = [
  { href: "/#info", label: "หน้าหลัก" },
  { href: "/#about", label: "เกี่ยวกับเรา" },
  { href: "/#vision", label: "วิสัยทัศน์" },
  { href: "/#service", label: "บริการ" },
  { href: "/#portfolio", label: "ผลงาน" },
  { href: "/#contact", label: "ติดต่อเรา" },
];

export default function FooterMenu() {
  return (
    // ถอดพื้นหลังกระจกออก ปล่อยโปร่งใส (Transparent)
    <div className="w-full py-8 px-8 flex flex-wrap justify-center items-center gap-x-10 gap-y-4 relative z-10">
      {navLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-widest relative group"
        >
          {link.label}
          <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
        </a>
      ))}
    </div>
  );
}

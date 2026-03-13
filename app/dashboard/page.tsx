"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  HardHat, TrendingUp, Users, FileText, CheckCircle2,
  AlertTriangle, Clock, ArrowUpRight, BarChart3, Wallet,
  ShoppingCart, Network, Building2, Wrench, Calendar,
  ChevronRight, Activity, Star, Zap,
} from "lucide-react";

// ── Fade-in variants ──────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
});

// ── Stat card data ────────────────────────────────────────────────────────────
const STATS = [
  { label: "โปรเจคทั้งหมด",   value: "24",   sub: "+3 เดือนนี้",  icon: HardHat,    color: "#4f46e5", bg: "rgba(79,70,229,0.08)",   glow: "rgba(79,70,229,0.18)"  },
  { label: "พนักงานในระบบ",  value: "187",  sub: "Active users", icon: Users,       color: "#0891b2", bg: "rgba(8,145,178,0.08)",   glow: "rgba(8,145,178,0.18)"  },
  { label: "งบประมาณใช้ไป",  value: "68%",  sub: "Q1 Budget",    icon: Wallet,      color: "#059669", bg: "rgba(5,150,105,0.08)",   glow: "rgba(5,150,105,0.18)"  },
  { label: "PO รอดำเนินการ", value: "12",   sub: "ต้องอนุมัติ",  icon: ShoppingCart,color: "#d97706", bg: "rgba(217,119,6,0.08)",   glow: "rgba(217,119,6,0.18)"  },
];

// ── Quick links ───────────────────────────────────────────────────────────────
const QUICK_LINKS = [
  { label: "Project Timeline", icon: Calendar,  href: "/dashboard/operations/project",    color: "#4f46e5" },
  { label: "BOQ Management",   icon: BarChart3,  href: "/dashboard/finance/boq",           color: "#0891b2" },
  { label: "HR / Employees",   icon: Users,      href: "/dashboard/hrm/employee",          color: "#059669" },
  { label: "Purchase Orders",  icon: ShoppingCart,href: "/dashboard/operations/po",        color: "#d97706" },
  { label: "Job Roles",        icon: Network,    href: "/dashboard/omega/Classification/JobRole", color: "#7c3aed" },
  { label: "Departments",      icon: Building2,  href: "/dashboard/omega/Classification/Department", color: "#0e7490" },
  { label: "Services",         icon: Wrench,     href: "/dashboard/omega/service",         color: "#be185d" },
  { label: "Reports",          icon: FileText,   href: "/dashboard/reports",               color: "#475569" },
];

// ── Mock activity feed ────────────────────────────────────────────────────────
const ACTIVITIES = [
  { icon: CheckCircle2, color: "#059669", bg: "rgba(5,150,105,0.10)", label: "อนุมัติ PO #2024-089",       time: "2 นาทีที่แล้ว",    user: "สมชาย ก." },
  { icon: Users,        color: "#4f46e5", bg: "rgba(79,70,229,0.10)", label: "เพิ่มพนักงานใหม่ 3 คน",       time: "14 นาทีที่แล้ว",   user: "HR Team" },
  { icon: AlertTriangle,color: "#d97706", bg: "rgba(217,119,6,0.10)", label: "วัสดุใกล้หมด: เหล็กเส้น",     time: "1 ชั่วโมงที่แล้ว", user: "คลังสินค้า" },
  { icon: HardHat,      color: "#0891b2", bg: "rgba(8,145,178,0.10)", label: "รายงานไซต์ประจำวัน — Site A",  time: "2 ชั่วโมงที่แล้ว", user: "วิเชียร ส." },
  { icon: FileText,     color: "#7c3aed", bg: "rgba(124,58,237,0.10)","label": "อัปเดต BOQ โปรเจค Ladprao", time: "3 ชั่วโมงที่แล้ว", user: "ฝ่ายการเงิน" },
];

// ── Mock projects ─────────────────────────────────────────────────────────────
const PROJECTS = [
  { name: "Ladprao Residence",  progress: 78, status: "on-track",  team: 14, budget: "₿ 12.4M" },
  { name: "Srinakarin Office",  progress: 45, status: "at-risk",   team: 9,  budget: "₿ 8.1M"  },
  { name: "Bangna Warehouse",   progress: 91, status: "on-track",  team: 7,  budget: "₿ 5.6M"  },
  { name: "Thonglor Condo",     progress: 22, status: "delayed",   team: 11, budget: "₿ 18.9M" },
];

const STATUS_CFG = {
  "on-track": { label: "On Track",  color: "#059669", bg: "rgba(5,150,105,0.10)",   border: "rgba(110,231,183,0.5)"  },
  "at-risk":  { label: "At Risk",   color: "#d97706", bg: "rgba(217,119,6,0.10)",   border: "rgba(253,186,116,0.5)"  },
  "delayed":  { label: "Delayed",   color: "#be123c", bg: "rgba(190,18,60,0.10)",   border: "rgba(253,164,175,0.5)"  },
};

export default function HomeDashboard() {
  const { data: session } = useSession();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = time.getHours();
  const greeting = hour < 12 ? "อรุณสวัสดิ์" : hour < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";
  const greetEn  = hour < 12 ? "Good Morning"  : hour < 17 ? "Good Afternoon"  : "Good Evening";

  const displayName = session?.user?.firstName
    ? `${session.user.firstName}${session.user?.lastName ? " " + session.user.lastName : ""}`
    : session?.user?.username || "Guest";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

        .hd-root { font-family: 'DM Sans', sans-serif; }

        /* Liquid glass card */
        .hd-glass {
          background: linear-gradient(145deg, rgba(255,255,255,0.90) 0%, rgba(248,250,255,0.88) 100%);
          backdrop-filter: blur(20px) saturate(1.6) brightness(1.02);
          -webkit-backdrop-filter: blur(20px) saturate(1.6) brightness(1.02);
          border: 1px solid rgba(255,255,255,0.88);
          box-shadow: 0 4px 28px rgba(148,163,220,0.13), 0 1px 0 rgba(255,255,255,0.95) inset;
        }
        /* Hero glass */
        .hd-hero {
          background: linear-gradient(125deg,
            rgba(255,255,255,0.82) 0%,
            rgba(240,245,255,0.75) 50%,
            rgba(235,240,255,0.70) 100%);
          backdrop-filter: blur(32px) saturate(1.8) brightness(1.04);
          -webkit-backdrop-filter: blur(32px) saturate(1.8) brightness(1.04);
          border: 1px solid rgba(255,255,255,0.90);
          box-shadow:
            0 8px 40px rgba(99,113,220,0.14),
            0 1px 0 rgba(255,255,255,1) inset,
            0 -1px 0 rgba(180,190,230,0.08) inset;
        }
        /* Stat card */
        .hd-stat {
          position:relative; overflow:hidden; border-radius: 20px; padding: 20px;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .hd-stat:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(148,163,220,0.22), 0 1px 0 rgba(255,255,255,0.95) inset !important;
        }
        .hd-stat::before {
          content:''; position:absolute; inset:0; border-radius:inherit;
          background: linear-gradient(160deg, rgba(255,255,255,0.6) 0%, transparent 50%);
          pointer-events:none;
        }
        /* Quick link tile */
        .hd-tile {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:8px; padding: 16px 10px; border-radius:18px; cursor:pointer;
          transition: all 0.2s; text-align:center; text-decoration:none;
        }
        .hd-tile:hover { transform: translateY(-3px); }
        /* Progress bar */
        .hd-prog-track { height:5px; background:rgba(203,213,240,0.5); border-radius:99px; overflow:hidden; }
        .hd-prog-bar   { height:100%; border-radius:99px; transition: width 1s cubic-bezier(.22,1,.36,1); }
        /* Activity dot pulse */
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        /* Blob bg */
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        .hd-blob { animation: blob 8s ease-in-out infinite; }
        .hd-blob-2 { animation: blob 10s ease-in-out infinite reverse; }
        /* Clock font */
        .hd-clock { font-variant-numeric: tabular-nums; letter-spacing:-0.02em; }
        /* Section label */
        .hd-section-label {
          font-size:10px; font-weight:800; letter-spacing:0.14em; text-transform:uppercase;
          color:rgba(148,163,184,0.9); display:flex; align-items:center; gap:8px;
        }
        .hd-section-label::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(203,213,240,0.6),transparent); }
        /* Divider */
        .hd-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(148,163,220,0.25) 30%,rgba(148,163,220,0.25) 70%,transparent); }
        /* Scroll hide */
        .hd-scroll::-webkit-scrollbar { display:none; }
        .hd-scroll { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <div className="hd-root relative min-h-full space-y-6 overflow-hidden">

        {/* ── Ambient background blobs ───────────────────── */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="hd-blob absolute -top-32 -left-32 w-[500px] h-[500px] opacity-25"
            style={{ background: "radial-gradient(circle, rgba(99,130,255,0.35) 0%, transparent 70%)" }} />
          <div className="hd-blob-2 absolute -bottom-40 -right-32 w-[600px] h-[600px] opacity-20"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.30) 0%, transparent 70%)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] opacity-10"
            style={{ background: "radial-gradient(ellipse, rgba(56,189,248,0.4) 0%, transparent 70%)" }} />
        </div>

        {/* ── Hero Welcome Banner ────────────────────────── */}
        <motion.div {...fadeUp(0)} className="hd-hero relative rounded-3xl overflow-hidden p-6 md:p-8">
          {/* Architectural image strip */}
          <div className="absolute right-0 top-0 bottom-0 w-72 md:w-96 overflow-hidden rounded-r-3xl">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop"
              alt="Construction"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
          </div>

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Greeting */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-500">{greetEn}</span>
                <span className="w-1 h-1 rounded-full bg-indigo-300" />
                <span className="text-[11px] font-semibold text-slate-400">
                  {time.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>

              <h1 style={{ fontFamily: "'Instrument Serif', serif" }}
                className="text-3xl md:text-4xl font-normal text-slate-800 leading-tight">
                {greeting},{" "}
                <span className="italic text-indigo-600">{displayName}</span>
              </h1>

              <p className="text-[13px] text-slate-500 max-w-md">
                ยินดีต้อนรับกลับสู่ <span className="font-bold text-slate-700">OBNITHI ERP</span> — ภาพรวมระบบงานวันนี้อยู่ด้านล่าง
              </p>

              {/* Role + dept chips */}
              {session?.user && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {session.user.roleName && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold"
                      style={{ background: "rgba(79,70,229,0.10)", color: "#4338ca", border: "1px solid rgba(165,180,252,0.5)" }}>
                      <Network size={11} /> {session.user.roleName}
                    </span>
                  )}
                  {session.user.departmentName && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold"
                      style={{ background: "rgba(8,145,178,0.10)", color: "#0e7490", border: "1px solid rgba(165,234,250,0.5)" }}>
                      <Building2 size={11} /> {session.user.departmentName}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Live clock */}
            <div className="hd-glass rounded-2xl px-6 py-4 text-center shrink-0">
              <p className="hd-clock text-4xl font-black text-slate-800 tabular-nums leading-none">
                {time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1 tracking-wide">เวลาปัจจุบัน</p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-emerald-600 font-bold">LIVE</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── KPI Stat Cards ─────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...fadeUp(0.1 + i * 0.07)}>
              <div className="hd-stat hd-glass">
                {/* Glow blob */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)` }} />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <p className="text-3xl font-black text-slate-800 leading-tight mt-1">{s.value}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">{s.sub}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: s.bg, border: `1px solid ${s.glow}` }}>
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                </div>

                {/* Mini sparkline placeholder */}
                <div className="relative mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-full transition-all"
                    style={{ width: `${30 + i * 20}%`, background: s.color, opacity: 0.6 }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main Grid: Projects + Activity ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">

          {/* Projects — 2 cols */}
          <motion.div {...fadeUp(0.35)} className="lg:col-span-2">
            <div className="hd-glass rounded-2xl overflow-hidden h-full">
              <div className="px-5 py-4 flex items-center justify-between border-b border-white/50">
                <p className="hd-section-label flex-1"><HardHat size={12} className="text-slate-400" />โปรเจคที่กำลังดำเนินการ</p>
                <Link href="/dashboard/operations/project"
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors ml-4 shrink-0">
                  ดูทั้งหมด <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="divide-y divide-white/40">
                {PROJECTS.map((p, i) => {
                  const sc = STATUS_CFG[p.status as keyof typeof STATUS_CFG];
                  return (
                    <motion.div key={p.name} {...fadeUp(0.4 + i * 0.06)}
                      className="px-5 py-4 hover:bg-white/40 transition-colors group">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-[11px]"
                            style={{ background: `linear-gradient(135deg, ${sc.color}cc, ${sc.color}88)` }}>
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-slate-800 truncate">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Users size={9} /> {p.team} คน
                              </span>
                              <span className="text-[10px] text-slate-400">{p.budget}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <span className="text-[11px] font-black text-slate-700">{p.progress}%</span>
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold"
                            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            {sc.label}
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="hd-prog-track ml-11">
                        <div className="hd-prog-bar" style={{ width: `${p.progress}%`, background: `linear-gradient(90deg, ${sc.color}88, ${sc.color})` }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Activity Feed — 1 col */}
          <motion.div {...fadeUp(0.38)}>
            <div className="hd-glass rounded-2xl overflow-hidden h-full flex flex-col">
              <div className="px-5 py-4 border-b border-white/50 flex items-center justify-between">
                <p className="hd-section-label flex-1"><Activity size={12} className="text-slate-400" />กิจกรรมล่าสุด</p>
              </div>
              <div className="flex-1 overflow-y-auto hd-scroll divide-y divide-white/40">
                {ACTIVITIES.map((a, i) => (
                  <motion.div key={i} {...fadeUp(0.45 + i * 0.05)}
                    className="px-4 py-3.5 flex items-start gap-3 hover:bg-white/40 transition-colors">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: a.bg }}>
                      <a.icon size={13} style={{ color: a.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-slate-700 leading-tight">{a.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">{a.user}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={9} /> {a.time}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-white/50">
                <button className="w-full text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors flex items-center justify-center gap-1">
                  ดูกิจกรรมทั้งหมด <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Quick Access Grid ──────────────────────────── */}
        <motion.div {...fadeUp(0.55)}>
          <div className="hd-glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/50">
              <p className="hd-section-label"><Zap size={12} className="text-slate-400" />Quick Access</p>
            </div>
            <div className="p-4 grid grid-cols-4 sm:grid-cols-8 gap-2">
              {QUICK_LINKS.map((q, i) => (
                <motion.div key={q.label} {...fadeUp(0.58 + i * 0.04)}>
                  <Link href={q.href} className="hd-tile hd-glass group"
                    style={{ ["--hover-color" as string]: q.color }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ background: `${q.color}14`, border: `1px solid ${q.color}28` }}>
                      <q.icon size={18} style={{ color: q.color }} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors leading-tight text-center">
                      {q.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Bottom strip: System info ──────────────────── */}
        <motion.div {...fadeUp(0.65)}>
          <div className="hd-glass rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/25 shrink-0">
                <Star size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-700">OBNITHI ERP — Construction Management System</p>
                <p className="text-[10px] text-slate-400">Version 2.0 · Last sync: {time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "Operations", color: "#4f46e5" },
                { label: "Finance",    color: "#059669" },
                { label: "HR",         color: "#0891b2" },
                { label: "Master Data",color: "#d97706" },
              ].map(m => (
                <span key={m.label}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
                  style={{ background: `${m.color}10`, color: m.color, border: `1px solid ${m.color}25` }}>
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </>
  );
}
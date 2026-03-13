"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  Menu as MenuIcon,
  X,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  User as UserIcon,
  LayoutDashboard,
  House,
  Database,
  MapPin,
  ShieldCheck,
  User,
  HardHat,
  ShoppingCart,
  FolderOpen,
  Wallet,
  Calculator,
  TrendingUp,
  Users,
  Settings,
  Circle,
  Network,
  Building2,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getRolePalette } from "@/app/lib/ui-configs";

const IconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  House,
  Database,
  MapPin,
  ShieldCheck,
  User,
  HardHat,
  ShoppingCart,
  FolderOpen,
  Wallet,
  Calculator,
  TrendingUp,
  Users,
  Settings,
  Network,
  Building2,
  Layers,
};

type ThemeClass = {
  activeBg: string;
  activeText: string;
  hoverBg: string;
  hoverText: string;
  iconActive: string;
  indicator: string;
};
type SubMenu = { name: string; href: string };
type MenuCategory = {
  id: string;
  title: string;
  icon: string;
  subMenus: SubMenu[];
};
type MenuGroup = {
  groupName: string;
  accentDot: string;
  themeClass: ThemeClass;
  items: MenuCategory[];
};

export const MENU_DATA: MenuGroup[] = [
  // ── 1. OVERVIEW ──────────────────────────────────────────────────────────
  {
    groupName: "Overview",
    accentDot: "bg-indigo-500",
    themeClass: {
      activeBg: "bg-indigo-50",
      activeText: "text-indigo-700",
      hoverBg: "hover:bg-indigo-50/50",
      hoverText: "hover:text-indigo-700",
      iconActive: "text-indigo-600",
      indicator: "bg-indigo-500",
    },
    items: [
      {
        id: "dashboard-core",
        title: "Dashboard",
        icon: "LayoutDashboard",
        subMenus: [{ name: "Home", href: "/dashboard" }],
      },
    ],
  },

  // ── 2. ORGANIZATION (Department / JobLine / JobRole) ─────────────────────
  {
    groupName: "Organization",
    accentDot: "bg-red-500",
    themeClass: {
      activeBg: "bg-red-50",
      activeText: "text-red-700",
      hoverBg: "hover:bg-red-50/50",
      hoverText: "hover:text-red-700",
      iconActive: "text-red-600",
      indicator: "bg-red-500",
    },
    items: [
      {
        id: "department",
        title: "Departments",
        icon: "Building2",
        subMenus: [
          {
            name: "แผนกทั้งหมด",
            href: "/dashboard/omega/Classification/Department",
          },
        ],
      },
      {
        id: "jobline",
        title: "Job Lines",
        icon: "Layers",
        subMenus: [
          {
            name: "สายงานวิชาชีพ",
            href: "/dashboard/omega/Classification/JobLine",
          },
        ],
      },
      {
        id: "jobrole",
        title: "Job Roles",
        icon: "Network",
        subMenus: [
          {
            name: "ตำแหน่งงาน",
            href: "/dashboard/omega/Classification/JobRole",
          },
        ],
      },
    ],
  },

  // ── 3. MASTER DATA ────────────────────────────────────────────────────────
  {
    groupName: "Master Data",
    accentDot: "bg-rose-600",
    themeClass: {
      activeBg: "bg-rose-50",
      activeText: "text-rose-700",
      hoverBg: "hover:bg-rose-50/50",
      hoverText: "hover:text-rose-700",
      iconActive: "text-rose-600",
      indicator: "bg-rose-600",
    },
    items: [
      {
        id: "Services",
        title: "Services",
        icon: "House",
        subMenus: [{ name: "Services", href: "/dashboard/omega/service" }],
      },
      {
        id: "BOQ",
        title: "BOQ",
        icon: "Database",
        subMenus: [
          { name: "Unit", href: "/dashboard/omega/boq/Unit" },
          { name: "WBSGroup", href: "/dashboard/omega/boq/WBSGroup" },
          {
            name: "MaterialCategory",
            href: "/dashboard/omega/boq/MaterialCategory",
          },
          {
            name: "MaterialCatalog",
            href: "/dashboard/omega/boq/MaterialCatalog",
          },
        ],
      },
      {
        id: "Postcode",
        title: "Postcode",
        icon: "MapPin",
        subMenus: [
          {
            name: "Postcode",
            href: "/dashboard/omega/Classification/postcode",
          },
        ],
      },
      {
        id: "Permission",
        title: "Permission",
        icon: "ShieldCheck",
        subMenus: [
          { name: "Permission", href: "/dashboard/omega/permission" },
          { name: "ActivityLog", href: "/dashboard/omega/activityLog" },
          { name: "Report", href: "/dashboard/omega/report" },
        ],
      },
    ],
  },

  // ── 4. ADMINISTRATOR ──────────────────────────────────────────────────────
  {
    groupName: "Administrator",
    accentDot: "bg-orange-600",
    themeClass: {
      activeBg: "bg-orange-50",
      activeText: "text-orange-700",
      hoverBg: "hover:bg-orange-50/50",
      hoverText: "hover:text-orange-700",
      iconActive: "text-orange-600",
      indicator: "bg-orange-600",
    },
    items: [
      {
        id: "user",
        title: "User",
        icon: "User",
        subMenus: [
          { name: "User", href: "/dashboard/admin/user" },
          { name: "User Profile", href: "/dashboard/admin/userProfile" },
        ],
      },
    ],
  },

  // ── 5. OPERATIONS ─────────────────────────────────────────────────────────
  {
    groupName: "Operations",
    accentDot: "bg-blue-600",
    themeClass: {
      activeBg: "bg-blue-50",
      activeText: "text-blue-700",
      hoverBg: "hover:bg-blue-50/50",
      hoverText: "hover:text-blue-700",
      iconActive: "text-blue-600",
      indicator: "bg-blue-600",
    },
    items: [
      {
        id: "project",
        title: "ระบบงานโปรเจค",
        icon: "HardHat",
        subMenus: [
          { name: "Project Timeline", href: "/" },
          { name: "Daily Site Report", href: "/" },
          { name: "Task Assignment", href: "/" },
          { name: "Defect Tracking", href: "/" },
        ],
      },
      {
        id: "procurement",
        title: "จัดซื้อ & คลังสินค้า",
        icon: "ShoppingCart",
        subMenus: [
          { name: "Purchase Request (PR)", href: "/" },
          { name: "Purchase Order (PO)", href: "/" },
          { name: "Inventory Tracking", href: "/" },
        ],
      },
      {
        id: "document",
        title: "จัดการเอกสาร",
        icon: "FolderOpen",
        subMenus: [
          { name: "Blueprints & 3D", href: "/" },
          { name: "Licenses & Specs", href: "/" },
        ],
      },
    ],
  },

  // ── 6. FINANCE & SALES ────────────────────────────────────────────────────
  {
    groupName: "Finance & Sales",
    accentDot: "bg-emerald-500",
    themeClass: {
      activeBg: "bg-emerald-50",
      activeText: "text-emerald-700",
      hoverBg: "hover:bg-emerald-50/50",
      hoverText: "hover:text-emerald-700",
      iconActive: "text-emerald-600",
      indicator: "bg-emerald-500",
    },
    items: [
      {
        id: "cost-control",
        title: "ควบคุมงบประมาณ",
        icon: "Wallet",
        subMenus: [
          { name: "BOQ Management", href: "/" },
          { name: "Actual vs Budget", href: "/" },
        ],
      },
      {
        id: "accounting",
        title: "บัญชี & การเงิน",
        icon: "Calculator",
        subMenus: [
          { name: "Billing & Invoicing", href: "/" },
          { name: "AP / AR", href: "/" },
          { name: "Petty Cash", href: "/" },
        ],
      },
      {
        id: "sale",
        title: "ฝ่ายขาย & ลูกค้า",
        icon: "TrendingUp",
        subMenus: [
          { name: "Lead Management", href: "/" },
          { name: "Quotation & Contract", href: "/" },
          { name: "Customer Follow-up", href: "/" },
        ],
      },
    ],
  },

  // ── 7. MANAGEMENT ─────────────────────────────────────────────────────────
  {
    groupName: "Management",
    accentDot: "bg-violet-500",
    themeClass: {
      activeBg: "bg-violet-50",
      activeText: "text-violet-700",
      hoverBg: "hover:bg-violet-50/50",
      hoverText: "hover:text-violet-700",
      iconActive: "text-violet-600",
      indicator: "bg-violet-500",
    },
    items: [
      {
        id: "hrm",
        title: "ทรัพยากรบุคคล",
        icon: "Users",
        subMenus: [
          { name: "Employee & Sub", href: "/dashboard/hrm/employee" },
          {
            name: "Construction Team",
            href: "/dashboard/hrm/constructionTeam",
          },
          { name: "Time Attendance", href: "/" },
          { name: "Payroll & Wages", href: "/" },
        ],
      },
      {
        id: "admin",
        title: "ผู้ดูแลระบบ",
        icon: "Settings",
        subMenus: [
          { name: "Role-Based Access", href: "/" },
          { name: "Master Data", href: "/" },
        ],
      },
    ],
  },
];

const getIcon = (name: string) => IconMap[name] ?? Circle;

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setIsCollapsed(true);
  }, []);

  useEffect(() => {
    if (openCategories.length === 0 && MENU_DATA.length > 0) {
      setOpenCategories(
        MENU_DATA.flatMap((g) => g.items)
          .slice(0, 2)
          .map((i) => i.id),
      );
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const handleCategoryClick = (id: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem("sidebar-collapsed", "false");
      if (!openCategories.includes(id)) setOpenCategories((p) => [...p, id]);
      return;
    }
    setOpenCategories((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  };

  const roleName = session?.user?.roleName || "";
  const palette = getRolePalette(roleName);

  return (
    <>
      {/* ── Mobile toggle ── */}
      <button
        className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm lg:hidden"
        onClick={() => setIsMobileOpen((p) => !p)}
      >
        {isMobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
      </button>

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen
        bg-white border-r border-slate-200
        flex flex-col transition-all duration-300 ease-in-out shadow-sm shrink-0
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "w-[80px]" : "w-72"}
      `}
      >
        {/* ── Liquid Glass CSS ── */}
        <style>{`
          .liquid-glass-card {
            background: linear-gradient(135deg,rgba(255,255,255,0.72) 0%,rgba(255,255,255,0.48) 40%,rgba(240,245,255,0.52) 100%);
            backdrop-filter: blur(20px) saturate(1.8) brightness(1.05);
            -webkit-backdrop-filter: blur(20px) saturate(1.8) brightness(1.05);
            border: 1px solid rgba(255,255,255,0.85);
            box-shadow: 0 2px 24px rgba(148,163,220,0.18), 0 1px 0 rgba(255,255,255,0.9) inset;
          }
          .liquid-glass-card::before {
            content:''; position:absolute; inset:0; border-radius:inherit;
            background: linear-gradient(160deg,rgba(255,255,255,0.55) 0%,transparent 45%);
            pointer-events:none;
          }
          .liquid-avatar {
            background: linear-gradient(135deg,#60a5fa 0%,#818cf8 100%);
          }
          .liquid-logout {
            background: linear-gradient(135deg,rgba(255,241,242,0.85) 0%,rgba(254,226,226,0.75) 100%);
            border: 1px solid rgba(252,165,165,0.45);
            backdrop-filter: blur(8px);
            box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 8px rgba(239,68,68,0.08);
            transition: all 0.2s ease;
          }
          .liquid-logout:hover {
            background: linear-gradient(135deg,rgba(255,228,230,0.95) 0%,rgba(254,202,202,0.88) 100%);
            box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 16px rgba(239,68,68,0.15);
            transform: translateY(-1px);
          }
          .liquid-divider {
            height:1px;
            background: linear-gradient(90deg,transparent,rgba(148,163,220,0.3) 30%,rgba(148,163,220,0.3) 70%,transparent);
          }
          .liquid-row   { display:flex; align-items:flex-start; gap:6px; min-width:0; }
          .liquid-label {
            font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
            color:rgba(148,163,184,0.9); white-space:nowrap; line-height:1.6;
            padding-top:1px; min-width:46px;
          }
          .liquid-value {
            font-size:11px; font-weight:600; color:#334155;
            overflow:hidden; text-overflow:ellipsis; white-space:nowrap; line-height:1.6;
          }
          .online-dot {
            background: radial-gradient(circle at 35% 35%,#6ee7b7,#10b981);
            box-shadow: 0 0 0 2px rgba(255,255,255,0.9), 0 0 6px rgba(16,185,129,0.5);
          }
          .liquid-glass-collapsed {
            background: linear-gradient(135deg,rgba(255,255,255,0.7),rgba(240,245,255,0.6));
            backdrop-filter: blur(16px) saturate(1.6);
            -webkit-backdrop-filter: blur(16px) saturate(1.6);
            border: 1px solid rgba(255,255,255,0.8);
            box-shadow: 0 2px 16px rgba(148,163,220,0.15), 0 1px 0 rgba(255,255,255,0.9) inset;
          }
          .custom-scrollbar::-webkit-scrollbar       { width:4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background:transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:10px; }
        `}</style>

        {/* ── Logo header ── */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
          <div
            className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isCollapsed ? "w-10" : "w-full"}`}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20 shrink-0">
              OB
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-slate-900 leading-none">
                  OBNITHI
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-[0.2em] uppercase mt-1">
                  ERP System
                </span>
              </div>
            )}
          </div>
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="space-y-6">
            {MENU_DATA.map((group, gIdx) => (
              <div key={`${group.groupName}-${gIdx}`} className="space-y-1">
                {/* Group label */}
                {!isCollapsed ? (
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${group.accentDot}`}
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                      {group.groupName}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-center mb-2">
                    <span
                      className={`w-2 h-2 rounded-full ${group.accentDot} opacity-50`}
                    />
                  </div>
                )}

                <ul className="space-y-1.5">
                  {group.items.map((category) => {
                    const isOpen = openCategories.includes(category.id);
                    const isCategoryActive = category.subMenus.some(
                      (s) => pathname.startsWith(s.href) && s.href !== "/",
                    );
                    const Icon = getIcon(category.icon);
                    const theme = group.themeClass;

                    return (
                      <li key={category.id} className="flex flex-col">
                        <button
                          onClick={() => handleCategoryClick(category.id)}
                          aria-expanded={isOpen}
                          title={isCollapsed ? category.title : ""}
                          className={`
                            flex items-center justify-between w-full rounded-xl
                            transition-all duration-200 group relative
                            ${isCollapsed ? "px-0 justify-center h-12" : "px-3 py-2.5"}
                            ${
                              isCategoryActive
                                ? `${theme.activeBg} ${theme.activeText} font-semibold`
                                : `text-slate-600 ${theme.hoverBg} ${theme.hoverText}`
                            }
                          `}
                        >
                          {isCollapsed && isCategoryActive && (
                            <div
                              className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-md ${theme.indicator}`}
                            />
                          )}

                          <div
                            className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}
                          >
                            <Icon
                              size={isCollapsed ? 22 : 20}
                              className={`transition-colors ${isCategoryActive ? theme.iconActive : "text-slate-400"}`}
                            />
                            {!isCollapsed && (
                              <span className="text-[13px]">
                                {category.title}
                              </span>
                            )}
                          </div>

                          {!isCollapsed && (
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown
                                size={14}
                                className={
                                  isCategoryActive
                                    ? theme.iconActive
                                    : "text-slate-400"
                                }
                              />
                            </motion.div>
                          )}
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && !isCollapsed && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden pt-1 pb-2 space-y-0.5"
                            >
                              {category.subMenus.map((sub) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <li key={sub.name}>
                                    <Link
                                      href={sub.href}
                                      onClick={() => setIsMobileOpen(false)}
                                      className={`
                                        flex items-center pl-10 pr-3 py-2 rounded-lg
                                        text-[12px] transition-all duration-200 relative
                                        ${
                                          isSubActive
                                            ? `${theme.activeBg} ${theme.activeText} font-medium`
                                            : `text-slate-500 hover:text-slate-900 ${theme.hoverBg}`
                                        }
                                      `}
                                    >
                                      <span
                                        className={`
                                        absolute left-[22px] top-1/2 -translate-y-1/2
                                        w-1.5 h-1.5 rounded-full transition-colors duration-200
                                        ${isSubActive ? theme.indicator : "bg-slate-300"}
                                      `}
                                      />
                                      {sub.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* ── User Profile Section ── */}
        <div className="p-3 border-t border-slate-100">
          {!isCollapsed ? (
            <div className="liquid-glass-card relative rounded-2xl p-3.5 overflow-hidden">
              {/* Ambient blobs */}
              <div
                className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)`,
                }}
              />
              <div
                className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)`,
                }}
              />

              {/* Avatar + Name */}
              <div className="relative flex items-center gap-3">
                <div className="relative shrink-0">
                  <div
                    className="liquid-avatar w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{
                      boxShadow: `0 4px 16px ${palette.glow}, 0 1px 0 rgba(255,255,255,0.6) inset`,
                    }}
                  >
                    <UserIcon size={18} />
                  </div>
                  <span className="online-dot absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-800 truncate leading-tight">
                    {session?.user?.lastName
                      ? `${session.user?.firstName || ""} ${session.user.lastName}`
                      : session?.user?.firstName || "Guest"}
                  </p>
                  <span
                    className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase"
                    style={{
                      background: palette.bg,
                      border: `1px solid ${palette.border}`,
                      color: palette.text,
                      boxShadow: `0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 8px ${palette.glow}`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
                      style={{ background: palette.text, opacity: 0.7 }}
                    />
                    {roleName || "User"}
                  </span>
                </div>
              </div>

              <div className="liquid-divider my-2.5" />

              {/* Info rows */}
              <div className="relative space-y-1.5">
                <div className="liquid-row">
                  <span className="liquid-label">User</span>
                  <span className="liquid-value font-mono text-slate-500">
                    @{session?.user?.username || "guest"}
                  </span>
                </div>
                <div className="liquid-row">
                  <span className="liquid-label">Dept.</span>
                  <span className="liquid-value">
                    {session?.user?.departmentName || (
                      <span
                        style={{
                          color: "#cbd5e1",
                          fontStyle: "italic",
                          fontWeight: 400,
                        }}
                      >
                        —
                      </span>
                    )}
                  </span>
                </div>
                <div className="liquid-row">
                  <span className="liquid-label">Line</span>
                  <span className="liquid-value">
                    {session?.user?.jobLineName || (
                      <span
                        style={{
                          color: "#cbd5e1",
                          fontStyle: "italic",
                          fontWeight: 400,
                        }}
                      >
                        —
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="liquid-divider my-2.5" />

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="liquid-logout w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-rose-500 text-[11px] font-semibold"
              >
                <LogOut size={12} />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            /* Collapsed */
            <div className="flex flex-col items-center gap-2">
              <div className="liquid-glass-collapsed relative rounded-2xl p-2 flex flex-col items-center gap-2 w-full">
                <div className="relative">
                  <div
                    className="liquid-avatar w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{
                      boxShadow: `0 4px 16px ${palette.glow}, 0 1px 0 rgba(255,255,255,0.6) inset`,
                    }}
                  >
                    <UserIcon size={18} />
                  </div>
                  <span className="online-dot absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" />
                </div>
                <span
                  className="w-2 h-2 rounded-full"
                  title={roleName || "User"}
                  style={{ background: palette.text, opacity: 0.6 }}
                />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  title="ออกจากระบบ"
                  className="liquid-logout flex items-center justify-center w-9 h-8 rounded-xl text-rose-500"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

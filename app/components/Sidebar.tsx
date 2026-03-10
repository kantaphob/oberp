"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu as MenuIcon,
  X,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ThemeClass = {
  activeBg: string;
  activeText: string;
  hoverBg: string;
  hoverText: string;
  iconActive: string;
  indicator: string;
};

type SubMenu = {
  name: string;
  href: string;
};

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
  {
    groupName: "Alpha and Omega",
    accentDot: "bg-red-600",
    themeClass: {
      activeBg: "bg-red-50",
      activeText: "text-red-700",
      hoverBg: "hover:bg-red-50/50",
      hoverText: "hover:text-red-700",
      iconActive: "text-red-600",
      indicator: "bg-red-600",
    },
    items: [
      {
        id: "dashboard-core",
        title: "Alpha & Omega",
        icon: "LayoutDashboard",
        subMenus: [
          { name: "Master Data", href: "/dashboard/omega/" },
          {
            name: "Department",
            href: "/dashboard/omega/Classification/Department",
          },
          { name: "JobLine", href: "/dashboard/omega/Classification/JobLine" },
          { name: "JobRole", href: "/dashboard/omega/Classification/JobRole" },
        ],
      },
      {
        id: "Services",
        title: "Services",
        icon: "House",
        subMenus: [
          {
            name: "Services",
            href: "/dashboard/omega/service",
          },
        ],
      },
      {
        id: "BOQ",
        title: "BOQ",
        icon: "Database",
        subMenus: [
          {
            name: "Unit",
            href: "/dashboard/omega/boq/Unit",
          },
          {
            name: "WBSGroup",
            href: "/dashboard/omega/boq/WBSGroup",
          },

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
          {
            name: "Permission",
            href: "/dashboard/omega/Permission",
          },
        ],
      },
    ],
  },
  {
    groupName: "OPERATIONS",
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
          {
            name: "Inventory Tracking",
            href: "/",
          },
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
  {
    groupName: "FINANCE & SALES",
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
          {
            name: "Billing & Invoicing",
            href: "/",
          },
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
  {
    groupName: "MANAGEMENT",
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
          { name: "Employee & Sub", href: "/" },
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

const getIcon = (iconName: string) => {
  const iconMap = Icons as unknown as Record<string, LucideIcon>;
  return iconMap[iconName] ?? Icons.Circle;
};

export default function Sidebar() {
  const pathname = usePathname();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  const menus = MENU_DATA;

  useEffect(() => {
    if (openCategories.length === 0 && menus.length > 0) {
      setOpenCategories(
        menus
          .flatMap((group) => group.items)
          .slice(0, 2)
          .map((item) => item.id),
      );
    }
  }, [menus]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    localStorage.setItem("sidebar-collapsed", String(!isCollapsed));
  };

  const handleCategoryClick = (categoryId: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem("sidebar-collapsed", "false");
      if (!openCategories.includes(categoryId)) {
        setOpenCategories([...openCategories, categoryId]);
      }
      return;
    }

    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm lg:hidden"
        onClick={() => setIsMobileOpen((prev) => !prev)}
      >
        {isMobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
      </button>

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

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-sm shrink-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-[80px]" : "w-72"}
        `}
      >
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

        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="space-y-6">
            {menus.map((group, groupIdx) => (
              <div key={`${group.groupName}-${groupIdx}`} className="space-y-1">
                {!isCollapsed ? (
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${group.accentDot}`}
                    ></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                      {group.groupName}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-center mb-2">
                    <span
                      className={`w-2 h-2 rounded-full ${group.accentDot} opacity-50`}
                    ></span>
                  </div>
                )}

                <ul className="space-y-1.5">
                  {group.items.map((category) => {
                    const isOpen = openCategories.includes(category.id);
                    const isCategoryActive = category.subMenus.some((sub) =>
                      pathname.startsWith(sub.href),
                    );
                    const Icon = getIcon(category.icon);
                    const theme = group.themeClass;

                    return (
                      <li key={category.id} className="flex flex-col">
                        <button
                          onClick={() => handleCategoryClick(category.id)}
                          title={isCollapsed ? category.title : ""}
                          className={`flex items-center justify-between w-full rounded-xl transition-all duration-200 group relative
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
                            ></div>
                          )}

                          <div
                            className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}
                          >
                            <Icon
                              size={isCollapsed ? 22 : 20}
                              className={`transition-colors 
                                ${isCategoryActive ? theme.iconActive : "text-slate-400 group-hover:" + theme.iconActive}
                              `}
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
                              className="overflow-hidden"
                            >
                              <div className="pt-1 pb-2 space-y-0.5">
                                {category.subMenus.map((sub) => {
                                  const isSubActive = pathname === sub.href;
                                  return (
                                    <li key={sub.name}>
                                      <Link
                                        href={sub.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`flex items-center pl-10 pr-3 py-2 rounded-lg text-[12px] transition-all duration-200 relative
                                          ${
                                            isSubActive
                                              ? `${theme.activeBg} ${theme.activeText} font-medium`
                                              : `text-slate-500 hover:text-slate-900 ${theme.hoverBg}`
                                          }
                                        `}
                                      >
                                        <span
                                          className={`absolute left-[22px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors duration-200
                                                ${isSubActive ? theme.indicator : "bg-slate-300 group-hover:bg-slate-400"}
                                            `}
                                        ></span>
                                        {sub.name}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </div>
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

        {/* Temporary static profile since auth is removed */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div
            className={`flex items-center rounded-xl p-2 transition-all duration-300 ${isCollapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
              AD
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">
                  Admin User
                </p>
                <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                  Super Administrator
                </p>
              </div>
            )}
          </div>

          <button
            className={`mt-2 flex items-center justify-center gap-2 w-full rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors font-medium text-xs
            ${isCollapsed ? "py-2" : "py-2.5"}
          `}
          >
            <LogOut size={14} />
            {!isCollapsed && <span>ออกจากระบบ</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

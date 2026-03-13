"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Activity,
  RefreshCw,
  Layers,
  Plus,
  Zap,
  Cpu,
  FileText,
  ShieldAlert,
  Building2,
} from "lucide-react";

type Department = { id: string; code: string; name: string; isActive: boolean };
type JobLine = { id: string; code: string; name: string; isActive: boolean };
type JobRole = {
  id: string;
  name: string;
  prefix: string;
  level: number;
  isActive: boolean;
  departmentId: string | null;
  jobLineId: string | null;
  parentRoleId: string | null;
  department?: Department | null;
  jobLine?: JobLine | null;
};

// Data types from DB
type BOQ = { id: string; status: string; createdAt: string };
type ServiceUs = { id: string; isActive: boolean; createdAt: string };
type Permission = {
  id: string;
  roleId: string;
  menuId: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
};

/* ─── Floating Particle Background ─── */
const ParticleField = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        width: Math.random() * 3 + 1,
        height: Math.random() * 3 + 1,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 5,
        color:
          i % 3 === 0
            ? "rgba(14,165,233,0.3)" // sky-500
            : i % 3 === 1
              ? "rgba(139,92,246,0.3)" // violet-500
              : "rgba(16,185,129,0.3)", // emerald-500
      })),
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.width,
            height: p.height,
            left: p.left,
            top: p.top,
            background: p.color,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

/* ─── Scan line effect ─── */
<motion.div
  className="absolute left-0 right-0 h-[2px] pointer-events-none z-20"
  style={{
    background:
      "linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent)",
  }}
  animate={{ top: ["0%", "100%"] }}
  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
/>;

export default function ClassificationBoard() {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [boqs, setBoqs] = useState<BOQ[]>([]);
  const [services, setServices] = useState<ServiceUs[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resOmega, resJobRoles] = await Promise.all([
        fetch("/api/omega-dashboard"),
        fetch("/api/jobroles"),
      ]);

      if (resOmega.ok && resJobRoles.ok) {
        const omegaData = await resOmega.json();
        const rolesData = await resJobRoles.json();

        setJobRoles(rolesData || []);
        setBoqs(omegaData.boqs || []);
        setServices(omegaData.services || []);
        setPermissions(omegaData.permissions || []);
        setLoadedAt(new Date().toLocaleTimeString("th-TH"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ─── Prepare Data for Structure Tab ─── */
  const roleById = new Map(jobRoles.map((r) => [r.id, r]));
  const isValidParent = (parentId?: string | null) =>
    !!parentId && parentId !== "" && roleById.has(parentId);

  const rootRoles = jobRoles.filter(
    (r) =>
      !r.parentRoleId ||
      !roleById.has(r.parentRoleId) ||
      r.parentRoleId === r.id,
  );
  const orphanRoles = jobRoles.filter(
    (r) => !!r.parentRoleId && (!roleById.has(r.parentRoleId) || r.parentRoleId === r.id),
  );
  const childrenMap = new Map<string, JobRole[]>();
  jobRoles.forEach((r) => {
    if (isValidParent(r.parentRoleId) && r.parentRoleId !== r.id) {
      if (!childrenMap.has(r.parentRoleId)) childrenMap.set(r.parentRoleId, []);
      childrenMap.get(r.parentRoleId)?.push(r);
    }
  });

  const departmentCount = new Set(
    jobRoles.map((r) => r.department?.id).filter(Boolean),
  ).size;
  const jobLineCount = new Set(
    jobRoles.map((r) => r.jobLine?.id).filter(Boolean),
  ).size;

  /* ─── Drag to Pan ─── */
  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };
  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    containerRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
    containerRef.current.scrollTop = scrollTop - (y - startY) * 1.5;
  };

  /* ─── Level color palette — 14 levels (0–13) matching user hierarchy ─── */
  const levelPalette: Record<
    number,
    {
      glow: string;
      border: string;
      badge: string;
      bar: string;
      bg: string;
      label: string;
      secondary: string;
    }
  > = {
    0: {
      glow: "0 10px 25px -5px rgba(234, 179, 8, 0.4)",
      border: "#fbbf24",
      badge: "bg-amber-100 text-amber-800 border border-amber-300 shadow-sm",
      bar: "linear-gradient(135deg, #fde047 0%, #eab308 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L0 · FND (Founder)",
      secondary: "#d97706",
    },
    1: {
      glow: "0 10px 25px -5px rgba(249, 115, 22, 0.3)",
      border: "#fdba74",
      badge: "bg-orange-100 text-orange-800 border border-orange-300",
      bar: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L1 · MD (Managing Director)",
      secondary: "#ea580c",
    },
    2: {
      glow: "0 10px 25px -5px rgba(239, 68, 68, 0.25)",
      border: "#fca5a5",
      badge: "bg-red-100 text-red-800 border border-red-300",
      bar: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L2 · CEO",
      secondary: "#dc2626",
    },
    3: {
      glow: "0 10px 25px -5px rgba(168, 85, 247, 0.25)",
      border: "#d8b4fe",
      badge: "bg-purple-100 text-purple-800 border border-purple-300",
      bar: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L3 · CFO / CTO",
      secondary: "#9333ea",
    },
    4: {
      glow: "0 10px 25px -5px rgba(99, 102, 241, 0.25)",
      border: "#a5b4fc",
      badge: "bg-indigo-100 text-indigo-800 border border-indigo-300",
      bar: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L4 · DIR (Director/VP)",
      secondary: "#4f46e5",
    },
    5: {
      glow: "0 10px 25px -5px rgba(14, 165, 233, 0.25)",
      border: "#7dd3fc",
      badge: "bg-sky-100 text-sky-800 border border-sky-300",
      bar: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L5 · MGR (Manager)",
      secondary: "#0284c7",
    },
    6: {
      glow: "0 10px 25px -5px rgba(6, 182, 212, 0.25)",
      border: "#67e8f9",
      badge: "bg-cyan-100 text-cyan-800 border border-cyan-300",
      bar: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L6 · PM (Project Manager)",
      secondary: "#0891b2",
    },
    7: {
      glow: "0 10px 25px -5px rgba(20, 184, 166, 0.25)",
      border: "#5eead4",
      badge: "bg-teal-100 text-teal-800 border border-teal-300",
      bar: "linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L7 · ASM (Asst. Manager)",
      secondary: "#0d9488",
    },
    8: {
      glow: "0 10px 25px -5px rgba(16, 185, 129, 0.25)",
      border: "#6ee7b7",
      badge: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      bar: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L8 · SNR (Senior)",
      secondary: "#059669",
    },
    9: {
      glow: "0 10px 25px -5px rgba(132, 204, 22, 0.25)",
      border: "#bef264",
      badge: "bg-lime-100 text-lime-800 border border-lime-300",
      bar: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L9 · OFC (Officer)",
      secondary: "#65a30d",
    },
    10: {
      glow: "0 10px 25px -5px rgba(234, 179, 8, 0.25)",
      border: "#fde047",
      badge: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      bar: "linear-gradient(135deg, #facc15 0%, #eab308 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L10 · JUN (Junior)",
      secondary: "#ca8a04",
    },
    11: {
      glow: "0 10px 25px -5px rgba(245, 158, 11, 0.25)",
      border: "#fcd34d",
      badge: "bg-amber-50 text-amber-800 border border-amber-200",
      bar: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L11 · FM (Foreman)",
      secondary: "#d97706",
    },
    12: {
      glow: "0 10px 25px -5px rgba(249, 115, 22, 0.25)",
      border: "#fdba74",
      badge: "bg-orange-50 text-orange-800 border border-orange-200",
      bar: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L12 · SKL (Skilled Labor)",
      secondary: "#ea580c",
    },
    13: {
      glow: "0 10px 25px -5px rgba(107, 114, 128, 0.25)",
      border: "#d1d5db",
      badge: "bg-slate-100 text-slate-700 border border-slate-300",
      bar: "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
      bg: "rgba(255, 255, 255, 0.95)",
      label: "L13 · LBR (General Labor)",
      secondary: "#4b5563",
    },
  };
  const inactivePalette = {
    glow: "0 10px 25px -5px rgba(239, 68, 68, 0.15)",
    border: "#ef4444",
    badge: "bg-red-50 text-red-800 border border-red-200",
    bar: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
    bg: "rgba(255, 255, 255, 0.8)",
    label: "Inactive",
    secondary: "#b91c1c",
  };

  /* ─── Org Node (Tree View) ─── */
  const OrgNode = ({ role, depth = 0 }: { role: JobRole; depth?: number }) => {
    const children = childrenMap.get(role.id) || [];
    const isActive = role.isActive !== false;
    const palette = isActive
      ? (levelPalette[role.level] ?? levelPalette[9])
      : inactivePalette;

    return (
      <li className="relative px-4 pt-12 shrink-0 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: depth * 0.05,
            type: "spring",
            bounce: 0.4,
          }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="z-10 relative w-[210px] rounded-2xl cursor-default overflow-hidden group"
          style={{
            boxShadow: palette.glow,
            border: `1px solid ${palette.border}`,
            background: palette.bg,
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Animated decorative bar */}
          <div
            className="h-[4px] w-full"
            style={{
              background: palette.bar,
            }}
          />

          {/* Header section */}
          <div
            className="px-4 pt-4 pb-2 relative flex flex-col gap-0.5"
            style={{
              background: `linear-gradient(180deg, ${palette.secondary}10 0%, transparent 100%)`,
            }}
          >
            <div className="flex justify-between items-start w-full">
              <span
                className="font-black text-[18px] tracking-widest leading-none drop-shadow-sm"
                style={{
                  color: palette.secondary,
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                {role.prefix}
              </span>
              <div
                className={`py-0.5 px-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${palette.badge}`}
              >
                LEVEL {role.level}
              </div>
            </div>
            <p className="text-[12px] font-bold text-slate-800 leading-tight mt-1 truncate">
              {role.name}
            </p>
          </div>

          {/* Bottom details */}
          <div className="px-4 py-3 bg-slate-50/50 flex flex-col gap-2 border-t border-slate-100">
            <InfoRow
              icon={<Building2 size={12} className="text-slate-500" />}
              color="#64748b"
              text={role.department?.name}
              placeholder="NO DEPARTMENT"
            />
            <InfoRow
              icon={<Zap size={12} className="text-slate-500" />}
              color="#64748b"
              text={role.jobLine?.name}
              placeholder="NO JOB LINE"
            />
          </div>

          {/* Pulse Indicator */}
          {isActive && (
            <div className="absolute bottom-3 right-3 opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: palette.secondary }}
                ></span>
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: palette.secondary }}
                ></span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Child connector */}
        {children.length > 0 && (
          <div className="relative flex justify-center w-full">
            {/* The vertical pipe coming out of bottom */}
            <div className="absolute top-0 w-px h-12 bg-slate-300" />
            <ul className="relative flex justify-center mt-12">
              {children.map((child, i) => (
                <OrgNode key={child.id} role={child} depth={depth + 1 + i} />
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  /* ─── Level View Component ─── */
  const LevelView = () => {
    // Group roles by level
    const rolesByLevel = new Map<number, JobRole[]>();
    const activeJobRoles = jobRoles.filter((r) => r.isActive !== false);

    activeJobRoles.forEach((role) => {
      const level = role.level;
      if (!rolesByLevel.has(level)) rolesByLevel.set(level, []);
      rolesByLevel.get(level)?.push(role);
    });

    // Sort levels from high to low (L0 first, L13 last)
    const sortedLevels = Array.from(rolesByLevel.keys()).sort((a, b) => a - b);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 min-h-full"
      >
        {/* Hierarchy Flow - Top Down */}
        <div className="flex flex-col gap-8 items-center">
          {sortedLevels.map((level, levelIndex) => {
            const roles = rolesByLevel.get(level) || [];
            const palette = levelPalette[level] ?? levelPalette[9];

            return (
              <div key={level} className="w-full max-w-6xl">
                {/* Level Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                    style={{
                      background: palette.bar,
                      color: "white",
                      boxShadow: palette.glow,
                    }}
                  >
                    L{level}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800">
                      {palette.label}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {roles.length} ตำแหน่ง
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                </div>

                {/* Roles Grid for this level */}
                <div className="flex flex-wrap justify-center gap-4 pl-16">
                  {roles.map((role, idx) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="relative w-[200px] rounded-xl cursor-default overflow-hidden group"
                      style={{
                        boxShadow: palette.glow,
                        border: `1px solid ${palette.border}`,
                        background: palette.bg,
                      }}
                    >
                      <div
                        className="h-1 w-full"
                        style={{ background: palette.bar }}
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className="font-black text-[16px] tracking-widest"
                            style={{
                              color: palette.secondary,
                              fontFamily: "'Orbitron', sans-serif",
                            }}
                          >
                            {role.prefix}
                          </span>
                          <div
                            className={`py-0.5 px-2 rounded-full text-[9px] font-bold uppercase ${palette.badge}`}
                          >
                            L{level}
                          </div>
                        </div>
                        <p className="text-[12px] font-bold text-slate-800 truncate">
                          {role.name}
                        </p>
                        {role.department && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Building2 size={10} className="text-slate-400" />
                            <span className="text-[10px] text-slate-500 truncate">
                              {role.department.name}
                            </span>
                          </div>
                        )}
                        {role.jobLine && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <Zap size={10} className="text-slate-400" />
                            <span className="text-[10px] text-slate-500 truncate">
                              {role.jobLine.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Connector arrow to next level */}
                {levelIndex < sortedLevels.length - 1 && (
                  <div className="flex justify-center my-4">
                    <div className="flex flex-col items-center">
                      <div className="w-px h-6 bg-gradient-to-b from-slate-300 to-slate-400" />
                      <div className="w-3 h-3 border-b-2 border-r-2 border-slate-400 rotate-45 -mt-1" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const InfoRow = ({
    icon,
    color,
    text,
    placeholder,
  }: {
    icon: React.ReactNode;
    color: string;
    text?: string | null;
    placeholder: string;
  }) => (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="shrink-0">{icon}</div>
      {text ? (
        <span className="text-[11px] font-medium text-slate-600 truncate">
          {text}
        </span>
      ) : (
        <span className="text-[10px] italic text-slate-400 font-light lowercase tracking-tight">
          {placeholder}
        </span>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .holo-root { font-family: 'DM Sans', sans-serif; }
        .holo-title { font-family: 'Orbitron', sans-serif; }

        /* Scrollbar */
        .holo-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .holo-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        .holo-scroll::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.3); border-radius: 9999px; }
        .holo-scroll::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.6); }

        /* Org tree connectors */
        .org-tree ul { display:flex; justify-content:center; position:relative; }
        .org-tree li { position:relative; display:flex; flex-direction:column; align-items:center; }
        
        /* The horizontal branch line */
        .org-tree li::before, .org-tree li::after {
          content: '';
          position: absolute;
          top: 0;
          width: 50%;
          height: 12px; /* Half of gap to parent */
          border-top: 1px solid #cbd5e1;
        }
        .org-tree li::before {
          left: 0;
          border-right: 1px solid #cbd5e1;
        }
        .org-tree li::after {
          right: 0;
        }
        
        /* Remove connectors for single children or edges */
        .org-tree li:only-child::before, .org-tree li:only-child::after {
          display: none;
        }
        .org-tree li:only-child {
          padding-top: 0;
        }
        .org-tree li:first-child::before, .org-tree li:last-child::after {
          border: 0 none;
        }
        
        /* Corner smoothing for branch splits */
        .org-tree li:first-child::after {
          border-radius: 8px 0 0 0;
        }
        .org-tree li:last-child::before {
          border-right: 1px solid #cbd5e1;
          border-radius: 0 8px 0 0;
        }
      `}</style>

      <div className="holo-root flex flex-col h-full gap-4 bg-slate-50 p-4 rounded-3xl min-h-[500px]">
        {/* ── Header ── */}
        <div
          className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 py-5 rounded-2xl shrink-0"
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          {/* Decorative corner */}
          <div
            className="absolute top-0 left-0 w-16 h-16 opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 0 0, #38bdf8, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-24 h-24 opacity-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 100% 100%, #a78bfa, transparent 70%)",
            }}
          />

          <div className="relative flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(14,165,233,0.08)",
                border: "1px solid rgba(14,165,233,0.3)",
              }}
            >
              <Cpu className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h1 className="holo-title text-xl font-black tracking-widest text-slate-800 uppercase">
                OMEGA DASHBOARD
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5 tracking-[0.1em] uppercase font-medium">
                Integrated Overview View Mode
              </p>
            </div>
          </div>

          <div className="relative flex flex-col items-end gap-3 flex-wrap z-10">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (containerRef.current) {
                    containerRef.current.scrollTo({
                      left:
                        containerRef.current.scrollWidth / 2 -
                        containerRef.current.clientWidth / 2,
                      top: 0,
                      behavior: "smooth",
                    });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all bg-slate-800 text-white shadow-lg hover:bg-slate-900 border border-slate-700"
              >
                <Layers size={14} />
                <span>CENTER VIEW</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all bg-sky-500 text-white shadow-lg hover:bg-sky-600 border border-sky-400"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                <span>SYNC SYNC</span>
              </motion.button>
            </div>
          </div>

          {loadedAt && (
            <p className="absolute bottom-2 left-[75px] md:bottom-auto md:left-auto md:-bottom-1 md:-right-[-10px] text-[9px] text-slate-600 tracking-widest font-mono pointer-events-none md:pr-4 md:pb-2">
              LAST SYNC: {loadedAt}
            </p>
          )}
        </div>

        {/* ── Summary Cards Area (TOP) ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 shrink-0">
          {/* Roles Summary */}
          <div className="p-4 rounded-xl flex items-center justify-between bg-white border border-slate-200/60 shadow-sm">
            <div>
              <p className="text-[10px] text-sky-600 tracking-widest uppercase font-bold mb-1">
                Total Roles
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {jobRoles.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center border border-sky-200">
              <Layers size={18} className="text-sky-600" />
            </div>
          </div>

          {/* Job Lines Configured */}
          <div className="p-4 rounded-xl flex items-center justify-between bg-white border border-slate-200/60 shadow-sm">
            <div>
              <p className="text-[10px] text-amber-600 tracking-widest uppercase font-bold mb-1">
                Job Lines
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {jobLineCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
              <Activity size={18} className="text-amber-600" />
            </div>
          </div>

          {/* Departments Configured */}
          <div className="p-4 rounded-xl flex items-center justify-between bg-white border border-slate-200/60 shadow-sm">
            <div>
              <p className="text-[10px] text-fuchsia-600 tracking-widest uppercase font-bold mb-1">
                Departments
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {departmentCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-fuchsia-100 flex items-center justify-center border border-fuchsia-200">
              <Building2 size={18} className="text-fuchsia-600" />
            </div>
          </div>

          {/* Permissions Configured */}
          <div className="p-4 rounded-xl flex items-center justify-between bg-white border border-slate-200/60 shadow-sm">
            <div>
              <p className="text-[10px] text-violet-600 tracking-widest uppercase font-bold mb-1">
                Permissions Built
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {permissions.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center border border-violet-200">
              <ShieldAlert size={18} className="text-violet-600" />
            </div>
          </div>

          {/* BOQs */}
          <div className="p-4 rounded-xl flex items-center justify-between bg-white border border-slate-200/60 shadow-sm">
            <div>
              <p className="text-[10px] text-blue-600 tracking-widest uppercase font-bold mb-1">
                Total BOQs
              </p>
              <p className="text-2xl font-bold text-slate-800">{boqs.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
              <FileText size={18} className="text-blue-600" />
            </div>
          </div>

          {/* Services available */}
          <div className="p-4 rounded-xl flex items-center justify-between bg-white border border-slate-200/60 shadow-sm">
            <div>
              <p className="text-[10px] text-emerald-600 tracking-widest uppercase font-bold mb-1">
                Total Services
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {services.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
              <Briefcase size={18} className="text-emerald-600" />
            </div>
          </div>
        </div>

        {/* ── Content Area (Company Structure BOTTOM) ── */}
        <div
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className="holo-scroll relative flex-1 rounded-2xl overflow-auto"
          style={{
            background:
              "linear-gradient(145deg,#f8fafc 0%,#f1f5f9 50%,#e2e8f0 100%)",
            border: "1px solid #cbd5e1",
            boxShadow: "0 0 40px rgba(0,0,0,0.03) inset",
            cursor: isDragging ? "grabbing" : "grab",
            minHeight: 420,
          }}
        >
          <ParticleField />

          <AnimatePresence>
            {loading && jobRoles.length === 0 ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full min-h-[420px] gap-4"
              >
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-full"
                    style={{ border: "2px solid rgba(56,189,248,0.15)" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "2px solid transparent",
                      borderTopColor: "#38bdf8",
                      borderRightColor: "#a78bfa",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <Cpu
                    className="absolute inset-0 m-auto text-sky-400"
                    size={22}
                  />
                </div>
                <p className="holo-title text-sky-500 text-xs tracking-[0.3em] uppercase animate-pulse">
                  Loading Structure...
                </p>
              </motion.div>
            ) : rootRoles.length > 0 ? (
              <motion.div
                key="tree"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="org-tree p-10 min-w-max inline-block align-top min-h-full"
              >
                <ul className="flex justify-center flex-wrap gap-4 items-start relative">
                  {rootRoles.map((role, i) => (
                    <OrgNode key={role.id} role={role} depth={i * 0.3} />
                  ))}

                  {/* Pending Node */}
                  <li className="relative px-3 pt-8 shrink-0 flex flex-col items-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [0.98, 1.02, 0.98],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-[186px] rounded-2xl overflow-hidden"
                      style={{
                        border: "1.5px dashed rgba(245,158,11,0.5)",
                        background: "white",
                        boxShadow: "0 4px 14px rgba(245,158,11,0.08)",
                      }}
                    >
                      <div
                        className="h-[3px]"
                        style={{
                          background:
                            "linear-gradient(90deg,transparent,#f59e0b,transparent)",
                        }}
                      />
                      <div
                        className="px-4 py-5 flex flex-col items-center gap-2 text-center"
                        style={{
                          background:
                            "linear-gradient(135deg,rgba(245,158,11,0.02),transparent)",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50"
                          style={{ border: "1px solid rgba(245,158,11,0.3)" }}
                        >
                          <Plus className="text-amber-500" size={20} />
                        </div>
                        <div>
                          <p className="holo-title text-amber-600 text-[11px] font-bold tracking-[0.12em] uppercase">
                            กำลังพิจารณา
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1 leading-relaxed tracking-wide">
                            โครงสร้างแผนกใหม่เพื่อ
                            <br />
                            รองรับการขยายตัว
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </li>
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key="fallback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 min-h-full"
              >
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  ไม่พบตำแหน่งระดับบนสุดสำหรับแผนผังสายบังคับบัญชา
                  จึงแสดงภาพรวมแบบระดับชั้นแทน
                  {orphanRoles.length > 0
                    ? ` (มี ${orphanRoles.length} ตำแหน่งที่ parentRoleId ไม่ตรงกับตำแหน่งใด)`
                    : ""}
                </div>
                <LevelView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Legend ── */}
        <div className="px-6 py-4 rounded-2xl shrink-0 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={14} className="text-slate-400" />
            <h3 className="text-[11px] font-black tracking-[0.2em] text-slate-500 uppercase">
              Hierarchy Legend & Level Palette
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {Object.entries(levelPalette)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([lvl, p]) => (
                <div key={lvl} className="flex items-center gap-2.5 group">
                  <div
                    className="w-4 h-4 rounded-md shadow-sm transition-transform group-hover:scale-110"
                    style={{
                      background: p.bar,
                      border: `1px solid ${p.border}`,
                    }}
                  />
                  <span className="text-[11px] font-bold text-slate-600 tracking-tight">
                    {p.label}
                  </span>
                </div>
              ))}

            <div className="h-4 w-px bg-slate-200 mx-2" />

            <LegendItem color="#ef4444" label="Inactive / Locked" dashed />
          </div>
        </div>
      </div>
    </>
  );
}

const LegendItem = ({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) => (
  <div className="flex items-center gap-1.5">
    <div
      className="w-4 h-4 rounded"
      style={{
        border: `1.5px ${dashed ? "dashed" : "solid"} ${color}`,
        background: `${color}15`,
      }}
    />
    <span className="text-[10px] text-slate-600 font-medium tracking-wide">
      {label}
    </span>
  </div>
);

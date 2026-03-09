"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Activity,
  RefreshCw,
  Layers,
  Plus,
  Link2Off,
  Zap,
  Cpu,
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

/* ─── Floating Particle Background ─── */
const ParticleField = () => {
  const particles = Array.from({ length: 40 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background:
              i % 3 === 0
                ? "rgba(99,179,237,0.6)"
                : i % 3 === 1
                  ? "rgba(167,139,250,0.6)"
                  : "rgba(52,211,153,0.6)",
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Grid lines */}
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
const ScanLine = () => (
  <motion.div
    className="absolute left-0 right-0 h-[2px] pointer-events-none z-20"
    style={{
      background:
        "linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)",
    }}
    animate={{ top: ["0%", "100%"] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
  />
);

export default function ClassificationBoard() {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
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
      const res = await fetch("/api/jobroles");
      if (res.ok) {
        const data = await res.json();
        setJobRoles(data);
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

  const rootRoles = jobRoles.filter((r) => !r.parentRoleId);
  const childrenMap = new Map<string, JobRole[]>();
  jobRoles.forEach((r) => {
    if (r.parentRoleId) {
      if (!childrenMap.has(r.parentRoleId)) childrenMap.set(r.parentRoleId, []);
      childrenMap.get(r.parentRoleId)?.push(r);
    }
  });

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

  /* ─── Level color palette ─── */
  const levelPalette: Record<
    number,
    { glow: string; border: string; badge: string; bar: string }
  > = {
    1: {
      glow: "0 0 24px rgba(56,189,248,0.55)",
      border: "#38bdf8",
      badge: "bg-sky-500/20 text-sky-300 border border-sky-500/40",
      bar: "#38bdf8",
    },
    2: {
      glow: "0 0 24px rgba(167,139,250,0.55)",
      border: "#a78bfa",
      badge: "bg-violet-500/20 text-violet-300 border border-violet-500/40",
      bar: "#a78bfa",
    },
    3: {
      glow: "0 0 24px rgba(52,211,153,0.55)",
      border: "#34d399",
      badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
      bar: "#34d399",
    },
    4: {
      glow: "0 0 24px rgba(251,191,36,0.55)",
      border: "#fbbf24",
      badge: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
      bar: "#fbbf24",
    },
  };
  const inactivePalette = {
    glow: "0 0 24px rgba(239,68,68,0.4)",
    border: "#ef4444",
    badge: "bg-red-500/20 text-red-300 border border-red-500/30",
    bar: "#ef4444",
  };

  /* ─── Org Node ─── */
  const OrgNode = ({ role, depth = 0 }: { role: JobRole; depth?: number }) => {
    const children = childrenMap.get(role.id) || [];
    const isActive = role.isActive !== false;
    const lvl = Math.min(role.level, 4) || 1;
    const palette = isActive
      ? (levelPalette[lvl] ?? levelPalette[1])
      : inactivePalette;

    return (
      <li className="relative px-3 pt-8 shrink-0 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.45,
            delay: depth * 0.07,
            type: "spring",
            stiffness: 120,
          }}
          whileHover={{ y: -4, scale: 1.04 }}
          className="z-10 relative w-[186px] rounded-2xl overflow-hidden cursor-default"
          style={{
            boxShadow: isActive ? palette.glow : palette.glow,
            border: `1.5px solid ${palette.border}`,
            background: "rgba(8,14,28,0.9)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Top accent bar */}
          <div
            className="h-[3px] w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${palette.bar}, transparent)`,
            }}
          />

          {/* Header */}
          <div
            className="px-3 pt-3 pb-2 flex justify-between items-start"
            style={{
              background: `linear-gradient(135deg, ${palette.bar}18, transparent 70%)`,
            }}
          >
            <div className="flex-1 min-w-0 pr-2">
              <p
                className="font-black text-[17px] tracking-widest leading-none truncate"
                style={{
                  color: palette.bar,
                  fontFamily: "'Courier New', monospace",
                  textShadow: `0 0 10px ${palette.bar}`,
                }}
              >
                {role.prefix}
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-1 line-clamp-1 leading-tight tracking-wide">
                {role.name}
              </p>
            </div>
            <div
              className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${palette.badge}`}
            >
              {!isActive && <Link2Off size={8} />}
              <span>L{role.level}</span>
            </div>
          </div>

          {/* Body */}
          <div
            className="px-3 pb-3 pt-1 space-y-1.5"
            style={{ background: "rgba(0,8,20,0.6)" }}
          >
            <InfoRow
              icon={<Briefcase size={9} style={{ color: "#818cf8" }} />}
              color="#818cf8"
              text={role.department?.name}
              placeholder="ไม่ระบุแผนก"
            />
            <InfoRow
              icon={<Activity size={9} style={{ color: "#22d3ee" }} />}
              color="#22d3ee"
              text={role.jobLine?.name}
              placeholder="ไม่ระบุสายงาน"
            />
          </div>

          {/* Active pulse dot */}
          {isActive && (
            <div className="absolute top-3 right-[38px]">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: palette.bar }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: palette.bar }}
                />
              </span>
            </div>
          )}
        </motion.div>

        {/* Children */}
        {children.length > 0 && (
          <ul className="relative flex justify-center pt-8">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-8"
              style={{ background: "linear-gradient(180deg,#334155,#475569)" }}
            />
            {children.map((child) => (
              <OrgNode key={child.id} role={child} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
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
    <div className="flex items-center gap-2">
      <div
        className="w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        {icon}
      </div>
      {text ? (
        <span className="text-[10px] text-slate-300 font-medium truncate tracking-wide">
          {text}
        </span>
      ) : (
        <span className="text-[10px] text-slate-600 italic">{placeholder}</span>
      )}
    </div>
  );

  /* ─── Stats bar ─── */
  const activeCount = jobRoles.filter((r) => r.isActive).length;
  const inactiveCount = jobRoles.length - activeCount;

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
        .org-tree ul { display:flex; justify-content:center; position:relative; padding-top:32px; }
        .org-tree li { position:relative; padding:32px 12px 0; display:flex; flex-direction:column; align-items:center; }
        .org-tree li::before,.org-tree li::after { content:''; position:absolute; top:0; width:50%; height:32px; border-top:1.5px solid #334155; }
        .org-tree li::before { left:0; border-right:1.5px solid #334155; }
        .org-tree li::after { right:0; }
        .org-tree li:only-child::before,.org-tree li:only-child::after { display:none; }
        .org-tree li:only-child { padding-top:0; }
        .org-tree li:first-child::before,.org-tree li:last-child::after { border:0 none; }
        .org-tree li:first-child::after { border-radius:10px 0 0 0; }
        .org-tree li:last-child::before { border-right:1.5px solid #334155; border-radius:0 10px 0 0; }
      `}</style>

      <div className="holo-root flex flex-col h-full gap-4 bg-[#050c18] p-4 rounded-3xl">
        {/* ── Header ── */}
        <div
          className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 py-5 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(8,20,40,0.95) 0%, rgba(14,30,56,0.95) 100%)",
            border: "1px solid rgba(56,189,248,0.2)",
            boxShadow: "0 0 40px rgba(56,189,248,0.08) inset",
          }}
        >
          {/* Decorative corner */}
          <div
            className="absolute top-0 left-0 w-16 h-16 opacity-20"
            style={{
              background:
                "radial-gradient(circle at 0 0, #38bdf8, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-24 h-24 opacity-10"
            style={{
              background:
                "radial-gradient(circle at 100% 100%, #a78bfa, transparent 70%)",
            }}
          />

          <div className="relative flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(56,189,248,0.12)",
                border: "1px solid rgba(56,189,248,0.35)",
                boxShadow: "0 0 20px rgba(56,189,248,0.2)",
              }}
            >
              <Layers className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1
                className="holo-title text-xl font-black tracking-widest text-sky-300"
                style={{ textShadow: "0 0 20px rgba(56,189,248,0.6)" }}
              >
                COMPANY STRUCTURE
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5 tracking-[0.15em] uppercase font-medium">
                Matrix Organization Flow
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-3 flex-wrap">
            {/* Stats chips */}
            <StatChip
              value={jobRoles.length}
              label="ตำแหน่งทั้งหมด"
              color="#38bdf8"
              icon={<Cpu size={12} />}
            />
            <StatChip
              value={activeCount}
              label="Active"
              color="#34d399"
              icon={<Zap size={12} />}
            />
            {inactiveCount > 0 && (
              <StatChip
                value={inactiveCount}
                label="Inactive"
                color="#ef4444"
                icon={<Link2Off size={12} />}
              />
            )}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold tracking-wide transition-all"
              style={{
                background: "rgba(56,189,248,0.1)",
                border: "1px solid rgba(56,189,248,0.3)",
                color: "#7dd3fc",
                boxShadow: loading ? "0 0 20px rgba(56,189,248,0.25)" : "none",
              }}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span>รีเฟรช</span>
            </motion.button>
          </div>

          {loadedAt && (
            <p className="absolute bottom-2 right-6 text-[10px] text-slate-600 tracking-widest font-mono">
              SYNC {loadedAt}
            </p>
          )}
        </div>

        {/* ── Org Chart Canvas ── */}
        <div
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className="holo-scroll relative flex-1 rounded-2xl overflow-auto"
          style={{
            background:
              "linear-gradient(145deg,#020810 0%,#050d1c 50%,#03080f 100%)",
            border: "1px solid rgba(56,189,248,0.12)",
            boxShadow: "0 0 60px rgba(56,189,248,0.05) inset",
            cursor: isDragging ? "grabbing" : "grab",
            minHeight: 420,
          }}
        >
          <ParticleField />
          <ScanLine />

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
            ) : (
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
                        border: "1.5px dashed rgba(251,191,36,0.5)",
                        boxShadow: "0 0 28px rgba(251,191,36,0.25)",
                        background: "rgba(8,14,28,0.85)",
                      }}
                    >
                      <div
                        className="h-[3px]"
                        style={{
                          background:
                            "linear-gradient(90deg,transparent,#fbbf24,transparent)",
                        }}
                      />
                      <div
                        className="px-4 py-5 flex flex-col items-center gap-2 text-center"
                        style={{
                          background:
                            "linear-gradient(135deg,rgba(251,191,36,0.06),transparent)",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background: "rgba(251,191,36,0.12)",
                            border: "1px solid rgba(251,191,36,0.3)",
                          }}
                        >
                          <Plus
                            className="text-amber-400"
                            size={20}
                            style={{
                              filter:
                                "drop-shadow(0 0 8px rgba(251,191,36,0.8))",
                            }}
                          />
                        </div>
                        <div>
                          <p
                            className="holo-title text-amber-400 text-[11px] font-bold tracking-[0.12em] uppercase"
                            style={{
                              textShadow: "0 0 12px rgba(251,191,36,0.6)",
                            }}
                          >
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
            )}
          </AnimatePresence>
        </div>

        {/* ── Legend ── */}
        <div
          className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: "rgba(8,14,28,0.7)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span className="text-[10px] text-slate-600 tracking-[0.2em] uppercase font-medium mr-1">
            Legend
          </span>
          {Object.entries(levelPalette).map(([lvl, p]) => (
            <LegendItem key={lvl} color={p.bar} label={`Level ${lvl}`} />
          ))}
          <LegendItem color="#ef4444" label="Inactive" dashed />
          <LegendItem color="#fbbf24" label="Pending" dashed />
        </div>
      </div>
    </>
  );
}

const StatChip = ({
  value,
  label,
  color,
  icon,
}: {
  value: number;
  label: string;
  color: string;
  icon: React.ReactNode;
}) => (
  <div
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
    style={{ background: `${color}12`, border: `1px solid ${color}30` }}
  >
    <span style={{ color }}>{icon}</span>
    <span className="text-[13px] font-bold" style={{ color }}>
      {value}
    </span>
    <span className="text-[10px] text-slate-500 font-medium">{label}</span>
  </div>
);

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
        boxShadow: `0 0 6px ${color}50`,
        background: `${color}15`,
      }}
    />
    <span className="text-[10px] text-slate-500 tracking-wide">{label}</span>
  </div>
);

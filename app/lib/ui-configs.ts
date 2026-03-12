/**
 * UI Configuration and Themes for OBNITHI ERP
 * Centralized constants for statuses, job levels, and document categories.
 */

// ── Status Configurations ─────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  ACTIVE: {
    bg: "#f0fdf4",
    text: "#15803d",
    border: "#86efac",
    dot: "#22c55e",
    label: "Active",
  },
  INACTIVE: {
    bg: "#fef2f2",
    text: "#b91c1c",
    border: "#fca5a5",
    dot: "#ef4444",
    label: "Inactive",
  },
  PENDING: {
    bg: "#fffbeb",
    text: "#b45309",
    border: "#fcd34d",
    dot: "#f59e0b",
    label: "Pending",
  },
  SUSPENDED: {
    bg: "#f8fafc",
    text: "#475569",
    border: "#cbd5e1",
    dot: "#94a3b8",
    label: "Suspended",
  },
} as const;

export type UserStatusKey = keyof typeof STATUS_CONFIG;

export const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status as UserStatusKey] ?? STATUS_CONFIG.PENDING;
};

// ── Job Level Colors ──────────────────────────────────────────────────────────
export const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  0:  { bg: "#fff1f2", text: "#be123c", border: "#fda4af" },
  1:  { bg: "#fff1f2", text: "#be123c", border: "#fda4af" },
  2:  { bg: "#fff7ed", text: "#c2410c", border: "#fdba74" },
  3:  { bg: "#fffbeb", text: "#b45309", border: "#fcd34d" },
  4:  { bg: "#f7fee7", text: "#4d7c0f", border: "#bef264" },
  5:  { bg: "#f0fdf4", text: "#15803d", border: "#86efac" },
  6:  { bg: "#ecfdf5", text: "#0f766e", border: "#6ee7b7" },
  7:  { bg: "#f0fdfa", text: "#0e7490", border: "#67e8f9" },
  8:  { bg: "#eff6ff", text: "#1d4ed8", border: "#93c5fd" },
  9:  { bg: "#eef2ff", text: "#4338ca", border: "#a5b4fc" },
  10: { bg: "#f8fafc", text: "#475569", border: "#cbd5e1" },
};

export const getLevelColor = (lv: number) => {
  return LEVEL_COLORS[lv] ?? LEVEL_COLORS[10];
};

// ── Document Category Accents ──────────────────────────────────────────────────
export const CATEGORY_ACCENTS = [
  { dot: "bg-blue-500",   glow: "rgba(59,130,246,0.12)",  badge: "#1d4ed8", badgeBg: "#eff6ff", badgeBorder: "#bfdbfe" },
  { dot: "bg-violet-500", glow: "rgba(139,92,246,0.12)",  badge: "#6d28d9", badgeBg: "#f5f3ff", badgeBorder: "#ddd6fe" },
  { dot: "bg-emerald-500",glow: "rgba(16,185,129,0.12)",  badge: "#065f46", badgeBg: "#ecfdf5", badgeBorder: "#6ee7b7" },
  { dot: "bg-orange-500", glow: "rgba(249,115,22,0.12)",  badge: "#c2410c", badgeBg: "#fff7ed", badgeBorder: "#fdba74" },
  { dot: "bg-rose-500",   glow: "rgba(244,63,94,0.12)",   badge: "#be123c", badgeBg: "#fff1f2", badgeBorder: "#fda4af" },
  { dot: "bg-cyan-500",   glow: "rgba(6,182,212,0.12)",   badge: "#0e7490", badgeBg: "#ecfeff", badgeBorder: "#a5f3fc" },
] as const;

export const getCategoryAccent = (index: number) => {
  return CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length];
};

// ── Role Palettes (Sidebar & Unified UI) ───────────────────────────────────────
export const ROLE_PALETTES = [
  { bg: "rgba(254,226,226,0.9)", border: "rgba(252,165,165,0.5)", text: "#b91c1c", glow: "rgba(239,68,68,0.25)" }, // rose
  { bg: "rgba(255,237,213,0.9)", border: "rgba(253,186,116,0.5)", text: "#c2410c", glow: "rgba(249,115,22,0.25)" }, // orange
  { bg: "rgba(254,249,195,0.9)", border: "rgba(253,224,71,0.5)", text: "#a16207", glow: "rgba(234,179,8,0.25)" }, // yellow
  { bg: "rgba(220,252,231,0.9)", border: "rgba(134,239,172,0.5)", text: "#15803d", glow: "rgba(34,197,94,0.25)" }, // green
  { bg: "rgba(204,251,241,0.9)", border: "rgba(94,234,212,0.5)", text: "#0f766e", glow: "rgba(20,184,166,0.25)" }, // teal
  { bg: "rgba(219,234,254,0.9)", border: "rgba(147,197,253,0.5)", text: "#1d4ed8", glow: "rgba(59,130,246,0.25)" }, // blue
  { bg: "rgba(237,233,254,0.9)", border: "rgba(196,181,253,0.5)", text: "#6d28d9", glow: "rgba(139,92,246,0.25)" }, // violet
  { bg: "rgba(252,231,243,0.9)", border: "rgba(249,168,212,0.5)", text: "#be185d", glow: "rgba(236,72,153,0.25)" }, // pink
] as const;

export const getRolePalette = (name: string) => {
  if (!name) return ROLE_PALETTES[5]; // default blue
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return ROLE_PALETTES[hash % ROLE_PALETTES.length];
};

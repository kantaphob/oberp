"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  X,
  Search,
  Crown,
  HardHat,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Save,
  ChevronRight,
  UserCheck,
  UserMinus,
  AlertCircle,
  Loader2,
  LayoutGrid,
  Shield,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type UserProfile = {
  firstName: string;
  lastName: string;
};

type JobRole = {
  name: string;
  level: number;
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
};

type TeamMember = {
  id: string;
  username: string;
  profile: UserProfile | null;
  role: JobRole | null;
  teamId?: string | null; // ทีมที่ user สังกัดอยู่ (จาก API users)
};

type ConstructionTeam = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  leaderId: string | null;
  leader: { id: string; username: string; profile: UserProfile | null } | null;
  members: TeamMember[];
  createdAt: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getFullName = (profile: UserProfile | null, username: string) => {
  if (profile?.firstName && profile?.lastName)
    return `${profile.firstName} ${profile.lastName}`;
  return `@${username}`;
};

const initials = (profile: UserProfile | null, username: string) => {
  if (profile?.firstName)
    return `${profile.firstName[0]}${profile.lastName?.[0] ?? ""}`.toUpperCase();
  return username.slice(0, 2).toUpperCase();
};

// Deterministic avatar color from string
const AVATAR_COLORS = [
  ["#6366f1", "#818cf8"], // indigo
  ["#0ea5e9", "#38bdf8"], // sky
  ["#10b981", "#34d399"], // emerald
  ["#f59e0b", "#fbbf24"], // amber
  ["#ef4444", "#f87171"], // red
  ["#8b5cf6", "#a78bfa"], // violet
  ["#ec4899", "#f472b6"], // pink
  ["#14b8a6", "#2dd4bf"], // teal
];
const avatarColor = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning";
type ToastItem = { id: number; message: string; type: ToastType };

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }, []);
  return { toasts, toast };
}

// ─── Tab type ────────────────────────────────────────────────────────────────

type Tab = "members" | "overview";

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ConstructionTeamPage() {
  const [activeTab, setActiveTab] = useState<Tab>("members");
  const [teams, setTeams] = useState<ConstructionTeam[]>([]);
  const [allUsers, setAllUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Right panel search
  const [memberSearch, setMemberSearch] = useState("");

  // New team modal
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit team name inline
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [saving, setSaving] = useState(false);

  const { toasts, toast } = useToast();

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [teamsRes, usersRes] = await Promise.all([
        fetch("/api/teams"),
        fetch("/api/users"),
      ]);
      if (teamsRes.ok) {
        const data: ConstructionTeam[] = await teamsRes.json();
        setTeams(data);
        if (!selectedTeamId && data.length > 0) setSelectedTeamId(data[0].id);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setAllUsers(data);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived ──────────────────────────────────────────────────────────────
  
  // แผนกที่เกี่ยวข้องกับหน้างานและโปรเจค (Operations, Engineering, Procurement)
  const PROJECT_DEPARTMENTS = ["OPS", "ENG", "PRO"];

  // กรองพนักงานเฉพาะสายงานโครงการและช่างฝีมือ (ไม่เอา บริหาร, บัญชี, บุคคล)
  const constructionUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const deptCode = u.role?.department?.code;
      // ถ้าไม่มีแผนก หรือ อยู่ในกลุ่มแผนกโครงการ ให้แสดง
      return !deptCode || PROJECT_DEPARTMENTS.includes(deptCode);
    });
  }, [allUsers]);

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) ?? null,
    [teams, selectedTeamId],
  );

  // A map of userId -> teamId (excluding NEW selectedTeam; "pending" state)
  const assignedUsersMap = useMemo(() => {
    const map: Record<string, string> = {};
    teams.forEach((team) => {
      team.members.forEach((m) => {
        map[m.id] = team.id;
      });
    });
    return map;
  }, [teams]);

  // Current member IDs in selected team
  const selectedMemberIds = useMemo(
    () => new Set(selectedTeam?.members.map((m) => m.id) ?? []),
    [selectedTeam],
  );

  // Filtered users in right panel (ใช้ constructionUsers ที่กรองแล้ว)
  const filteredUsers = useMemo(() => {
    const q = memberSearch.toLowerCase();
    return constructionUsers.filter((u) => {
      const full = getFullName(u.profile, u.username).toLowerCase();
      return (
        full.includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.role?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [constructionUsers, memberSearch]);

  // Manpower stats (ใช้ความหมายแฝงจากตัวแปรที่กรองแล้ว)
  const stats = useMemo(() => {
    const assignedIds = new Set(
      teams.flatMap((t) => t.members.map((m) => m.id)),
    );
    const totalWorkers = constructionUsers.length;
    const assigned = Array.from(assignedIds).filter(id => 
        constructionUsers.some(u => u.id === id)
    ).length;
    const idle = totalWorkers - assigned;
    return { totalWorkers, assigned, idle };
  }, [teams, constructionUsers]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleToggleMember = async (userId: string) => {
    if (!selectedTeam) return;

    const isMember = selectedMemberIds.has(userId);
    const newMemberIds = isMember
      ? selectedTeam.members.filter((m) => m.id !== userId).map((m) => m.id)
      : [...selectedTeam.members.map((m) => m.id), userId];

    // Optimistic update
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTeam.id) return t;
        const newMembers = isMember
          ? t.members.filter((m) => m.id !== userId)
          : [...t.members, allUsers.find((u) => u.id === userId)!];
        // If removed member was leader, clear leader
        const newLeaderId =
          !isMember || t.leaderId !== userId ? t.leaderId : null;
        const newLeader = newLeaderId === t.leaderId ? t.leader : null;
        return {
          ...t,
          members: newMembers,
          leaderId: newLeaderId,
          leader: newLeader,
        };
      }),
    );

    try {
      setSaving(true);
      const updated = teams.find((t) => t.id === selectedTeam.id)!;
      const currentLeaderId =
        isMember && updated.leaderId === userId ? null : updated.leaderId;

      const res = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedTeam.name,
          description: selectedTeam.description,
          leaderId: currentLeaderId,
          memberIds: newMemberIds,
        }),
      });
      if (!res.ok) throw new Error();
      const { team } = await res.json();
      setTeams((prev) =>
        prev.map((t) => (t.id === selectedTeam.id ? team : t)),
      );
      toast(isMember ? "นำออกจากทีมแล้ว" : "เพิ่มเข้าทีมแล้ว", "success");
    } catch {
      toast("เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
      fetchData(); // revert
    } finally {
      setSaving(false);
    }
  };

  const handleSetLeader = async (userId: string) => {
    if (!selectedTeam) return;
    const newLeaderId = selectedTeam.leaderId === userId ? null : userId;

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTeam.id) return t;
        const leaderUser = allUsers.find((u) => u.id === newLeaderId) ?? null;
        return {
          ...t,
          leaderId: newLeaderId,
          leader: leaderUser
            ? {
                id: leaderUser.id,
                username: leaderUser.username,
                profile: leaderUser.profile,
              }
            : null,
        };
      }),
    );

    try {
      setSaving(true);
      const res = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedTeam.name,
          description: selectedTeam.description,
          leaderId: newLeaderId,
          memberIds: selectedTeam.members.map((m) => m.id),
        }),
      });
      if (!res.ok) throw new Error();
      const { team } = await res.json();
      setTeams((prev) =>
        prev.map((t) => (t.id === selectedTeam.id ? team : t)),
      );
      toast(
        newLeaderId ? "ตั้งหัวหน้าทีมแล้ว 👑" : "ถอดหัวหน้าทีมแล้ว",
        "success",
      );
    } catch {
      toast("เกิดข้อผิดพลาด", "error");
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = async () => {
    if (!selectedTeam || !editNameValue.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editNameValue.trim(),
          description: selectedTeam.description,
          leaderId: selectedTeam.leaderId,
          memberIds: selectedTeam.members.map((m) => m.id),
        }),
      });
      if (!res.ok) throw new Error();
      const { team } = await res.json();
      setTeams((prev) =>
        prev.map((t) => (t.id === selectedTeam.id ? team : t)),
      );
      setEditingName(false);
      toast("บันทึกชื่อทีมแล้ว ✅", "success");
    } catch {
      toast("ไม่สามารถบันทึกได้", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeamName.trim(),
          description: newTeamDesc.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      const { team } = await res.json();
      await fetchData();
      setSelectedTeamId(team?.id ?? null);
      setShowNewTeamModal(false);
      setNewTeamName("");
      setNewTeamDesc("");
      toast("สร้างทีมใหม่สำเร็จ 🎉", "success");
    } catch {
      toast("สร้างทีมไม่สำเร็จ", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivateTeam = async (team: ConstructionTeam) => {
    if (!confirm(`ยืนยันการระงับ "${team.name}"?`)) return;
    try {
      const res = await fetch(`/api/teams/${team.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchData();
      if (selectedTeamId === team.id) setSelectedTeamId(null);
      toast("ระงับทีมแล้ว", "warning");
    } catch {
      toast("เกิดข้อผิดพลาด", "error");
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50 font-sans">
      {/* ── Toast ── */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium pointer-events-auto
                ${t.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : ""}
                ${t.type === "error" ? "bg-red-50 border-red-200 text-red-800" : ""}
                ${t.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" : ""}
              `}
            >
              {t.type === "success" && (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              )}
              {t.type === "error" && (
                <AlertCircle size={16} className="text-red-500 shrink-0" />
              )}
              {t.type === "warning" && (
                <AlertTriangle size={16} className="text-amber-500 shrink-0" />
              )}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Page Header ── */}
      <div className="px-6 pt-6 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md shadow-violet-600/20">
              <HardHat size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">
                ทีมก่อสร้าง
              </h1>
              <p className="text-sm text-slate-500">
                จัดการทีม · มอบหมายสมาชิก · ติดตามกำลังพล
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNewTeamModal(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-violet-600/20 hover:shadow-lg hover:shadow-violet-600/30 active:scale-95"
          >
            <Plus size={16} /> สร้างทีมใหม่
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(
            [
              { id: "members", label: "👥 จัดการสมาชิก", icon: Users },
              { id: "overview", label: "📊 ภาพรวมกำลังพล", icon: BarChart3 },
            ] as { id: Tab; label: string; icon: React.ElementType }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm animate-pulse">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-6 pt-4">
          <AnimatePresence mode="wait">
            {activeTab === "members" && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <MembersTab
                  teams={teams}
                  allUsers={allUsers}
                  selectedTeam={selectedTeam}
                  selectedMemberIds={selectedMemberIds}
                  assignedUsersMap={assignedUsersMap}
                  filteredUsers={filteredUsers}
                  memberSearch={memberSearch}
                  setMemberSearch={setMemberSearch}
                  saving={saving}
                  editingName={editingName}
                  editNameValue={editNameValue}
                  setEditNameValue={setEditNameValue}
                  setEditingName={setEditingName}
                  handleSaveName={handleSaveName}
                  onSelectTeam={(id) => {
                    setSelectedTeamId(id);
                    setEditingName(false);
                  }}
                  onToggleMember={handleToggleMember}
                  onSetLeader={handleSetLeader}
                  onDeactivate={handleDeactivateTeam}
                />
              </motion.div>
            )}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <OverviewTab teams={teams} allUsers={constructionUsers} stats={stats} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── New Team Modal ── */}
      <AnimatePresence>
        {showNewTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewTeamModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Plus size={18} className="text-violet-600" />{" "}
                  สร้างทีมก่อสร้างใหม่
                </h3>
                <button
                  onClick={() => setShowNewTeamModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    ชื่อทีม <span className="text-red-500">*</span>
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
                    placeholder="เช่น ทีมโครงสร้าง A"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    รายละเอียด (ไม่บังคับ)
                  </label>
                  <textarea
                    value={newTeamDesc}
                    onChange={(e) => setNewTeamDesc(e.target.value)}
                    placeholder="รายละเอียดทีม..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm resize-none"
                  />
                </div>
              </div>
              <div className="px-6 pb-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowNewTeamModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={creating || !newTeamName.trim()}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-md shadow-violet-600/20 transition-all flex items-center gap-2"
                >
                  {creating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  สร้างทีม
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Members Tab — Split View
// ══════════════════════════════════════════════════════════════

interface MembersTabProps {
  teams: ConstructionTeam[];
  allUsers: TeamMember[];
  selectedTeam: ConstructionTeam | null;
  selectedMemberIds: Set<string>;
  assignedUsersMap: Record<string, string>;
  filteredUsers: TeamMember[];
  memberSearch: string;
  setMemberSearch: (v: string) => void;
  saving: boolean;
  editingName: boolean;
  editNameValue: string;
  setEditNameValue: (v: string) => void;
  setEditingName: (v: boolean) => void;
  handleSaveName: () => void;
  onSelectTeam: (id: string) => void;
  onToggleMember: (userId: string) => void;
  onSetLeader: (userId: string) => void;
  onDeactivate: (team: ConstructionTeam) => void;
}

function MembersTab({
  teams,
  selectedTeam,
  selectedMemberIds,
  assignedUsersMap,
  filteredUsers,
  memberSearch,
  setMemberSearch,
  saving,
  editingName,
  editNameValue,
  setEditNameValue,
  setEditingName,
  handleSaveName,
  onSelectTeam,
  onToggleMember,
  onSetLeader,
  onDeactivate,
}: MembersTabProps) {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 h-full"
      style={{ minHeight: "calc(100vh - 220px)" }}
    >
      {/* ── Left: Team List ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            รายชื่อทีม ({teams.filter((t) => t.status === "ACTIVE").length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
              <Users size={32} className="opacity-40" />
              <p className="text-sm">ยังไม่มีทีม</p>
            </div>
          ) : (
            <ul className="p-2 space-y-1">
              {teams.map((team) => {
                const isSelected = team.id === selectedTeam?.id;
                const [c1, c2] = avatarColor(team.id);
                return (
                  <li key={team.id}>
                    <button
                      onClick={() => onSelectTeam(team.id)}
                      className={`w-full text-left rounded-xl px-3 py-3 transition-all group flex items-center gap-3
                        ${
                          isSelected
                            ? "bg-violet-50 border border-violet-200 shadow-sm"
                            : "hover:bg-slate-50 border border-transparent"
                        }
                        ${team.status === "INACTIVE" ? "opacity-50" : ""}
                      `}
                    >
                      {/* Team avatar */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${c1}, ${c2})`,
                        }}
                      >
                        {team.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm font-semibold truncate ${isSelected ? "text-violet-800" : "text-slate-700"}`}
                          >
                            {team.name}
                          </span>
                          {team.status === "INACTIVE" && (
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                              ระงับ
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400">
                            👷 {team.members.length} คน
                          </span>
                          {team.leader && (
                            <span className="text-[11px] text-amber-600 flex items-center gap-0.5">
                              <Crown size={9} />
                              {getFullName(
                                team.leader.profile,
                                team.leader.username,
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        size={14}
                        className={`shrink-0 transition-colors ${isSelected ? "text-violet-500" : "text-slate-300 group-hover:text-slate-400"}`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Right: Team Detail + Worker Pool ── */}
      {selectedTeam ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Team Header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    className="flex-1 text-base font-bold border-b-2 border-violet-500 bg-transparent focus:outline-none text-slate-800"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() => {
                    setEditNameValue(selectedTeam.name);
                    setEditingName(true);
                  }}
                >
                  <h2 className="text-base font-bold text-slate-800 truncate">
                    {selectedTeam.name}
                  </h2>
                  <Edit3
                    size={13}
                    className="text-slate-300 group-hover:text-violet-500 transition-colors shrink-0"
                  />
                </div>
              )}
              {selectedTeam.leader && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Crown size={11} className="text-amber-500" />
                  <span className="text-xs text-amber-700 font-medium">
                    หัวหน้า:{" "}
                    {getFullName(
                      selectedTeam.leader.profile,
                      selectedTeam.leader.username,
                    )}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => onDeactivate(selectedTeam)}
              title="ระงับทีม"
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Stats bar */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-5 bg-violet-50/40">
            <div className="flex items-center gap-1.5">
              <UserCheck size={14} className="text-violet-500" />
              <span className="text-xs font-bold text-violet-700">
                {selectedMemberIds.size} ในทีม
              </span>
            </div>
            {selectedTeam.leader ? (
              <div className="flex items-center gap-1.5">
                <Crown size={13} className="text-amber-500" />
                <span className="text-xs font-semibold text-amber-700">
                  มีหัวหน้า
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-orange-400" />
                <span className="text-xs text-orange-600">ยังไม่มีหัวหน้า</span>
              </div>
            )}
            {saving && (
              <div className="flex items-center gap-1 text-xs text-violet-500 ml-auto">
                <Loader2 size={12} className="animate-spin" /> กำลังบันทึก...
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="ค้นหาช่าง / ตำแหน่ง..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
            </div>
          </div>

          {/* Column headers */}
          <div className="px-5 py-2 border-b border-slate-100 bg-slate-50/40 grid grid-cols-[1fr_auto_auto] gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              ช่าง / พนักงาน
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-24">
              หัวหน้าทีม
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-20">
              เข้าทีม
            </span>
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                ไม่พบรายชื่อ
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isMember = selectedMemberIds.has(user.id);
                const assignedToOtherTeam = !!(
                  assignedUsersMap[user.id] &&
                  assignedUsersMap[user.id] !== selectedTeam.id
                );
                const isLeader = selectedTeam.leaderId === user.id;
                const [c1, c2] = avatarColor(user.id);

                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3 transition-all
                      ${assignedToOtherTeam ? "opacity-40 bg-slate-50/80" : "hover:bg-slate-50/80"}
                    `}
                  >
                    {/* User info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${c1}, ${c2})`,
                        }}
                      >
                        {initials(user.profile, user.username)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-700 truncate">
                            {getFullName(user.profile, user.username)}
                          </span>
                          {isLeader && (
                            <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-md">
                              <Crown size={8} /> Leader
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-mono">
                            @{user.username}
                          </span>
                          {user.role && (
                            <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {user.role.name}
                            </span>
                          )}
                          {assignedToOtherTeam && (
                            <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                              <AlertTriangle size={9} /> ติดภารกิจทีมอื่น
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Crown (leader) button — only for members */}
                    <div className="flex justify-center w-24">
                      {isMember && !assignedToOtherTeam ? (
                        <button
                          onClick={() => onSetLeader(user.id)}
                          disabled={saving}
                          title={isLeader ? "ถอดหัวหน้า" : "ตั้งเป็นหัวหน้าทีม"}
                          className={`p-1.5 rounded-lg transition-all disabled:opacity-40
                            ${
                              isLeader
                                ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                                : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
                            }`}
                        >
                          <Crown size={15} />
                        </button>
                      ) : (
                        <span className="w-8" />
                      )}
                    </div>

                    {/* Toggle member button */}
                    <div className="flex justify-center w-20">
                      <button
                        onClick={() =>
                          !assignedToOtherTeam && onToggleMember(user.id)
                        }
                        disabled={saving || assignedToOtherTeam}
                        title={
                          assignedToOtherTeam
                            ? "ติดภารกิจทีมอื่น"
                            : isMember
                              ? "นำออกจากทีม"
                              : "เพิ่มเข้าทีม"
                        }
                        className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed
                          ${isMember ? "bg-violet-600" : "bg-slate-200"}
                        `}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300
                            ${isMember ? "left-5" : "left-0.5"}
                          `}
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400">
          <LayoutGrid size={40} className="opacity-30" />
          <p className="text-sm font-medium">เลือกทีมจากรายการทางซ้าย</p>
          <p className="text-xs">หรือสร้างทีมใหม่เพื่อเริ่มต้น</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Overview Tab
// ══════════════════════════════════════════════════════════════

interface OverviewTabProps {
  teams: ConstructionTeam[];
  allUsers: TeamMember[];
  stats: { totalWorkers: number; assigned: number; idle: number };
}

function OverviewTab({ teams, allUsers, stats }: OverviewTabProps) {
  // Role distribution among all users
  const roleDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    allUsers.forEach((u) => {
      const role = u.role?.name ?? "ไม่ระบุตำแหน่ง";
      map[role] = (map[role] ?? 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [allUsers]);

  const assignedIds = useMemo(
    () => new Set(teams.flatMap((t) => t.members.map((m) => m.id))),
    [teams],
  );

  const totalRole = roleDistribution.reduce((s, [, v]) => s + v, 0);

  const ROLE_COLORS = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-violet-600",
    "from-teal-500 to-green-600",
    "from-orange-500 to-red-600",
  ];

  const donutPct =
    stats.totalWorkers > 0
      ? Math.round((stats.assigned / stats.totalWorkers) * 100)
      : 0;
  const circumference = 2 * Math.PI * 52;
  const strokeDasharray = `${(donutPct / 100) * circumference} ${circumference}`;

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "พนักงานทั้งหมด",
            value: stats.totalWorkers,
            icon: Users,
            gradient: "from-violet-500 to-purple-600",
            bg: "bg-violet-50",
            text: "text-violet-700",
          },
          {
            label: "ลงทีมแล้ว",
            value: stats.assigned,
            icon: UserCheck,
            gradient: "from-emerald-500 to-teal-600",
            bg: "bg-emerald-50",
            text: "text-emerald-700",
          },
          {
            label: "ว่าง (Idle)",
            value: stats.idle,
            icon: UserMinus,
            gradient: "from-amber-500 to-orange-600",
            bg: "bg-amber-50",
            text: "text-amber-700",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`${card.bg} rounded-2xl p-5 border border-white shadow-sm flex items-center gap-4`}
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}
            >
              <card.icon size={22} className="text-white" />
            </div>
            <div>
              <div className={`text-3xl font-black ${card.text}`}>
                {card.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center gap-4">
          <h4 className="text-sm font-bold text-slate-700 self-start">
            อัตราการจัดกำลังพล
          </h4>
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="14"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#vgrad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
              <defs>
                <linearGradient id="vgrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-violet-700">
                {donutPct}%
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Assigned
              </span>
            </div>
          </div>
          <div className="flex gap-5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
              <span className="text-slate-600 font-medium">
                ลงทีม {stats.assigned}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0" />
              <span className="text-slate-600 font-medium">
                ว่าง {stats.idle}
              </span>
            </div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h4 className="text-sm font-bold text-slate-700 mb-4">
            กระจายตามตำแหน่ง
          </h4>
          <div className="space-y-2.5">
            {roleDistribution.map(([role, count], i) => (
              <div key={role}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-slate-600 truncate max-w-[70%]">
                    {role}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {count}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / totalRole) * 100}%` }}
                    transition={{
                      delay: i * 0.05,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full bg-gradient-to-r ${ROLE_COLORS[i % ROLE_COLORS.length]}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teams summary table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h4 className="text-sm font-bold text-slate-700">สรุปรายทีม</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 bg-slate-50/40">
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-3">ทีม</th>
                <th className="px-5 py-3 text-center">สมาชิก</th>
                <th className="px-5 py-3">หัวหน้า</th>
                <th className="px-5 py-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teams.map((team) => {
                const [c1, c2] = avatarColor(team.id);
                return (
                  <tr
                    key={team.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{
                            background: `linear-gradient(135deg, ${c1}, ${c2})`,
                          }}
                        >
                          {team.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">
                            {team.name}
                          </div>
                          {team.description && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              {team.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg">
                        <HardHat size={12} /> {team.members.length}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {team.leader ? (
                        <div className="flex items-center gap-1.5">
                          <Crown size={12} className="text-amber-500" />
                          <span className="text-sm text-slate-700">
                            {getFullName(
                              team.leader.profile,
                              team.leader.username,
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic flex items-center gap-1">
                          <Shield size={11} className="text-slate-300" />{" "}
                          ยังไม่มีหัวหน้า
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full
                          ${
                            team.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                      >
                        {team.status === "ACTIVE" ? (
                          <>
                            <CheckCircle2 size={10} /> ใช้งาน
                          </>
                        ) : (
                          <>
                            <AlertCircle size={10} /> ระงับ
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {teams.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-slate-400 text-sm"
                  >
                    ยังไม่มีทีม
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unassigned workers */}
      {stats.idle > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-100 bg-amber-50/60 flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-500" />
            <h4 className="text-sm font-bold text-amber-800">
              พนักงานที่ยังไม่ได้ลงทีม ({stats.idle} คน)
            </h4>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {allUsers
              .filter((u) => !assignedIds.has(u.id))
              .map((u) => {
                const [c1, c2] = avatarColor(u.id);
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${c1}, ${c2})`,
                      }}
                    >
                      {initials(u.profile, u.username)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-700">
                        {getFullName(u.profile, u.username)}
                      </div>
                      {u.role && (
                        <div className="text-slate-400">{u.role.name}</div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

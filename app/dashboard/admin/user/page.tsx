"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTableControls } from "@/app/hooks/useTableControls";
import { TableControls } from "@/app/components/Dashboard/TableControls";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Shield,
  Mail,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  EyeOff,
  Eye,
  Building2,
  Fingerprint,
  Wand2,
  RefreshCw,
  Check,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { SupervisorModal } from "@/app/components/Supervisor/SupervisorModal";
import { useSupervisor } from "@/app/hooks/useSupervisor";

type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "ON_LEAVE"
  | "RESIGNED"
  | "TERMINATED"
  | "LOCKED"
  | "PENDING";

type JobRole = {
  id: string;
  name: string;
  prefix: string;
  level: number;
  department?: {
    name: string;
  } | null;
};

type UserProfile = {
  taxId: string;
  firstName: string;
  lastName: string;
  telephoneNumber: string;
  addressDetail: string;
};

type UserData = {
  id: string;
  username: string;
  email: string | null;
  status: UserStatus;
  roleId: string;
  role?: JobRole;
  profile?: UserProfile;
  createdAt: string;
};

export default function UserManagementPage() {
  const { data: session } = useSession();
  const currentUser = session?.user;

  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<UserStatus>("ACTIVE");
  const [roleId, setRoleId] = useState("");

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [telephoneNumber, setTelephoneNumber] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);

  // 🛡️ Supervisor Hook (Reusable)
  const supervisor = useSupervisor();
  const [pendingAction, setPendingAction] = useState<{ type: "DELETE" | "EDIT" | "ADD"; id?: string; name?: string; payload?: any } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      setLoading(true);
      try {
        const [usersRes, rolesRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/jobroles"),
        ]);

        if (isMounted) {
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setUsers(usersData);
          }
          if (rolesRes.ok) {
            const rolesData = await rolesRes.json();
            setRoles(rolesData);
          }
        }
      } catch (error) {
        console.error("Failed to init data", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initData();
    return () => {
      isMounted = false;
    };
  }, []);

  const openAddModal = () => {
    setModalMode("ADD");
    setEditingId(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setStatus("ACTIVE");
    setRoleId("");
    setFirstName("");
    setLastName("");
    setTaxId("");
    setTelephoneNumber("");
    setAddressDetail("");

    setIsModalOpen(true);
  };

  const generateUsername = async () => {
    if (!roleId) {
      alert("กรุณาเลือก Role (ตำแหน่ง) ด้านล่างก่อนกดสร้าง Username อัตโนมัติ");
      return;
    }

    setIsGeneratingUsername(true);
    try {
      const res = await fetch(`/api/users/generate-username?roleId=${roleId}`);
      const data = await res.json();
      if (res.ok) {
        setUsername(data.username);
      } else {
        alert(data.error || "ไม่สามารถสร้างรหัสได้");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsGeneratingUsername(false);
    }
  };

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = Math.floor(Math.random() * 3) + 6; // 6 to 8 characters
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPassword);
    setShowPassword(true);
  };

  const openEditModal = (user: UserData) => {
    setModalMode("EDIT");
    setEditingId(user.id);
    setUsername(user.username);
    setEmail(user.email || "");
    setPassword(""); // Leave blank, only update if typed
    setStatus(user.status);
    setRoleId(user.roleId);
    setFirstName(user.profile?.firstName || "");
    setLastName(user.profile?.lastName || "");
    setTaxId(user.profile?.taxId || "");
    setTelephoneNumber(user.profile?.telephoneNumber || "");
    setAddressDetail(user.profile?.addressDetail || "");

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !roleId) {
      alert("Username is required");
      return;
    }
    
    if (telephoneNumber && telephoneNumber.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    const payload: Record<string, string | boolean> = {
      username,
      email,
      status,
      roleId,
      firstName,
      lastName,
      taxId,
      telephoneNumber,
      addressDetail,
      isAdmin: true,
    };

    if (password) payload.password = password;

    const body = { ...payload };

    try {
      setSaving(true);
      let res;
      if (editingId) {
        res = await fetch(`/api/users/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        if (!password) {
          alert("Password is required for new users");
          setSaving(false);
          return;
        }
        res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      
      // 🛡️ Handle Supervisor Required (Level 1+)
      if (res.status === 403 && data.requireSupervisor) {
        setPendingAction({ type: editingId ? "EDIT" : "ADD", payload });
        supervisor.openModal(async (supervisorUsername) => {
            const finalPayload = { ...payload, approverUsername: supervisorUsername };
            const finalRes = await fetch(editingId ? `/api/users/${editingId}` : "/api/users", {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalPayload),
            });
            const finalData = await finalRes.json();
            if (!finalRes.ok) throw new Error(finalData.error);
            
            if (finalData.message) alert(finalData.message);
            closeModal();
            setUsers(await (await fetch("/api/users")).json());
        });
        setSaving(false);
        return;
      }

      if (!res.ok) {
        alert(data.error || "Failed to save user");
        setSaving(false);
        return;
      }

      if (data.message) alert(data.message);

      closeModal();

      // refresh manually
      const userRes = await fetch("/api/users");
      if (userRes.ok) {
        const usersData = await userRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user: ${name}?`)) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      
      const data = await res.json().catch(() => ({}));

      // 🛡️ Handle Supervisor Required
      if (res.status === 403 && data.requireSupervisor) {
        supervisor.openModal(async (supervisorUsername) => {
            const finalRes = await fetch(`/api/users/${id}`, { 
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approverUsername: supervisorUsername })
            });
            const finalData = await finalRes.json();
            if (!finalRes.ok) throw new Error(finalData.error);
            if (finalData.message) alert(finalData.message);
            setUsers(await (await fetch("/api/users")).json());
        });
        return;
      }

      if (data.message) alert(data.message);
      setUsers(await (await fetch("/api/users")).json());
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete user");
    }
  };

  // ── Table Controls ────────────────────────────────────────────────────────
  const { paged: paginatedUsers, tableProps } = useTableControls(users, {
    filterFn: (u, term) => [
      u.username, u.email ?? "", u.status,
      u.profile?.firstName ?? "", u.profile?.lastName ?? "",
      u.profile?.taxId ?? "", u.role?.name ?? "",
    ].some(v => v.toLowerCase().includes(term)),
    defaultPerPage: 10,
  });

  const groupedRoles = roles.reduce(
    (acc, r) => {
      const deptName =
        r.department?.name || "No Department (Management/Others)";
      if (!acc[deptName]) acc[deptName] = [];
      acc[deptName].push(r);
      return acc;
    },
    {} as Record<string, JobRole[]>,
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 rounded-3xl font-sans min-h-[600px] relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-orange-600" size={26} />
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system users, their accounts, statuses, and assign roles.
          </p>
        </div>

        <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-orange-600/20 whitespace-nowrap"
          >
            <Plus size={16} /> Add User
          </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4 text-sm font-medium animate-pulse">
            Loading users...
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
          {/* Table Controls Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <TableControls table={tableProps} entityLabel="ผู้ใช้" searchPlaceholder="ค้นหา Username, TaxID, ชื่อ..." />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4 text-center">Identity</th>
                  <th className="px-6 py-4">Role & Department</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-sm">
                            @{user.username}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail size={10} /> {user.email || "No email"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.profile?.taxId &&
                        user.profile.taxId !== "0000000000000" ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-xs font-mono text-slate-600 border border-slate-200">
                            <Fingerprint size={12} className="text-slate-400" />
                            {user.profile.taxId}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No Data
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.role ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100">
                                L{user.role.level}
                              </div>
                              <span className="text-sm text-slate-700 font-medium">
                                {user.role.name}
                              </span>
                            </div>
                            {user.role.department && (
                              <span className="text-[11px] text-slate-500 mt-1 ml-8 flex items-center gap-1">
                                <Building2 size={10} />{" "}
                                {user.role.department.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No Role Assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 w-max
                            ${
                              user.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : user.status === "PENDING"
                                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                                  : user.status === "ON_LEAVE"
                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                    : user.status === "INACTIVE"
                                      ? "bg-slate-100 text-slate-600 border border-slate-200"
                                      : user.status === "RESIGNED" || user.status === "TERMINATED"
                                        ? "bg-slate-200 text-slate-700 border border-slate-300"
                                        : "bg-red-100 text-red-600 border border-red-200"
                            }`}
                          >
                            {user.status === "ACTIVE" ? (
                              <CheckCircle size={10} />
                            ) : (
                              <AlertCircle size={10} />
                            )}
                            {user.status.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* 🛡️ Hierarchical UI Control */}
                          {(() => {
                             const targetLevel = user.role?.level ?? 999;
                             const currentLevel = currentUser?.level ?? 999;
                             
                             // กฎ: Level 0 ห้ามแก้ไข/ลบทิ้งเด็ดขาด (แตะต้องไม่ได้)
                             if (targetLevel === 0) return null;
                             
                             // กฎ: ห้ามแก้คนที่ระดับสูงกว่าตัวเอง (ตัวเลขน้อยกว่า) 
                             if (currentLevel > targetLevel) return null;
                             
                             // กฎ: ห้ามแก้คนระดับเดียวกัน (ยกเว้นตัวเอง)
                             if (currentLevel === targetLevel && currentUser?.id !== user.id) return null;

                             return (
                               <>
                                 <button
                                   onClick={() => openEditModal(user)}
                                   className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                   title="Edit"
                                 >
                                   <Edit2 size={16} />
                                 </button>
                                 <button
                                   onClick={() => handleDelete(user.id, user.username)}
                                   className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                   title="Delete"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               </>
                             );
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/40">
            <TableControls table={tableProps} entityLabel="ผู้ใช้" searchPlaceholder="" />
          </div>
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex px-6 py-4 border-b border-slate-100 bg-slate-50/50 justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="text-orange-600" size={18} />
                  {modalMode === "EDIT"
                    ? "Edit User Account"
                    : "Create New User"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 overflow-y-auto holo-scroll space-y-6"
              >
                {/* Section 1: Auth Info */}
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 border-b border-slate-100 pb-1">
                    Account & Identity
                  </h4>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white"
                      required
                    >
                      <option value="" disabled>
                        Select Role...
                      </option>
                      {Object.entries(groupedRoles).map(([dept, deptRoles]) => (
                        <optgroup key={dept} label={dept}>
                          {deptRoles.map((r) => (
                            <option key={r.id} value={r.id}>
                              [L{r.level}] {r.prefix} - {r.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none transition-colors ${modalMode === "EDIT" ? "bg-slate-50 text-slate-500 cursor-not-allowed font-medium" : "focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"}`}
                          required
                          disabled={modalMode === "EDIT"}
                          placeholder={
                            modalMode === "ADD" ? "กรุณากด Generate" : ""
                          }
                        />
                        {modalMode === "ADD" && (
                          <button
                            type="button"
                            onClick={generateUsername}
                            disabled={isGeneratingUsername || !roleId}
                            className={`px-3 py-2 rounded-lg border text-xs font-bold uppercase transition-colors whitespace-nowrap ${!roleId ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-600"}`}
                            title={
                              !roleId
                                ? "กรุณาเลือกตำแหน่ง (Role) ด้านล่างก่อน"
                                : "สร้างรหัสอัตโนมัติ"
                            }
                          >
                            {isGeneratingUsername ? "Wait..." : "Generate"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                        Password{" "}
                        {modalMode === "EDIT" ? (
                          "(Leave empty to keep)"
                        ) : (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                            required={modalMode === "ADD"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="px-3 py-2 rounded-lg border bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 text-xs font-bold uppercase transition-colors whitespace-nowrap flex items-center gap-1.5"
                          title="สุ่มรหัสผ่านอัตโนมัติ 6-8 หลัก"
                        >
                          <Wand2 size={14} /> Auto
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                        Tax ID (13 Digits)
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        maxLength={13}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Personal Profile */}
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 border-b border-slate-100 pb-1">
                    Personal Info
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="08X-XXX-XXXX"
                        value={telephoneNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 10) setTelephoneNumber(val);
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors placeholder-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Job Role & Organization */}
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 border-b border-slate-100 pb-1">
                    Organization
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) =>
                          setStatus(e.target.value as UserStatus)
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white font-medium"
                      >
                        <option value="ACTIVE" className="text-emerald-600">
                          Active
                        </option>
                        <option value="PENDING" className="text-amber-600">
                          Pending
                        </option>
                        <option value="ON_LEAVE" className="text-blue-600">
                          On Leave
                        </option>
                        <option value="INACTIVE" className="text-slate-600">
                          Inactive
                        </option>
                        <option value="RESIGNED" className="text-slate-600">
                          Resigned
                        </option>
                        <option value="TERMINATED" className="text-slate-600">
                          Terminated
                        </option>
                        <option value="SUSPENDED" className="text-red-600">
                          Suspended
                        </option>
                        <option value="LOCKED" className="text-red-600">
                          Locked
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : modalMode === "EDIT" ? (
                      "Save Changes"
                    ) : (
                      "Create User"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛡️ REUSABLE SUPERVISOR MODAL */}
      <SupervisorModal 
        isOpen={supervisor.isOpen}
        onClose={supervisor.closeModal}
        loading={supervisor.loading}
        onConfirm={supervisor.handleConfirm}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Plus, Search, Edit2, Trash2, X, Shield, Mail, CheckCircle, AlertCircle, Building2, ChevronLeft, ChevronRight, Fingerprint, Eye, EyeOff, Wand2
} from "lucide-react";
import { useSession } from "next-auth/react";

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

export default function EmployeeManagementPage() {
  const { data: session } = useSession();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  // Approver Fields (for supervisor override)
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [approverUsername, setApproverUsername] = useState("");

  const [saving, setSaving] = useState(false);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      setLoading(true);
      try {
        const [usersRes, rolesRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/jobroles")
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
    return () => { isMounted = false; };
  }, []);

  // Check supervisor approval require
  useEffect(() => {
    const selectedRole = roles.find(r => r.id === roleId);
    
    // ดึง Level ของผู้ใช้ที่เข้าสู่ระบบตอนนี้
    const currentUserLevel = session?.user?.level ?? 10; 
    
    // หากสร้างตำแหน่งที่สูงกว่า (level น้อยกว่า) ตัวเอง ต้องขออนุมัติ
    if (selectedRole && selectedRole.level < currentUserLevel && modalMode === "ADD") {
      setRequiresApproval(true);
    } else {
      setRequiresApproval(false);
    }
  }, [roleId, roles, modalMode, session]);

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
    setApproverUsername("");
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
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
    setPassword(""); 
    setStatus(user.status);
    setRoleId(user.roleId);
    setFirstName(user.profile?.firstName || "");
    setLastName(user.profile?.lastName || "");
    setTaxId(user.profile?.taxId || "");
    setTelephoneNumber(user.profile?.telephoneNumber || "");
    setAddressDetail(user.profile?.addressDetail || "");
    setApproverUsername("");
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
    };
    
    if (password) payload.password = password;
    if (requiresApproval && modalMode === "ADD") {
      payload.approverUsername = approverUsername;
    }

    try {
      setSaving(true);
      let res;
      if (editingId) {
        res = await fetch(`/api/users/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
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
          body: JSON.stringify(payload)
        });
      }
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save user");
        setSaving(false);
        return;
      }

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
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete user");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const s = searchTerm.toLowerCase();
      return u.username.toLowerCase().includes(s) ||
             (u.email && u.email.toLowerCase().includes(s)) ||
             (u.profile?.taxId && u.profile.taxId.includes(s));
    });
  }, [users, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const groupedRoles = roles.reduce((acc, r) => {
    const deptName = r.department?.name || "No Department (Management/Others)";
    if (!acc[deptName]) acc[deptName] = [];
    acc[deptName].push(r);
    return acc;
  }, {} as Record<string, JobRole[]>);

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 rounded-3xl font-sans min-h-[600px] relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-orange-600" size={26} />
            Employee Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage employees, accounts, statuses, and assign roles within the organization.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by username, TaxID..."
              className="w-full md:w-[280px] pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm shadow-slate-200/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-orange-600/20 whitespace-nowrap"
          >
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4 text-sm font-medium animate-pulse">Loading employees...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-4">Employee Details</th>
                  <th className="px-6 py-4 text-center">Identity</th>
                  <th className="px-6 py-4">Role & Department</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-sm">@{user.username}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail size={10} /> {user.email || "No email"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.profile?.taxId && user.profile.taxId !== "0000000000000" ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-xs font-mono text-slate-600 border border-slate-200">
                            <Fingerprint size={12} className="text-slate-400" />
                            {user.profile.taxId}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Data</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.role ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100">
                                L{user.role.level}
                              </div>
                              <span className="text-sm text-slate-700 font-medium">{user.role.name}</span>
                            </div>
                            {user.role.department && (
                              <span className="text-[11px] text-slate-500 mt-1 ml-8 flex items-center gap-1">
                                <Building2 size={10} /> {user.role.department.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Role Assigned</span>
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between mt-auto">
              <span className="text-xs text-slate-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-500 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-medium text-slate-700 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-500 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
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
                  {modalMode === "EDIT" ? "Edit Employee Info" : "Register New Employee"}
                </h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto holo-scroll space-y-6">
                
                {/* Section 1: Auth Info */}
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 border-b border-slate-100 pb-1">Account & Identity</h4>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Role <span className="text-red-500">*</span></label>
                    <select 
                      value={roleId} 
                      onChange={e => setRoleId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white"
                      required
                    >
                      <option value="" disabled>Select Role...</option>
                      {Object.entries(groupedRoles).map(([dept, deptRoles]) => (
                        <optgroup key={dept} label={dept}>
                          {deptRoles.map(r => (
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
                          onChange={e => setUsername(e.target.value)}
                          className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none transition-colors ${modalMode === "EDIT" ? "bg-slate-50 text-slate-500 cursor-not-allowed font-medium" : "focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"}`}
                          required
                          disabled={modalMode === "EDIT"}
                          placeholder={modalMode === "ADD" ? "กรุณากด Generate" : ""}
                        />
                        {modalMode === "ADD" && (
                          <button 
                            type="button"
                            onClick={generateUsername}
                            disabled={isGeneratingUsername || !roleId}
                            className={`px-3 py-2 rounded-lg border text-xs font-bold uppercase transition-colors whitespace-nowrap ${!roleId ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-600"}`}
                            title={!roleId ? "กรุณาเลือกตำแหน่ง (Role) ด้านล่างก่อน" : "สร้างรหัสอัตโนมัติ"}
                          >
                            {isGeneratingUsername ? "Wait..." : "Generate"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Email</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                        Password {modalMode === "EDIT" ? "(Leave empty to keep)" : <span className="text-red-500">*</span>}
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                            required={modalMode === "ADD"}
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Tax ID (13 Digits)</label>
                      <input 
                        type="text" 
                        value={taxId}
                        onChange={e => setTaxId(e.target.value)}
                        maxLength={13}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Personal Profile */}
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 border-b border-slate-100 pb-1">Personal Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">First Name</label>
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Phone Number</label>
                      <input 
                        type="tel" 
                        maxLength={10}
                        placeholder="08X-XXX-XXXX"
                        value={telephoneNumber}
                        onChange={e => {
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
                  <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 border-b border-slate-100 pb-1">Organization</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Status</label>
                      <select 
                        value={status} 
                        onChange={e => setStatus(e.target.value as UserStatus)}
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

                {/* Approver Override Panel */}
                <AnimatePresence>
                  {requiresApproval && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
                        <div className="flex gap-3 mb-3">
                          <AlertCircle className="text-amber-600 shrink-0" size={20} />
                          <div>
                            <h5 className="text-sm font-bold text-amber-800">Supervisor Approval Required</h5>
                            <p className="text-xs text-amber-700 mt-0.5">
                              The selected role level is higher than your current permissions. 
                              Creating this employee requires a supervisor&apos;s username for approval.
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">Supervisor Username</label>
                            <input 
                              type="text" 
                              value={approverUsername}
                              onChange={e => setApproverUsername(e.target.value)}
                              className="w-full px-3 py-1.5 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white"
                              required={requiresApproval}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                    ) : (
                      modalMode === "EDIT" ? "Save Changes" : "Create Employee"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, CheckCircle, ShieldAlert, Fingerprint, Phone, MapPin, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    taxId: "",
    telephoneNumber: "",
    addressDetail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorText("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setErrorText("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setErrorText(data.error || "Registration failed.");
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorText("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-sm w-full rounded-3xl shadow-xl shadow-slate-200/50 p-8 text-center border border-slate-100"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Complete</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Your account has been created and set to <strong>PENDING</strong>. Please wait for an administrator to verify your identity and assign you to your respective department.
          </p>
          <a href="/login" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
            Proceed to Login <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans py-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white max-w-2xl w-full rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row border border-slate-100"
      >
        {/* Visual Sidebar */}
        <div className="bg-orange-600 p-8 text-white flex flex-col justify-center items-start md:w-1/3 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ background: "radial-gradient(circle at top right, #ffffff, transparent 60%)" }} />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-50" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/20">
              <ShieldAlert className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-3">Join OBERP</h2>
            <p className="text-orange-100 text-sm leading-relaxed">
              Register for an account to access internal resources. Your account will start at authorization Level 10 (Pending) until approved.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="p-8 md:p-10 flex-1 bg-white">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">Create an Account</h3>
            <p className="text-sm text-slate-500 mt-1">Fill in your information to get started.</p>
          </div>

          {errorText && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
              <ShieldAlert size={16} /> {errorText}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Username <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required name="username" value={form.username} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm" placeholder="johndoe" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm" placeholder="john@company.com" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">First Name <span className="text-red-500">*</span></label>
                <input required name="firstName" value={form.firstName} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm" placeholder="John" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Last Name <span className="text-red-500">*</span></label>
                <input required name="lastName" value={form.lastName} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm" placeholder="Doe" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="password" name="password" value={form.password} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm" placeholder="••••••••" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Tax ID (13 Digits) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Fingerprint size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required name="taxId" maxLength={13} value={form.taxId} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors font-mono text-sm tracking-widest placeholder:tracking-normal" placeholder="1XXXXXXXXXXXX" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" name="telephoneNumber" value={form.telephoneNumber} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm" placeholder="08XXXXXXXX" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Address Detail</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                <textarea rows={2} name="addressDetail" value={form.addressDetail} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm resize-none" placeholder="123 Example St, City" />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-70 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>Create Account <User size={18} /></>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account? <a href="/login" className="text-orange-600 font-bold hover:underline">Sign In Instead</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

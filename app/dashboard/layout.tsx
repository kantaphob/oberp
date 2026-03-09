"use client";

import React from "react";
import Sidebar from "../components/Sidebar";
import { Bell } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0 shadow-sm/50 lg:ml-0 ml-12">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold text-slate-800 hidden sm:flex items-center gap-2">
              <span className="text-slate-400 font-light">Pages</span>
              <span className="text-slate-300 font-light">/</span>
              <span className="text-blue-600">Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-full text-slate-400">
              <span className="text-xs">ค้นหาข้อมูล (Ctrl+K)</span>
            </div>

            <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[#F8FAFC] p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto rounded-2xl bg-white shadow-sm border border-slate-200 p-6 min-h-[80vh]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

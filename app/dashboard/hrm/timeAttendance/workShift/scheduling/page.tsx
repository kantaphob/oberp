"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Search, 
  CalendarDays, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Check,
  X,
  Plus,
  Settings,
  UserCircle2,
  CalendarCheck,
  Briefcase,
  Coffee
} from "lucide-react";
import { useToast } from "@/app/hooks/useToast";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addDays, 
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameDay,
  startOfDay,
  getDay
} from "date-fns";
import { th } from "date-fns/locale";

export default function SchedulingPage() {
  const { notify } = useToast();
  const [roster, setRoster] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Navigation State
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal States
  const [selectedCell, setSelectedCell] = useState<{user: any, date: Date} | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Advanced Pattern State (Shared Logic for Both Individual & Team)
  const [patternData, setPatternData] = useState({
    teamId: "", // Used only for Bulk
    shiftId: "",
    dayOffShiftId: "",
    dayOffs: [0] as number[], 
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd')
  });

  // Calculate Date Interval
  const dateInterval = useMemo(() => {
    let start, end;
    if (viewMode === "day") {
      start = startOfDay(currentDate);
      end = startOfDay(currentDate);
    } else if (viewMode === "week") {
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    }
    return eachDayOfInterval({ start, end });
  }, [viewMode, currentDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoster();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, currentDate, viewMode]);

  useEffect(() => {
    fetchTeams();
    fetchShifts();
  }, []);

  const fetchRoster = async () => {
    setIsLoading(true);
    try {
      const start = format(dateInterval[0], 'yyyy-MM-dd');
      const end = format(dateInterval[dateInterval.length - 1], 'yyyy-MM-dd');
      const res = await fetch(`/api/hrm/work-shift?mode=roster&q=${searchQuery}&startDate=${start}&endDate=${end}`);
      const result = await res.json();
      if (result.success) setRoster(result.data);
    } catch (e) {
      notify.error("ไม่สามารถโหลดข้อมูลตารางงานได้");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/hrm/construction-teams");
      const result = await res.json();
      if (result.success) setTeams(result.data);
    } catch (e) {}
  };

  const fetchShifts = async () => {
    try {
      const res = await fetch("/api/hrm/work-shift/master");
      const result = await res.json();
      if (result.success) setShifts(result.data);
    } catch (e) {}
  };

  const handlePatternSubmit = async (e: React.FormEvent, isBulk: boolean) => {
    e.preventDefault();
    
    let userIds = [];
    if (isBulk) {
        const team = teams.find(t => t.id === patternData.teamId);
        if (!team) return notify.error("กรุณาเลือกทีม");
        userIds = team.members.map((m: any) => m.id);
    } else {
        if (!selectedUser) return;
        userIds = [selectedUser.id];
    }

    if (!patternData.shiftId) return notify.error("กรุณาเลือกกะงานหลัก");

    try {
      const res = await fetch("/api/hrm/work-shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PATTERN_ASSIGN",
          userIds,
          ...patternData
        })
      });
      const result = await res.json();
      if (result.success) {
        notify.success(isBulk ? "จัดตารางงานทีมสำเร็จ" : "จัดตารางงานพนักงานสำเร็จ");
        setSelectedUser(null);
        setShowBulkModal(false);
        fetchRoster();
      } else {
        notify.error(result.message);
      }
    } catch (error) {
      notify.error("เกิดข้อผิดพลาด");
    }
  };

  const handleSingleShiftAssign = async (shiftId: string) => {
    if (!selectedCell) return;
    try {
      const res = await fetch("/api/hrm/work-shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BULK_ASSIGN",
          userIds: [selectedCell.user.id],
          shiftId,
          startDate: format(selectedCell.date, 'yyyy-MM-dd'),
          endDate: format(selectedCell.date, 'yyyy-MM-dd')
        })
      });
      const result = await res.json();
      if (result.success) {
        notify.success("อัปเดตตารางแล้ว");
        setSelectedCell(null);
        fetchRoster();
      }
    } catch (e) {
      notify.error("อัปเดตไม่สำเร็จ");
    }
  };

  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "day") {
      setCurrentDate(prev => direction === "next" ? addDays(prev, 1) : subDays(prev, 1));
    } else if (viewMode === "week") {
      setCurrentDate(prev => direction === "next" ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const getShiftColor = (type?: string) => {
    switch(type) {
      case 'WFH': return "border-cyan-100 bg-cyan-50/20 text-cyan-600";
      case 'OVERTIME': return "border-amber-100 bg-amber-50/20 text-amber-600";
      case 'HOLIDAY': return "border-rose-100 bg-rose-50/30 text-rose-600";
      default: return "border-indigo-100 bg-white text-indigo-600";
    }
  }

  const QuickRangePresets = () => (
    <div className="flex gap-2 flex-wrap mt-3">
        {[
            { label: "End of Month", target: endOfMonth(new Date()) },
            { label: "+30 Days", days: 30 },
            { label: "+90 Days", days: 90 },
            { label: "Full Year", days: 365 }
        ].map((preset, idx) => (
            <button
                key={idx}
                type="button"
                onClick={() => {
                    const start = new Date(patternData.startDate);
                    const end = preset.target || addDays(start, preset.days);
                    setPatternData({...patternData, endDate: format(end, 'yyyy-MM-dd')});
                }}
                className="px-4 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-slate-100"
            >
                {preset.label}
            </button>
        ))}
    </div>
  );

  return (
    <div className="p-8 lg:p-10 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* ── Control Bar ── */}
      <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">
         <div className="flex-1 relative w-full xl:max-w-md cursor-pointer group">
            <Search className="absolute left-6 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นพนักงาน..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-black focus:ring-4 focus:ring-indigo-100 transition-all italic outline-none shadow-sm"
            />
         </div>

         <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
               <button onClick={() => navigate("prev")} className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-all"><ChevronLeft size={20}/></button>
               <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 rounded-xl transition-all">Today</button>
               <button onClick={() => navigate("next")} className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-all"><ChevronRight size={20}/></button>
            </div>

            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
               {(['day', 'week', 'month'] as const).map((mode) => (
                 <button 
                   key={mode}
                   onClick={() => setViewMode(mode)}
                   className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${viewMode === mode ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:text-slate-800"}`}
                 >
                   {mode.toUpperCase()}
                 </button>
               ))}
            </div>

            <div className="relative group cursor-pointer">
              <input 
                type="month" 
                value={format(currentDate, 'yyyy-MM')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const [year, month] = val.split('-').map(Number);
                    const newDate = new Date(year, month - 1, 1);
                    setCurrentDate(newDate);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] font-black text-sm text-indigo-600 shadow-sm flex items-center gap-3 group-hover:bg-slate-50 transition-all">
                <Calendar size={18} />
                {format(currentDate, 'MMMM yyyy', { locale: th })}
              </div>
            </div>

            <button 
              onClick={() => {
                setPatternData({...patternData, teamId: ""});
                setShowBulkModal(true);
              }}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 ml-auto xl:ml-0"
            >
              <Users size={20} />
              Team Schedule
            </button>
         </div>
      </div>

      {/* ── Roster Grid ── */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col relative group">
         {isLoading ? (
           <div className="flex flex-col items-center justify-center flex-1 py-40 gap-4">
             <Loader2 className="animate-spin text-indigo-500" size={48} />
             <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Workforce Roster...</span>
           </div>
         ) : (
            <div className="overflow-x-auto flex-1 custom-scrollbar">
               <table className="w-full text-sm border-separate border-spacing-0">
                  <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 italic font-black">
                     <tr>
                        <th className="px-10 py-8 text-left text-slate-400 uppercase tracking-widest text-[10px] w-[280px] sticky left-0 bg-slate-50/90 backdrop-blur-md z-30 border-r border-slate-100 border-b">พนักงาน / ทีม</th>
                        {dateInterval.map(date => (
                          <th key={date.toISOString()} className={`px-4 py-8 text-center min-w-[120px] border-b border-slate-100 ${isSameDay(date, new Date()) ? "bg-indigo-50/40" : ""}`}>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] text-slate-400 uppercase tracking-tight">{format(date, 'eee', { locale: th })}</span>
                              <span className={`text-lg transition-transform ${isSameDay(date, new Date()) ? "text-indigo-600 scale-110" : "text-slate-800"}`}>{format(date, 'd')}</span>
                            </div>
                          </th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 italic">
                     {roster.length === 0 ? (
                       <tr><td colSpan={dateInterval.length + 1} className="py-40 text-center font-black text-slate-300 uppercase tracking-widest text-xs grayscale opacity-50">
                          <CalendarDays size={48} className="mx-auto mb-4" />
                          No Schedule Data Found
                       </td></tr>
                     ) : (
                       roster.map((user: any) => (
                         <tr key={user.id} className="hover:bg-slate-50 transition-all group">
                            <td 
                              onClick={() => {
                                setSelectedUser(user);
                                setPatternData({...patternData, teamId: ""});
                              }}
                              className="px-10 py-8 sticky left-0 bg-white group-hover:bg-slate-50 backdrop-blur-sm z-10 border-r border-slate-100 shadow-[4px_0_15px_rgba(0,0,0,0.02)] cursor-pointer group/user"
                            >
                               <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 overflow-hidden flex items-center justify-center font-black text-sm border border-indigo-100 group-hover/user:bg-indigo-600 group-hover/user:text-white transition-all shadow-sm">
                                      {user.profile?.firstName?.charAt(0) || user.username.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-lg shadow-sm opacity-0 group-hover/user:opacity-100 transition-opacity">
                                      <Settings size={10} className="text-slate-400" />
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                     <p className="font-black text-slate-900 text-sm truncate group-hover/user:text-indigo-600 transition-colors">{user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.username}</p>
                                     <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5 truncate">{user.team?.name || "Unassigned"}</p>
                                  </div>
                               </div>
                            </td>
                            {dateInterval.map(date => {
                              const schedule = user.workSchedules?.find((s: any) => isSameDay(new Date(s.date), date));
                              const isToday = isSameDay(date, new Date());
                              const shiftType = schedule?.shift?.attendanceType;
                              
                              return (
                                <td key={date.toISOString()} className={`px-2 py-4 text-center ${isToday ? "bg-indigo-50/10" : ""}`}>
                                   <div 
                                     onClick={() => setSelectedCell({user, date})}
                                     className={`group/cell relative p-4 rounded-[1.5rem] border-2 transition-all duration-300 hover:ring-8 hover:ring-indigo-100/30 cursor-pointer flex flex-col items-center justify-center min-h-[90px]
                                       ${schedule 
                                         ? `${getShiftColor(shiftType)} shadow-sm` 
                                         : "bg-slate-50/50 border-transparent opacity-20 hover:opacity-100"}`}
                                   >
                                      {schedule ? (
                                        <>
                                          <p className="text-[11px] font-black uppercase tracking-tight">
                                            {schedule.shift?.code || "--"}
                                          </p>
                                          <p className="text-[9px] opacity-70 font-bold mt-1">
                                            {schedule.shift?.startTime} - {schedule.shift?.endTime}
                                          </p>
                                          <div className="absolute top-2 right-2 opacity-0 group-hover/cell:opacity-100 transition-opacity translate-x-1 -translate-y-1">
                                            <div className="p-1 bg-white rounded-lg shadow-md border border-slate-100">
                                              <Settings className="text-slate-400" size={10} />
                                            </div>
                                          </div>
                                        </>
                                      ) : (
                                        <Plus size={16} className="text-slate-400 group-hover/cell:text-indigo-500 transition-colors scale-90 group-hover/cell:scale-110" />
                                      )}
                                   </div>
                                </td>
                              );
                            })}
                         </tr>
                       ))
                     )}
                  </tbody>
               </table>
            </div>
         )}
      </div>

      {/* ── SHARED Advanced Schedule Content (Individual & Bulk) ── */}
      {(selectedUser || showBulkModal) && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => { setSelectedUser(null); setShowBulkModal(false); }} />
           <div className="relative bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl p-12 italic border border-white/20 animate-in zoom-in slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-10 relative">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-100">
                       {showBulkModal ? <Users /> : (selectedUser?.profile?.firstName?.charAt(0) || selectedUser?.username.charAt(0))}
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                            {showBulkModal ? "Team Advanced Schedule" : "Employee Advanced Schedule"}
                        </h3>
                        <p className="text-sm text-indigo-500 font-bold uppercase tracking-widest mt-1">
                           {showBulkModal ? "Configure patterns for whole project team" : `Configure pattern for ${selectedUser?.profile?.firstName || selectedUser?.username}`}
                        </p>
                    </div>
                 </div>
                 <button onClick={() => { setSelectedUser(null); setShowBulkModal(false); }} className="p-4 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-[1.5rem] transition-all active:scale-90">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={(e) => handlePatternSubmit(e, showBulkModal)} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    {showBulkModal && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Users size={14} /> เลือกทีมปฏิบัติงาน
                            </label>
                            <select 
                                required 
                                value={patternData.teamId} 
                                onChange={e => setPatternData({...patternData, teamId: e.target.value})} 
                                className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-sans"
                            >
                                <option value="">-- เลือกทีม --</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.members?.length} คน)</option>)}
                            </select>
                        </div>
                    )}

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Calendar size={14} /> เลือกช่วงวันที่ (Long-term planning)
                       </label>
                       <div className="grid grid-cols-2 gap-4">
                          <input 
                            type="date" required value={patternData.startDate} 
                            onChange={e => setPatternData({...patternData, startDate: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-sans"
                          />
                          <input 
                            type="date" required value={patternData.endDate} 
                            onChange={e => setPatternData({...patternData, endDate: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-sans"
                          />
                       </div>
                       <QuickRangePresets />
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-3">
                          <Briefcase size={14} className="text-indigo-500" /> เลือกกะงานหลัก
                       </label>
                       <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {shifts.filter(s => s.attendanceType !== 'HOLIDAY').map(s => (
                            <button 
                              key={s.id} type="button"
                              onClick={() => setPatternData({...patternData, shiftId: s.id})}
                              className={`flex justify-between items-center p-5 rounded-2xl border-2 transition-all ${patternData.shiftId === s.id ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 bg-slate-50/50 hover:border-indigo-200"}`}
                            >
                               <div className="text-left">
                                  <p className="font-black text-sm text-slate-900">{s.name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold">{s.startTime}-{s.endTime}</p>
                               </div>
                               <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${getShiftColor(s.attendanceType)}`}>{s.attendanceType}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Coffee size={14} /> กำหนดวันหยุดสัปดา (Day Off Pattern)
                       </label>
                       <div className="flex flex-wrap gap-2">
                          {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day, i) => {
                             const isSelected = patternData.dayOffs.includes(i);
                             return (
                               <button 
                                 key={i} type="button"
                                 onClick={() => {
                                    const newDayOffs = isSelected 
                                      ? patternData.dayOffs.filter(d => d !== i)
                                      : [...patternData.dayOffs, i];
                                    setPatternData({...patternData, dayOffs: newDayOffs});
                                 }}
                                 className={`w-12 h-12 rounded-2xl font-black text-xs transition-all border-2
                                   ${isSelected ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-100" : "bg-white text-slate-400 border-slate-100 hover:border-rose-200"}`}
                               >
                                  {day}
                               </button>
                             );
                          })}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Plus size={14} /> กะที่ใช้กับวันหยุด (Default: OFF)
                       </label>
                       <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                          {shifts.filter(s => s.attendanceType === 'HOLIDAY').map(s => (
                            <button 
                              key={s.id} type="button"
                              onClick={() => setPatternData({...patternData, dayOffShiftId: s.id})}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${patternData.dayOffShiftId === s.id ? "border-rose-500 bg-rose-50/50" : "border-slate-100 bg-slate-50/50 hover:border-rose-200"}`}
                            >
                               <div className="flex justify-between items-center">
                                  <span className="font-black text-sm">{s.name}</span>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">{s.code}</span>
                               </div>
                            </button>
                          ))}
                          {shifts.filter(s => s.attendanceType === 'HOLIDAY').length === 0 && (
                             <div className="text-center p-4 bg-rose-50 rounded-xl border border-rose-100 text-[10px] text-rose-400 font-black uppercase italic">
                                คุณยังไม่ได้สร้างกะประเภทกะวันหยุด
                             </div>
                          )}
                       </div>
                    </div>

                    <div className="pt-4 space-y-4">
                       <button 
                         type="submit" 
                         className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-600 transition-all duration-500 group"
                       >
                          <span className="flex items-center justify-center gap-3">
                             <Check /> {showBulkModal ? "Confirm Bulk Team Scheduling" : "Apply Pattern to Employee"}
                          </span>
                       </button>
                       <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 italic">
                          <AlertCircle size={18} className="text-amber-500 shrink-0" />
                          <p className="text-[10px] text-amber-700 font-bold leading-relaxed">การจัดตารางแบบรูปแบบ (Pattern) จะเขียนทับข้อมูลเดิมในช่วงวันที่เลือก โปรดตรวจสอบความถูกต้องก่อนยืนยัน</p>
                       </div>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* ── Single Cell Modal ── */}
      {selectedCell && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedCell(null)} />
           <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 italic border border-white/20 animate-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Modify Single Day</h3>
                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1">
                      {selectedCell.user.profile?.firstName || selectedCell.user.username} • {format(selectedCell.date, 'dd MMMM yyyy', { locale: th })}
                    </p>
                 </div>
                 <button onClick={() => setSelectedCell(null)} className="p-3 bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-2xl transition-all"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {shifts.map(shift => (
                  <button 
                    key={shift.id}
                    onClick={() => handleSingleShiftAssign(shift.id)}
                    className={`flex flex-col items-start p-5 rounded-[1.5rem] border-2 transition-all text-left ${getShiftColor(shift.attendanceType)} hover:scale-105`}
                  >
                     <span className="font-black text-sm">{shift.name}</span>
                     <span className="flex items-center gap-1 text-[10px] opacity-70 font-bold mt-1 uppercase tracking-wider">
                        <Clock size={10} /> {shift.startTime} - {shift.endTime}
                     </span>
                  </button>
                ))}
              </div>
              <button 
                onClick={async () => {
                    // Feature to clear day: we can add another action in API for DELETE_SCHEDULE
                    notify.error("Clear Day is coming soon");
                }}
                className="w-full py-4 mt-6 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
              >
                Clear Day Schedule
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

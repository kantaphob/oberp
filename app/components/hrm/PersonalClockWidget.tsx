"use client";

import React, { useState, useEffect } from "react";
import { Clock, MapPin, CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface ClockStatus {
  in: string | null;
  out: string | null;
  status: string;
  lateMinutes: number;
}

export default function PersonalClockWidget() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [status, setStatus] = useState<ClockStatus>({
    in: null,
    out: null,
    status: "ABSENT",
    lateMinutes: 0
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchStatus();
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/hrm/attendance/clock?mode=status"); // Need to handle status mode in API
      const result = await res.json();
      if (result.success && result.data) {
        setStatus({
          in: result.data.checkInTime ? new Date(result.data.checkInTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : null,
          out: result.data.checkOutTime ? new Date(result.data.checkOutTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : null,
          status: result.data.status,
          lateMinutes: result.data.lateMinutes || 0
        });
      }
    } catch (error) {
      console.error("Fetch status error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClock = async (type: "IN" | "OUT") => {
    setIsLocating(true);
    
    const performClock = async (lat?: number, lng?: number) => {
      try {
        const res = await fetch("/api/hrm/attendance/clock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, lat, lng })
        });
        const result = await res.json();
        if (result.success) {
          toast.success(result.message);
          fetchStatus(); // Refresh status
        } else {
          toast.error(result.message);
        }
      } catch (error: any) {
        toast.error("เกิดข้อผิดพลาดในการลงเวลา");
      } finally {
        setIsLocating(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          performClock(latitude, longitude);
        },
        (err) => {
          console.error(err);
          toast.error("กรุณาเปิด GPS เพื่อลงเวลา");
          setIsLocating(false);
        }
      );
    } else {
      performClock();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-center h-full min-h-[300px]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center py-12 relative overflow-hidden h-full group">
       <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] -z-10 opacity-40 translate-x-1/3 -translate-y-1/3 group-hover:bg-indigo-100 transition-colors duration-700" />
      
      <h2 className="text-slate-400 font-black mb-2 uppercase text-[10px] tracking-[0.2em] ml-1">Current Realtime</h2>
      <div className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter font-mono mb-4 tabular-nums">
        {currentTime ? currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "00:00:00"}
      </div>
      <div className="text-slate-500 font-bold mb-10 flex items-center gap-2 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 shadow-sm">
        <CalendarDays size={18} className="text-indigo-500" />
        {currentTime ? currentTime.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "---"}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 w-full max-w-lg">
        {!status.in ? (
          <button 
            onClick={() => handleClock("IN")}
            disabled={isLocating}
            className="flex-1 min-w-[180px] py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] active:translate-y-[1px] transition-all flex flex-col items-center gap-1 disabled:opacity-50"
          >
            <Clock size={28} />
            <span>{isLocating ? "Locating..." : "เข้างาน (IN)"}</span>
          </button>
        ) : (
          <div className="flex-1 min-w-[180px] py-6 rounded-[2rem] bg-emerald-50 border-2 border-emerald-100 text-emerald-700 flex flex-col items-center gap-1 shadow-inner ring-4 ring-emerald-50/50">
            <CheckCircle2 size={32} className="text-emerald-500 mb-1" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Check-in at</span>
            <span className="text-3xl font-black tracking-tight">{status.in} น.</span>
          </div>
        )}

        {status.in && !status.out ? (
          <button 
            onClick={() => handleClock("OUT")}
            disabled={isLocating}
            className="flex-1 min-w-[180px] py-6 rounded-[2rem] bg-white border-2 border-slate-200 text-slate-900 font-black text-xl shadow-lg hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50/30 hover:translate-y-[-2px] active:translate-y-[1px] transition-all flex flex-col items-center gap-1"
          >
            <Clock size={28} />
            <span>{isLocating ? "Locating..." : "ออกงาน (OUT)"}</span>
          </button>
        ) : status.out ? (
          <div className="flex-1 min-w-[180px] py-6 rounded-[2rem] bg-slate-50 border-2 border-slate-200 text-slate-400 flex flex-col items-center gap-1 shadow-inner grayscale group-hover:grayscale-0 transition-all">
            <CheckCircle2 size={32} className="text-slate-300 group-hover:text-amber-500 mb-1" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Check-out at</span>
            <span className="text-3xl font-black tracking-tight">{status.out} น.</span>
          </div>
        ) : (
          <div className="flex-1 min-w-[180px] py-6 rounded-[2rem] bg-slate-100/50 border-2 border-dashed border-slate-200 text-slate-300 flex flex-col items-center justify-center gap-1 opacity-50">
             <Clock size={28} />
             <span className="text-sm font-black">WAITING IN</span>
          </div>
        )}
      </div>

      {status.status === "LATE" && (
        <div className="mt-6 px-6 py-3 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-[1.25rem] text-sm font-black flex items-center gap-2 animate-bounce">
          <div className="w-2 h-2 bg-rose-500 rounded-full" />
          วันนี้คุณมาสาย {status.lateMinutes} นาที
        </div>
      )}

      <div className="mt-10 flex items-center gap-3 text-[10px] font-black tracking-wider text-slate-400 bg-slate-50/80 px-6 py-3 rounded-full border border-slate-100 group-hover:bg-white transition-colors">
        <MapPin size={16} className={location ? "text-indigo-500" : "text-slate-300"} />
        <span className="uppercase">
          {location 
            ? `Verified Coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` 
            : "GPS verification required for compliance"}
        </span>
      </div>
    </div>
  );
}
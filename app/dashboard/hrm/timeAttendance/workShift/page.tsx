"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function WorkShiftRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/hrm/timeAttendance/workShift/scheduling");
  }, [router]);

  return (
    <div className="flex h-[70vh] w-full items-center justify-center flex-col gap-4 animate-in fade-in duration-700 italic">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
      <div className="flex flex-col items-center gap-1">
        <p className="font-black text-slate-800 text-xl tracking-tight uppercase">OBNITHI ERP</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] italic">Redirecting to Workforce Scheduling...</p>
      </div>
    </div>
  );
}

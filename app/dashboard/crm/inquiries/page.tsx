"use client";

import React, { useState } from "react";
import {
  Users,
  PhoneCall,
  MapPin,
  Building2,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardList,
  HardHat,
  FileText,
  MessagesSquare,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useToast } from "@/app/hooks/useToast";

export default function CustomerInquiryPage() {
  const { notify } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 💡 Mock Data: รายการลูกค้าที่ติดต่อเข้ามา (Leads Pipeline)
  const inquiries = [
    {
      id: "PRJ-26001",
      customerName: "คุณวิเชียร (เจ้าของโรงงาน)",
      company: "บจก. ไทยอินดัสทรี",
      phone: "081-999-XXXX",
      projectName: "ต่อเติมโกดังเก็บสินค้า 500 ตรม.",
      location: "บางพลี, สมุทรปราการ",
      projectType: "งานโครงสร้างเหล็ก / โกดัง",
      estimatedBudget: 2500000,
      status: "NEW_LEAD", // เพิ่งติดต่อมา
      date: "15 มี.ค. 2026",
      assignee: "นายสมชาย (Sales)",
    },
    {
      id: "PRJ-26002",
      customerName: "พญ. อารยา",
      company: "คลินิกเวชกรรม",
      phone: "089-123-XXXX",
      projectName: "รีโนเวทคลินิก 3 ชั้น",
      location: "ทองหล่อ, กรุงเทพฯ",
      projectType: "งานรีโนเวท / ตกแต่งภายใน",
      estimatedBudget: 4000000,
      status: "SURVEYING", // นัดดูหน้างานแล้ว
      date: "12 มี.ค. 2026",
      assignee: "นายวิศวะ (Engineer)",
    },
    {
      id: "PRJ-26003",
      customerName: "บมจ. อสังหาดีเวลลอปเมนท์",
      company: "บมจ. อสังหาดีเวลลอปเมนท์",
      phone: "02-777-XXXX",
      projectName: "สร้างคลับเฮ้าส์โครงการหมู่บ้าน",
      location: "รังสิต, ปทุมธานี",
      projectType: "งานก่อสร้างอาคารใหม่",
      estimatedBudget: 15000000,
      status: "ESTIMATING", // กำลังถอดแบบ/ทำ BOQ
      date: "05 มี.ค. 2026",
      assignee: "ทีม Estimator",
    },
  ];

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "NEW_LEAD":
        return {
          label: "ติดต่อใหม่ (New)",
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: PhoneCall,
        };
      case "SURVEYING":
        return {
          label: "นัดดูหน้างาน (Survey)",
          color: "bg-amber-100 text-amber-700 border-amber-200",
          icon: HardHat,
        };
      case "ESTIMATING":
        return {
          label: "กำลังทำประเมิน/BOQ",
          color: "bg-indigo-100 text-indigo-700 border-indigo-200",
          icon: FileText,
        };
      case "QUOTED":
        return {
          label: "ส่งเสนอราคาแล้ว",
          color: "bg-purple-100 text-purple-700 border-purple-200",
          icon: ClipboardList,
        };
      case "WON":
        return {
          label: "ได้งาน (Won)",
          color: "bg-emerald-100 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
        };
      case "LOST":
        return {
          label: "ปิดการขายไม่ได้ (Lost)",
          color: "bg-rose-100 text-rose-700 border-rose-200",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: "bg-slate-100 text-slate-700",
          icon: Clock,
        };
    }
  };

  const handleSaveInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    notify.success(
      "บันทึกข้อมูลลูกค้าและสร้างโปรเจกต์ใหม่สำเร็จ",
      "ข้อมูลถูกส่งเข้าสู่ระบบติดตามงานแล้ว",
    );
    setShowModal(false);
  };

  return (
    <div className="p-8 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <Users size={28} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Customer Inquiries
            </h2>
          </div>
          <p className="text-slate-500 font-medium ml-1">
            ระบบรับเรื่องลูกค้าใหม่ นัดสำรวจหน้างาน และติดตามสถานะประเมินราคา
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="h-12 px-6 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95 gap-2"
        >
          <Plus size={18} /> รับเรื่องลูกค้าใหม่ (New Lead)
        </Button>
      </div>

      {/* ── Pipeline Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <PhoneCall size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">12</p>
            <p className="text-[10px] font-black uppercase text-slate-400">
              ติดต่อใหม่
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <HardHat size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">5</p>
            <p className="text-[10px] font-black uppercase text-slate-400">
              รอสำรวจหน้างาน
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">8</p>
            <p className="text-[10px] font-black uppercase text-slate-400">
              กำลังถอด BOQ
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ClipboardList size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">3</p>
            <p className="text-[10px] font-black uppercase text-slate-400">
              รอเซ็นสัญญา
            </p>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, หรืองาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-blue-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 h-11 px-4 gap-2 font-bold text-slate-600"
          >
            <Filter size={16} /> สถานะทั้งหมด
          </Button>
        </div>
      </div>

      {/* ── Inquiries List (Card View) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inquiries.map((inquiry) => {
          const statusConfig = getStatusDisplay(inquiry.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={inquiry.id}
              className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-lg transition-all p-6 group cursor-pointer flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${statusConfig.color}`}
                >
                  <StatusIcon size={12} /> {statusConfig.label}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {inquiry.date}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                {inquiry.projectName}
              </h3>

              <div className="space-y-3 mt-4 flex-1">
                <div className="flex items-start gap-3">
                  <Users size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-slate-700">
                      {inquiry.customerName}
                    </p>
                    <p className="text-xs font-bold text-slate-500">
                      {inquiry.company}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneCall size={16} className="text-slate-400" />
                  <p className="text-sm font-bold text-slate-600">
                    {inquiry.phone}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="text-slate-400 mt-0.5 shrink-0"
                  />
                  <p className="text-sm font-bold text-slate-600 line-clamp-2">
                    {inquiry.location}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                    งบประมาณเบื้องต้น
                  </p>
                  <p className="text-lg font-black text-emerald-600">
                    ฿ {(inquiry.estimatedBudget / 1000000).toFixed(1)}M
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="rounded-xl hover:bg-blue-50 hover:text-blue-600 text-slate-400 h-10 w-10 p-0"
                >
                  <ArrowRight size={20} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal: รับเรื่องลูกค้าใหม่ ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 max-h-[95vh] flex flex-col">
            <div className="p-6 sm:p-8 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    รับเรื่องลูกค้าใหม่ (New Lead)
                  </h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                    Customer & Project Inquiry
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto">
              <form
                id="new-lead-form"
                onSubmit={handleSaveInquiry}
                className="space-y-8"
              >
                {/* 1. ข้อมูลลูกค้า */}
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                      1
                    </span>
                    ข้อมูลลูกค้า (Customer Info)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500">
                        ชื่อผู้ติดต่อ / ลูกค้า *
                      </Label>
                      <Input
                        required
                        placeholder="เช่น คุณวิเชียร"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500">
                        เบอร์โทรศัพท์ *
                      </Label>
                      <Input
                        required
                        type="tel"
                        placeholder="08X-XXX-XXXX"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs font-bold text-slate-500">
                        ชื่อบริษัท / องค์กร (ถ้ามี)
                      </Label>
                      <Input
                        placeholder="เช่น บจก. ไทยอินดัสทรี"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                {/* 2. ข้อมูลความต้องการ (งานก่อสร้าง) */}
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                      2
                    </span>
                    รายละเอียดงานก่อสร้าง (Project Details)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs font-bold text-slate-500">
                        ชื่อโปรเจกต์ / ลักษณะงานสั้นๆ *
                      </Label>
                      <Input
                        required
                        placeholder="เช่น งานต่อเติมโกดัง 500 ตรม."
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500">
                        ประเภทงาน (Project Type) *
                      </Label>
                      <select
                        required
                        className="w-full h-12 bg-slate-50 border border-slate-200 px-4 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 appearance-none"
                      >
                        <option value="">-- เลือกประเภทงาน --</option>
                        <option value="NEW_BUILD">งานก่อสร้างอาคารใหม่</option>
                        <option value="RENOVATION">งานรีโนเวท / ต่อเติม</option>
                        <option value="INTERIOR">งานตกแต่งภายใน</option>
                        <option value="STRUCTURE">
                          งานโครงสร้างเหล็ก / โกดัง
                        </option>
                        <option value="SYSTEM">
                          งานระบบไฟฟ้า / ประปา (MEP)
                        </option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500">
                        งบประมาณคร่าวๆ (บาท)
                      </Label>
                      <Input
                        type="number"
                        placeholder="เช่น 2500000"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold focus:border-blue-500 text-emerald-600"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs font-bold text-slate-500">
                        สถานที่ก่อสร้าง (Location) *
                      </Label>
                      <Input
                        required
                        placeholder="ระบุเขต, จังหวัด หรือ ลิงก์ Google Maps"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs font-bold text-slate-500">
                        รายละเอียดเพิ่มเติม / ข้อความจากลูกค้า
                      </Label>
                      <textarea
                        rows={3}
                        placeholder="ลูกค้าต้องการคานเหล็กกว้างพิเศษ..."
                        className="w-full bg-slate-50 p-4 border border-slate-200 rounded-xl font-medium focus:border-blue-500 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 sm:p-8 border-t border-slate-100 flex gap-4 shrink-0 bg-white">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowModal(false)}
                className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-100"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                form="new-lead-form"
                className="flex-[2] h-14 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all"
              >
                บันทึกเข้าสู่ระบบ (Create Lead)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

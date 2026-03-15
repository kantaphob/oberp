"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/hooks/useToast";
import {
  Loader2,
  Save,
  BadgePercent,
  Coins,
  Clock,
  Settings2,
  Plus,
  Trash2,
  ListPlus,
  MinusCircle,
} from "lucide-react";

export default function PayrollConfigPage() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    ssoRateEmployee: 5.0,
    ssoRateCompany: 5.0,
    ssoMaxBase: 15000,
    whtRateDaily: 3.0,
    otRateNormal: 1.5,
    otRateHoliday: 3.0,
    latePenaltyPerMin: 5.0,
  });

  // 🌟 State สำหรับประเภทรายรับ/การหัก
  const [earningTypes, setEarningTypes] = useState<any[]>([]);
  const [deductionTypes, setDeductionTypes] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [newEarning, setNewEarning] = useState({ code: "", name: "" });
  const [newDeduction, setNewDeduction] = useState({ code: "", name: "" });

  useEffect(() => {
    fetchConfig();
    fetchTypes();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/hrm/payroll/config");
      const result = await res.json();
      if (result.success && result.data) {
        setConfig(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch config", error);
      notify.error("ไม่สามารถดึงข้อมูลการตั้งค่าได้");
    } finally {
      // setLoading(false); // Move to fetchTypes if needed
    }
  };

  const fetchTypes = async () => {
    setLoadingTypes(true);
    try {
      const [eRes, dRes] = await Promise.all([
        fetch("/api/hrm/payroll/config/earning-types"),
        fetch("/api/hrm/payroll/config/deduction-types"),
      ]);
      const [eJson, dJson] = await Promise.all([eRes.json(), dRes.json()]);
      
      if (eJson.success) setEarningTypes(eJson.data);
      if (dJson.success) setDeductionTypes(dJson.data);
    } catch (error) {
      console.error("Failed to fetch types", error);
    } finally {
      setLoadingTypes(false);
      setLoading(false);
    }
  };

  const handleAddEarning = async () => {
    const code = newEarning.code.trim() || generateCodeFromName(newEarning.name) || (earningTypes.length + 1).toString();
    
    if (!newEarning.name) {
      return notify.error("กรุณาระบุชื่อประเภทรายรับ");
    }
    try {
      const res = await fetch("/api/hrm/payroll/config/earning-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEarning, code }),
      });
      const result = await res.json();
      if (result.success) {
        setEarningTypes([...earningTypes, result.data]);
        setNewEarning({ code: "", name: "" });
        notify.success("เพิ่มประเภทรายรับสำเร็จ");
      } else {
        notify.error("เกิดข้อผิดพลาด", result.message);
      }
    } catch (err) {
      notify.error("ไม่สามารถเพิ่มประเภทรายรับได้");
    }
  };

  const handleDeleteEarning = async (id: string) => {
    try {
      const res = await fetch(`/api/hrm/payroll/config/earning-types?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setEarningTypes(earningTypes.filter((t) => t.id !== id));
        notify.success("ลบประเภทรายรับสำเร็จ");
      }
    } catch (err) {
      notify.error("ไม่สามารถลบประเภทรายรับได้");
    }
  };

  const handleAddDeduction = async () => {
    const code = newDeduction.code.trim() || generateCodeFromName(newDeduction.name) || (deductionTypes.length + 1).toString();

    if (!newDeduction.name) {
      return notify.error("กรุณาระบุชื่อประเภทการหัก");
    }
    try {
      const res = await fetch("/api/hrm/payroll/config/deduction-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newDeduction, code }),
      });
      const result = await res.json();
      if (result.success) {
        setDeductionTypes([...deductionTypes, result.data]);
        setNewDeduction({ code: "", name: "" });
        notify.success("เพิ่มประเภทการหักสำเร็จ");
      } else {
        notify.error("เกิดข้อผิดพลาด", result.message);
      }
    } catch (err) {
      notify.error("ไม่สามารถเพิ่มประเภทการหักได้");
    }
  };

  const handleDeleteDeduction = async (id: string) => {
    try {
      const res = await fetch(`/api/hrm/payroll/config/deduction-types?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setDeductionTypes(deductionTypes.filter((t) => t.id !== id));
        notify.success("ลบประเภทการหักสำเร็จ");
      }
    } catch (err) {
      notify.error("ไม่สามารถลบประเภทการหักได้");
    }
  };

  const generateCodeFromName = (name: string) => {
    const generated = name
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\u0000-\u007F]/g, "") // Remove Thai/non-latin
      .replace(/[^\w]/g, "")
      .slice(0, 10);
    return generated;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/hrm/payroll/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const result = await res.json();
      if (result.success) {
        notify.success("บันทึกการตั้งค่าสำเร็จ", "ข้อมูลถูกบันทึกลงระบบแล้ว");
      } else {
        notify.error("เกิดข้อผิดพลาด", result.message);
      }
    } catch (error) {
      notify.error("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            กำลังโหลดข้อมูล...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings2 className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              การตั้งค่าเงินเดือนกลาง
            </h1>
          </div>
          <p className="text-muted-foreground">
            กำหนดเรทภาษี ประกันสังคม และอัตราค่าล่วงเวลามาตรฐานสำหรับทั้งองค์กร
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-8 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          บันทึกการตั้งค่า
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ประกันสังคม */}
        <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BadgePercent className="w-5 h-5 text-blue-500" />
              </div>
              <CardTitle>ประกันสังคม (Social Security)</CardTitle>
            </div>
            <CardDescription>
              ตั้งค่าอัตราเงินสมทบและฐานเงินเดือนสูงสุด
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="ssoRateEmployee" className="text-sm font-medium">
                อัตราเงินสมทบพนักงาน (%)
              </Label>
              <div className="relative">
                <Input
                  id="ssoRateEmployee"
                  type="number"
                  step="0.1"
                  value={config.ssoRateEmployee}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ssoRateEmployee: parseFloat(e.target.value),
                    })
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ssoRateCompany" className="text-sm font-medium">
                อัตราเงินสมทบฝ่ายนายจ้าง (%)
              </Label>
              <div className="relative">
                <Input
                  id="ssoRateCompany"
                  type="number"
                  step="0.1"
                  value={config.ssoRateCompany}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ssoRateCompany: parseFloat(e.target.value),
                    })
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ssoMaxBase" className="text-sm font-medium">
                เพดานฐานเงินเดือนสำหรับ SSO (บาท)
              </Label>
              <div className="relative">
                <Input
                  id="ssoMaxBase"
                  type="number"
                  value={config.ssoMaxBase}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ssoMaxBase: parseFloat(e.target.value),
                    })
                  }
                  className="pr-12"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                  บาท
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ภาษี */}
        <Card className="border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Coins className="w-5 h-5 text-amber-500" />
              </div>
              <CardTitle>ภาษีและค่าธรรมเนียม (Tax)</CardTitle>
            </div>
            <CardDescription>
              ตั้งค่าอัตราภาษีหัก ณ ที่จ่าย และค่าปรับ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="whtRateDaily" className="text-sm font-medium">
                อัตราภาษี หัก ณ ที่จ่าย (%)
              </Label>
              <div className="relative">
                <Input
                  id="whtRateDaily"
                  type="number"
                  step="0.1"
                  value={config.whtRateDaily}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      whtRateDaily: parseFloat(e.target.value),
                    })
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="latePenaltyPerMin"
                className="text-sm font-medium"
              >
                ค่าปรับการเข้างานสาย (บาท/นาที)
              </Label>
              <div className="relative">
                <Input
                  id="latePenaltyPerMin"
                  type="number"
                  value={config.latePenaltyPerMin}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      latePenaltyPerMin: parseFloat(e.target.value),
                    })
                  }
                  className="pr-16"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                  บ./นาที
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ค่าล่วงเวลา */}
        <Card className="border-t-4 border-t-emerald-500 md:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-500" />
              </div>
              <CardTitle>อัตราค่าล่วงเวลา (OT Rates)</CardTitle>
            </div>
            <CardDescription>
              กำหนดสูตรการคำนวณเงิน OT มาตรฐานต่อชั่วโมง
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="otRateNormal" className="text-sm font-medium">
                ตัวคูณ OT วันทำงานปกติ (เช่น 1.5 เท่า)
              </Label>
              <div className="relative">
                <Input
                  id="otRateNormal"
                  type="number"
                  step="0.1"
                  value={config.otRateNormal}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      otRateNormal: parseFloat(e.target.value),
                    })
                  }
                  className="pr-10"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                  เท่า
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="otRateHoliday" className="text-sm font-medium">
                ตัวคูณ OT วันหยุด (เช่น 3.0 เท่า)
              </Label>
              <div className="relative">
                <Input
                  id="otRateHoliday"
                  type="number"
                  step="0.1"
                  value={config.otRateHoliday}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      otRateHoliday: parseFloat(e.target.value),
                    })
                  }
                  className="pr-10"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                  เท่า
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ประเภทรายรับ */}
        <Card className="border-t-4 border-t-indigo-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <ListPlus className="w-5 h-5 text-indigo-500" />
              </div>
              <CardTitle>ประเภทรายรับ (Earning Types)</CardTitle>
            </div>
            <CardDescription>จัดการรายการรายรับเพิ่มเติม เช่น โบนัส, ค่าคอมมิชชั่น</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="grid gap-1 flex-[1]">
                <Label htmlFor="eCode" className="text-[10px] font-bold uppercase text-muted-foreground">Code</Label>
                <Input
                  id="eCode"
                  placeholder="เช่น OT"
                  value={newEarning.code}
                  onChange={(e) => setNewEarning({ ...newEarning, code: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="grid gap-1 flex-[2]">
                <Label htmlFor="eName" className="text-[10px] font-bold uppercase text-muted-foreground">ประเภทรายรับ</Label>
                <Input
                  id="eName"
                  placeholder="เช่น ค่าล่วงเวลา"
                  value={newEarning.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const code = newEarning.code || generateCodeFromName(name);
                    setNewEarning({ ...newEarning, name, code });
                  }}
                  className="h-9"
                />
              </div>
              <Button onClick={handleAddEarning} size="icon" className="mt-5 h-9 w-9 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold text-slate-500 uppercase text-[10px]">Code</th>
                    <th className="px-3 py-2 text-left font-bold text-slate-500 uppercase text-[10px]">ชื่อประเภท</th>
                    <th className="px-3 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loadingTypes ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground italic">กำลังโหลด...</td>
                    </tr>
                  ) : earningTypes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground italic">ยังไม่มีข้อมูล</td>
                    </tr>
                  ) : (
                    earningTypes.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-3 py-2 font-black text-indigo-600">{t.code}</td>
                        <td className="px-3 py-2 font-medium">{t.name}</td>
                        <td className="px-3 py-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => handleDeleteEarning(t.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ประเภทการหัก */}
        <Card className="border-t-4 border-t-rose-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 rounded-lg">
                <MinusCircle className="w-5 h-5 text-rose-500" />
              </div>
              <CardTitle>ประเภทการหัก (Deduction Types)</CardTitle>
            </div>
            <CardDescription>จัดการรายการหักเงิน เช่น เงินค้ำประกัน, ค่าปรับ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="grid gap-1 flex-[1]">
                <Label htmlFor="dCode" className="text-[10px] font-bold uppercase text-muted-foreground">Code</Label>
                <Input
                  id="dCode"
                  placeholder="เช่น FINE"
                  value={newDeduction.code}
                  onChange={(e) => setNewDeduction({ ...newDeduction, code: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="grid gap-1 flex-[2]">
                <Label htmlFor="dName" className="text-[10px] font-bold uppercase text-muted-foreground">การหัก</Label>
                <Input
                  id="dName"
                  placeholder="เช่น ค่าปรับวินัย"
                  value={newDeduction.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const code = newDeduction.code || generateCodeFromName(name);
                    setNewDeduction({ ...newDeduction, name, code });
                  }}
                  className="h-9"
                />
              </div>
              <Button onClick={handleAddDeduction} size="icon" className="mt-5 h-9 w-9 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold text-slate-500 uppercase text-[10px]">Code</th>
                    <th className="px-3 py-2 text-left font-bold text-slate-500 uppercase text-[10px]">ชื่อประเภท</th>
                    <th className="px-3 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loadingTypes ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground italic">กำลังโหลด...</td>
                    </tr>
                  ) : deductionTypes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground italic">ยังไม่มีข้อมูล</td>
                    </tr>
                  ) : (
                    deductionTypes.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-3 py-2 font-black text-rose-600">{t.code}</td>
                        <td className="px-3 py-2 font-medium">{t.name}</td>
                        <td className="px-3 py-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => handleDeleteDeduction(t.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

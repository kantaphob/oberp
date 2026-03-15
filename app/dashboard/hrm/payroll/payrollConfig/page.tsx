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

  useEffect(() => {
    fetchConfig();
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
      setLoading(false);
    }
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
      </div>
    </div>
  );
}

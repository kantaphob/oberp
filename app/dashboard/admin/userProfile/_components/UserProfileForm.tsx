"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/app/hooks/useToast";
import { User, JobRole, Department } from "@/app/generated/prisma";
import { useSupervisor } from "@/app/hooks/useSupervisor";
import { SupervisorModal } from "@/app/components/Supervisor/SupervisorModal";
import { Loader2, Save, ChevronLeft, CheckCircle, AlertCircle, Search } from "lucide-react";
import { useThailandAddress } from "@/app/hooks/useThailandAddress";

interface UserProfileFormProps {
  initialData?: any;
  isEdit?: boolean;
  children?: React.ReactNode;
}

export function UserProfileForm({
  initialData,
  isEdit = false,
  children,
}: UserProfileFormProps) {
  const router = useRouter();
  const {
    isOpen,
    loading: supervisorLoading,
    openModal,
    closeModal,
    handleConfirm,
  } = useSupervisor();
  const { notify } = useToast();

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);

  // ✅ Custom Hook จัดการเรื่อง Dropdown จังหวัด/อำเภอ/ตำบล/ไปรษณีย์ทั้งหมด
  const {
    provinces,
    districts,
    subdistricts,
    address,
    setAddressField,
    lookupByZipcode,
    setFullAddress,
    zipcodeStatus,
  } = useThailandAddress({
    initialValue: {
      provinceId: initialData?.profile?.provinceId?.toString() ?? "",
      districtId: initialData?.profile?.districtId?.toString() ?? "",
      subdistrictId: initialData?.profile?.subdistrictId?.toString() ?? "",
      zipcode: initialData?.profile?.zipcode ?? "",
    },
  });

  // Safe date formatting function
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const [formData, setFormData] = useState({
    userId: initialData?.id || "",
    username: initialData?.username || "",
    email: initialData?.email || "",
    status: initialData?.status || "ACTIVE",
    roleId: initialData?.roleId || "",
    // Profile fields (ที่อยู่จะอ่านจาก `address` ของ Hook แทน)
    firstName: initialData?.profile?.firstName || "",
    lastName: initialData?.profile?.lastName || "",
    taxId: initialData?.profile?.taxId || "",
    telephoneNumber: initialData?.profile?.telephoneNumber || "",
    lineId: initialData?.profile?.lineId || "",
    addressDetail: initialData?.profile?.addressDetail || "",
    departmentId: initialData?.profile?.departmentId || initialData?.role?.departmentId || "",
    gender: initialData?.profile?.gender || "",
    nationality: initialData?.profile?.nationality || "",
    birthDate: formatDate(initialData?.profile?.birthDate),
    startDate:
      formatDate(initialData?.profile?.startDate) || formatDate(new Date()),
  });

  const [initialValues] = useState({ ...formData });
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialValues);

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      // จังหวัด/อำเภอ/ตำบล ถูกจัดการโดย useThailandAddress Hook แล้ว
      // เหลือแค่ departments, roles, และ unassigned users
      const [deptsRes, rolesRes, usersRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/jobroles"),
        !isEdit ? fetch("/api/users?noProfile=true") : Promise.resolve(null),
      ]);

      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (usersRes && usersRes.ok) setUnassignedUsers(await usersRes.json());
    } catch (error) {
      console.error("Failed to fetch base data:", error);
    }
  };

  // ✅ useEffect สำหรับ Cascade + Zipcode Lookup ถูกย้ายไปอยู่ใน useThailandAddress Hook แล้ว
  // ไม่ต้องเขียนซ้ำที่นี่อีก!

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "userId" && !isEdit) {
      const selectedUser = unassignedUsers.find((u) => u.id === value) as any;
      setFormData((prev) => ({
        ...prev,
        userId: value,
        username: selectedUser?.username || "",
        email: selectedUser?.email || "",
        roleId: selectedUser?.roleId || prev.roleId,
        departmentId: selectedUser?.role?.departmentId || prev.departmentId,
      }));
    } else if (name === "roleId") {
      const selectedRole = roles.find((r) => r.id === value);
      setFormData((prev) => ({
        ...prev,
        roleId: value,
        departmentId: selectedRole?.departmentId || prev.departmentId,
      }));
    } else {
      // ✅ field ที่อยู่ (province/district/subdistrict/zipcode) ส่งไปให้ setAddressField จัดการ
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handler เฉพาะสำหรับ field ที่อยู่ ใช้ใน JSX ของ Address Section
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressField(name as any, value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && !isDirty) {
      notify.info("ไม่มีการเปลี่ยนแปลงข้อมูลที่ต้องบันทึก");
      return;
    }

    openModal(async (supervisorUsername) => {
      saveData(supervisorUsername);
    });
  };

  const handleCancel = () => {
    if (isDirty) {
      if (
        !confirm("คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการยกเลิกใช่หรือไม่?")
      ) {
        return;
      }
    }
    router.back();
  };

  const saveData = async (approverUsername?: string) => {
    setLoading(true);
    try {
      // Zipcode validation — zipcode อยู่ใน `address` ของ Hook
      if (address.zipcode) {
        try {
          const postcodeRes = await fetch(
            `/api/postcode/validate?zipcode=${address.zipcode}`,
          );
          const postcodeData = await postcodeRes.json();

          if (!postcodeRes.ok || !postcodeData.valid) {
            notify.error(postcodeData.message || "รหัสไปรษณีย์ไม่ถูกต้อง");
            setLoading(false);
            return;
          }
        } catch {
          notify.error("ไม่สามารถตรวจสอบรหัสไปรษณีย์ได้ กรุณาลองใหม่");
          setLoading(false);
          return;
        }
      }

      // ถ้ากำลังกรอก Profile ให้กับ User ที่มีอยู่แล้ว (เลือกจาก Dropdown)
      // ควรใช้ PUT และชี้ไปที่ ID ของ User คนนั้นครับ
      const targetUserId = isEdit ? initialData.id : formData.userId;

      const url = targetUserId ? `/api/users/${targetUserId}` : "/api/users";
      const method = targetUserId ? "PUT" : "POST";

      // รวม formData กับ address จาก Hook เป็น payload เดียว
      const payload = {
        ...formData,
        provinceId: address.provinceId,
        districtId: address.districtId,
        subdistrictId: address.subdistrictId,
        zipcode: address.zipcode,
        approverUsername,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        notify.onSaveSuccess(data.message || (isEdit ? "อัปเดตข้อมูลสำเร็จ" : "สร้างข้อมูลสำเร็จ"));
        router.push("/dashboard/admin/userProfile");
        router.refresh();
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error: any) {
      notify.onApiError(error, isEdit ? "แก้ไขข้อมูล" : "สร้างพนักงาน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form id="user-profile-form" onSubmit={onSubmit} className="space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          type="button"
        >
          <ChevronLeft />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "แก้ไขข้อมูลเพิ่มเติม" : "เพิ่มข้อมูลพนักงาน"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Section -> Now for Selection/Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{isEdit ? "ข้อมูลบัญชี" : "เลือกพนักงาน"}</CardTitle>
            <CardDescription>
              {isEdit
                ? "รายละเอียดบัญชีผู้ใช้"
                : "เลือกรายชื่อพนักงานที่ต้องการเพิ่มข้อมูลประวัติ"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEdit ? (
              <div className="space-y-2">
                <Label htmlFor="userId">เลือกรายชื่อพนักงาน</Label>
                <select
                  id="userId"
                  name="userId"
                  className="w-full p-2 border rounded-md"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- กรุณาเลือกพนักงาน --</option>
                  {unassignedUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} {user.email ? `(${user.email})` : ""}
                    </option>
                  ))}
                </select>
                {unassignedUsers.length === 0 && (
                  <p className="text-[11px] text-amber-600 font-medium">
                    * ไม่พบรายชื่อพนักงานที่ยังไม่มีข้อมูลประวัติในระบบ
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="p-2.5 bg-slate-50 border rounded-md font-bold text-slate-700">
                  @{formData.username}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">สถานะบัญชี</Label>
                <select
                  id="status"
                  name="status"
                  className="w-full p-2 border rounded-md"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              {isEdit && formData.email && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Personal Info Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>ข้อมูลส่วนตัว</CardTitle>
            <CardDescription>ข้อมูลพื้นฐานของพนักงาน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อจริง</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">นามสกุล</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxId">เลขบัตรประชาชน (13 หลัก)</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  maxLength={13}
                  value={formData.taxId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephoneNumber">เบอร์โทรศัพท์</Label>
                <Input
                  id="telephoneNumber"
                  name="telephoneNumber"
                  maxLength={10}
                  value={formData.telephoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">เพศ</Label>
                <select
                  id="gender"
                  name="gender"
                  className="w-full p-2 border rounded-md"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">ระบุเพศ</option>
                  <option value="MALE">ชาย</option>
                  <option value="FEMALE">หญิง</option>
                  <option value="OTHER">อื่นๆ</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">วันเกิด</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address & Organization Section */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>ที่อยู่และข้อมูลองค์กร</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressDetail">
                  ที่อยู่ (เลขที่, หมู่, ถนน)
                </Label>
                <Input
                  id="addressDetail"
                  name="addressDetail"
                  value={formData.addressDetail}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* ✅ ใช้ address จาก useThailandAddress Hook */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provinceId">จังหวัด</Label>
                  <select
                    id="provinceId"
                    name="provinceId"
                    className="w-full p-2 border rounded-md"
                    value={address.provinceId}
                    onChange={handleAddressChange}
                    required
                  >
                    <option value="">เลือกจังหวัด</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameTh}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="districtId">อำเภอ/เขต</Label>
                  <select
                    id="districtId"
                    name="districtId"
                    className="w-full p-2 border rounded-md"
                    value={address.districtId}
                    onChange={handleAddressChange}
                    required
                    disabled={!address.provinceId}
                  >
                    <option value="">เลือกอำเภอ</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameTh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subdistrictId">ตำบล/แขวง</Label>
                  <select
                    id="subdistrictId"
                    name="subdistrictId"
                    className="w-full p-2 border rounded-md"
                    value={address.subdistrictId}
                    onChange={handleAddressChange}
                    required
                    disabled={!address.districtId}
                  >
                    <option value="">เลือกตำบล</option>
                    {subdistricts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameTh}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipcode">รหัสไปรษณีย์</Label>
                  <div className="relative">
                    <Input
                      id="zipcode"
                      name="zipcode"
                      maxLength={5}
                      placeholder="เช่น 10110"
                      value={address.zipcode}
                      onChange={(e) => {
                        const zip = e.target.value.replace(/\D/g, "");
                        setAddressField("zipcode", zip);
                        lookupByZipcode(zip); // 🔍 Reverse Lookup ทันทีที่ครบ 5 หลัก
                      }}
                      className={`pr-8 ${
                        zipcodeStatus === "found_single" ? "border-green-500 focus:ring-green-500" :
                        zipcodeStatus === "not_found" || zipcodeStatus === "error" ? "border-red-400" :
                        ""
                      }`}
                    />
                    {/* Status Icon */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {zipcodeStatus === "loading" && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                      {(zipcodeStatus === "found_single" || zipcodeStatus === "found_multi") && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {(zipcodeStatus === "not_found" || zipcodeStatus === "error") && <AlertCircle className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
                  {/* Feedback message */}
                  {zipcodeStatus === "found_single" && (
                    <p className="text-[11px] text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> กรอกที่อยู่อัตโนมัติเรียบร้อย
                    </p>
                  )}
                  {zipcodeStatus === "found_multi" && (
                    <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                      <Search className="w-3 h-3" /> พบหลายตำบล กรุณาเลือกตำบลด้านบน
                    </p>
                  )}
                  {zipcodeStatus === "not_found" && (
                    <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> ไม่พบรหัสไปรษณีย์นี้
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roleId" className="text-orange-600 font-bold">ตำแหน่ง (Role)</Label>
                <select
                  id="roleId"
                  name="roleId"
                  className="w-full p-2 border border-orange-200 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  value={formData.roleId}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกตำแหน่ง</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} (L{role.level})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId" className="text-orange-600 font-bold">แผนก (Department)</Label>
                <select
                  id="departmentId"
                  name="departmentId"
                  className="w-full p-2 border border-orange-200 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกแผนก</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">วันที่เริ่มงาน</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lineId">Line ID</Label>
                <Input
                  id="lineId"
                  name="lineId"
                  value={formData.lineId}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">สัญชาติ</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="เช่น ไทย"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>

      {children}

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" type="button" onClick={handleCancel}>
          ยกเลิก
        </Button>
        <Button
          form="user-profile-form"
          type="submit"
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 min-w-[150px]"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <Save className="mr-2" />
          )}
          {isEdit ? "บันทึกการแก้ไข" : "สร้างข้อมูลพนักงาน"}
        </Button>
      </div>

      <SupervisorModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        loading={supervisorLoading}
      />
    </div>
  );
}

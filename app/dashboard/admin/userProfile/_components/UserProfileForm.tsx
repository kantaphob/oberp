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
import { toast } from "sonner";
import {
  User,
  JobRole,
  Department,
  Province,
  District,
  Subdistrict,
} from "@/app/generated/prisma";
import { useSupervisor } from "@/app/hooks/useSupervisor";
import { SupervisorModal } from "@/app/components/Supervisor/SupervisorModal";
import { Loader2, Save, ChevronLeft } from "lucide-react";

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

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);

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
    userId: initialData?.id || "", // For linking to existing user
    username: initialData?.username || "",
    email: initialData?.email || "",
    status: initialData?.status || "ACTIVE",
    roleId: initialData?.roleId || "",

    // Profile fields
    firstName: initialData?.profile?.firstName || "",
    lastName: initialData?.profile?.lastName || "",
    taxId: initialData?.profile?.taxId || "",
    telephoneNumber: initialData?.profile?.telephoneNumber || "",
    lineId: initialData?.profile?.lineId || "",
    addressDetail: initialData?.profile?.addressDetail || "",
    provinceId: initialData?.profile?.provinceId || "",
    districtId: initialData?.profile?.districtId || "",
    subdistrictId: initialData?.profile?.subdistrictId || "",
    zipcode: initialData?.profile?.zipcode || "",
    departmentId: initialData?.profile?.departmentId || "",
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
      const [deptsRes, rolesRes, provRes, usersRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/jobroles"),
        fetch("/api/postcode/provinces"),
        !isEdit ? fetch("/api/users?noProfile=true") : Promise.resolve(null),
      ]);

      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (provRes.ok) setProvinces(await provRes.json());
      if (usersRes && usersRes.ok) setUnassignedUsers(await usersRes.json());
    } catch (error) {
      console.error("Failed to fetch base data:", error);
    }
  };

  useEffect(() => {
    if (formData.provinceId) {
      fetch(`/api/postcode/districts?provinceId=${formData.provinceId}`)
        .then((res) => res.json())
        .then((data) => setDistricts(data));
    } else {
      setDistricts([]);
    }
  }, [formData.provinceId]);

  useEffect(() => {
    if (formData.districtId) {
      fetch(`/api/postcode/subdistricts?districtId=${formData.districtId}`)
        .then((res) => res.json())
        .then((data) => setSubdistricts(data));
    } else {
      setSubdistricts([]);
    }
  }, [formData.districtId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "userId" && !isEdit) {
      const selectedUser = unassignedUsers.find((u) => u.id === value);
      setFormData((prev) => ({
        ...prev,
        userId: value,
        username: selectedUser?.username || "",
        email: selectedUser?.email || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && !isDirty) {
      toast.info("ไม่มีการเปลี่ยนแปลงข้อมูลที่ต้องบันทึก");
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
      // Zipcode validation using postcode API
      if (formData.zipcode) {
        try {
          const postcodeRes = await fetch(
            `/api/postcode/validate?zipcode=${formData.zipcode}`,
          );
          const postcodeData = await postcodeRes.json();

          if (!postcodeRes.ok || !postcodeData.valid) {
            toast.error(postcodeData.message || "รหัสไปรษณีย์ไม่ถูกต้อง");
            setLoading(false);
            return;
          }
        } catch {
          toast.error("ไม่สามารถตรวจสอบรหัสไปรษณีย์ได้ กรุณาลองใหม่");
          setLoading(false);
          return;
        }
      }

      // ถ้ากำลังกรอก Profile ให้กับ User ที่มีอยู่แล้ว (เลือกจาก Dropdown)
      // ควรใช้ PUT และชี้ไปที่ ID ของ User คนนั้นครับ
      const targetUserId = isEdit ? initialData.id : formData.userId;

      const url = targetUserId ? `/api/users/${targetUserId}` : "/api/users";
      const method = targetUserId ? "PUT" : "POST";

      const payload = {
        ...formData,
        approverUsername,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          data.message || (isEdit ? "อัปเดตข้อมูลสำเร็จ" : "สร้างข้อมูลสำเร็จ"),
        );
        router.push("/dashboard/admin/userProfile");
        router.refresh();
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleId">ตำแหน่ง (Role)</Label>
                <select
                  id="roleId"
                  name="roleId"
                  className="w-full p-2 border rounded-md"
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
                <Label htmlFor="status">สถานะ</Label>
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
            {/* Department moved here */}
            <div className="space-y-2">
              <Label htmlFor="departmentId">แผนก (Department)</Label>
              <select
                id="departmentId"
                name="departmentId"
                className="w-full p-2 border rounded-md"
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provinceId">จังหวัด</Label>
                  <select
                    id="provinceId"
                    name="provinceId"
                    className="w-full p-2 border rounded-md"
                    value={formData.provinceId}
                    onChange={handleChange}
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
                    value={formData.districtId}
                    onChange={handleChange}
                    required
                    disabled={!formData.provinceId}
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
                    value={formData.subdistrictId}
                    onChange={handleChange}
                    required
                    disabled={!formData.districtId}
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
                  <Input
                    id="zipcode"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
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

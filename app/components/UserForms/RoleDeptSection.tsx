"use client";

/**
 * RoleDeptSection — Shared UI Component (Admin + HRM เท่านั้น)
 *
 * แสดงฟิลด์ตำแหน่งและสังกัด: แผนก, ตำแหน่ง (Job Role) + Level badge
 * ⚠️ ห้ามใช้ใน Portal (พนักงานไม่ควรเห็น/แก้ Role ตัวเอง)
 */

import React from "react";
import { Building2, Network } from "lucide-react";
import { getLevelColor } from "@/app/lib/ui-configs";
import type { JobRole, Department } from "@/app/generated/prisma";

interface RoleDeptSectionProps {
  roleId: string;
  departmentId: string;
  roles: JobRole[];
  departments: Department[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** ถ้า true = ล็อค role/dept (เช่น Edit mode ที่ HRM กำหนดแล้ว) */
  readOnly?: boolean;
}

export function RoleDeptSection({
  roleId,
  departmentId,
  roles,
  departments,
  onChange,
  readOnly = false,
}: RoleDeptSectionProps) {
  const selectedRole = roles.find((r) => r.id === roleId);
  const levelCfg = selectedRole ? getLevelColor(selectedRole.level) : null;

  return (
    <div className="pf-glass pf-card">
      <div className="pf-card-header">
        <p className="pf-section-title">
          <Network size={12} className="text-slate-400" />
          ตำแหน่งและสังกัด
        </p>
      </div>
      <div className="pf-card-body space-y-4">
        {/* ตำแหน่ง */}
        <div className="pf-field">
          <label className="pf-label">
            ตำแหน่ง (Job Role) <span className="text-red-500">*</span>
          </label>
          <select
            name="roleId"
            value={roleId}
            onChange={onChange}
            required
            disabled={readOnly}
            className="pf-input"
          >
            <option value="">— เลือกตำแหน่ง —</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                [LV.{r.level}] {r.name}
              </option>
            ))}
          </select>

          {/* Level badge preview */}
          {selectedRole && levelCfg && (
            <div className="mt-2 flex items-center gap-2">
              <span
                className="pf-badge"
                style={{
                  background: levelCfg.bg,
                  border: `1px solid ${levelCfg.border}`,
                  color: levelCfg.text,
                }}
              >
                LV.{selectedRole.level}
              </span>
              <span className="text-[12px] font-semibold text-slate-700">
                {selectedRole.name}
              </span>
              <span className="ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                {selectedRole.prefix}
              </span>
            </div>
          )}
        </div>
        {/* แผนก */}
        <div className="pf-field">
          <label className="pf-label">
            แผนก (Department) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              name="departmentId"
              value={departmentId}
              onChange={onChange}
              required
              disabled={readOnly}
              className="pf-input pl-8"
            >
              <option value="">— เลือกแผนก —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

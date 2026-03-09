"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
type Department = { name: string; code: string };
type JobRole = { name: string; prefix: string; level?: number };

type UserProfile = {
  firstName: string;
  lastName: string;
  taxId: string;
  birthDate: string;
  gender: string;
  nationality: string;
  telephoneNumber: string;
  lineId: string | null;
  image: string | null;
  addressDetail: string;
  zipcode: string | null;
  department: Department;
  role: JobRole;
  province: { nameTh: string } | null;
  district: { nameTh: string } | null;
  subdistrict: { nameTh: string } | null;
};

type UserData = {
  id: string;
  username: string;
  email: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  role: JobRole & { level: number };
  profile: UserProfile | null;
};

// ─── Mock (replace with fetch("/api/me")) ─────────────────────────────────────
const MOCK: UserData = {
  id: "a3f2c1d4-9e8b-47a2-b5c0-1234567890ab",
  username: "somchai.w",
  email: "somchai.w@oberp.co.th",
  status: "ACTIVE",
  role: { name: "Senior Developer", prefix: "SD", level: 3 },
  profile: {
    firstName: "สมชาย",
    lastName: "วงศ์สุวรรณ",
    taxId: "1234567890123",
    birthDate: "1990-01-01",
    gender: "Male",
    nationality: "Thai",
    telephoneNumber: "081-234-5678",
    lineId: "somchai.line",
    image: null,
    addressDetail: "123/45 ถนนสุขุมวิท",
    zipcode: "10110",
    department: { name: "Engineering", code: "ENG" },
    role: { name: "Senior Developer", prefix: "SD" },
    province: { nameTh: "กรุงเทพมหานคร" },
    district: { nameTh: "วัฒนา" },
    subdistrict: { nameTh: "คลองเตยเหนือ" },
  },
};

// ─── QR Image (no npm needed) ─────────────────────────────────────────────────
function QRImg({ value, size = 80 }: { value: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(value)}&color=111111&bgcolor=ffffff&margin=6`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="QR"
      width={size}
      height={size}
      style={{ borderRadius: 8, display: "block" }}
    />
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
  src,
  name,
  size = 64,
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="flex-shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        border: "2.5px solid rgba(245,98,15,0.55)",
        boxShadow: "0 4px 18px rgba(245,98,15,0.22)",
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-700">
          <span
            style={{
              color: "#F5620F",
              fontWeight: 900,
              fontSize: size * 0.3,
              letterSpacing: 2,
            }}
          >
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: UserData["status"] }) {
  const cfg = {
    ACTIVE: {
      label: "ใช้งานอยู่",
      dot: "#22c55e",
      bg: "#F0FDF4",
      text: "#166534",
      border: "#BBF7D0",
    },
    INACTIVE: {
      label: "ไม่ใช้งาน",
      dot: "#9CA3AF",
      bg: "#F9FAFB",
      text: "#6B7280",
      border: "#E5E7EB",
    },
    SUSPENDED: {
      label: "ถูกระงับ",
      dot: "#EF4444",
      bg: "#FEF2F2",
      text: "#991B1B",
      border: "#FECACA",
    },
  }[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}

// ─── Card Front ───────────────────────────────────────────────────────────────
function CardFront({ data }: { data: UserData }) {
  const p = data.profile;
  const fullName = p ? `${p.firstName} ${p.lastName}` : data.username;
  const isActive = data.status === "ACTIVE";
  const dept = p?.department?.name ?? "—";
  const roleLabel = p?.role?.name ?? data.role.name;
  const roleCode = p?.role?.prefix ?? data.role.prefix;

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        width: 340,
        height: 216,
        borderRadius: 18,
        background:
          "linear-gradient(135deg,#0D0D0D 0%,#1C1C1C 55%,#101010 100%)",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {/* top stripe */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: "linear-gradient(90deg,#F5620F,#FF9A5C,#F5620F)" }}
      />

      {/* glow blobs */}
      <div
        className="absolute -top-8 -right-5 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle,rgba(245,98,15,0.20) 0%,transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-5 -left-3 w-24 h-24 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle,rgba(245,98,15,0.10) 0%,transparent 70%)",
        }}
      />

      {/* diagonal accent */}
      <div
        className="absolute inset-y-0 right-0 w-[40%]"
        style={{
          background:
            "linear-gradient(155deg,rgba(245,98,15,0.13) 0%,transparent 55%)",
          borderLeft: "1px solid rgba(245,98,15,0.10)",
        }}
      />

      {/* company */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "#F5620F" }}
        >
          <span
            className="text-white font-black text-[11px]"
            style={{ letterSpacing: 0.5 }}
          >
            OB
          </span>
        </div>
        <div>
          <div
            className="text-white font-bold text-[11px]"
            style={{ letterSpacing: 2, lineHeight: 1 }}
          >
            OB ERP
          </div>
          <div
            className="text-[9px]"
            style={{ color: "rgba(255,255,255,0.3)", letterSpacing: 1.5 }}
          >
            EMPLOYEE ID
          </div>
        </div>
      </div>

      {/* NFC icon */}
      <div
        className="absolute top-4 right-4 text-[18px]"
        style={{ color: "rgba(245,98,15,0.4)" }}
      >
        ◎
      </div>

      {/* avatar */}
      <div className="absolute left-4 bottom-8">
        <Avatar src={p?.image ?? null} name={fullName} size={60} />
      </div>

      {/* ── name + dept + role ── */}
      <div
        className="absolute left-[88px] bottom-[36px]"
        style={{ maxWidth: 210 }}
      >
        <p className="text-white font-black text-[15px] leading-tight">
          {fullName}
        </p>

        {/* แผนก */}
        <div className="flex items-center gap-1 mt-[5px]">
          <span
            className="text-[8px] font-bold tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            แผนก
          </span>
          <span className="text-[11px] font-bold text-white/80 truncate">
            {dept}
          </span>
        </div>

        {/* ตำแหน่ง */}
        <div className="flex items-center gap-1 mt-[3px]">
          <span
            className="text-[8px] font-bold tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            ตำแหน่ง
          </span>
          <span
            className="text-[11px] font-bold truncate"
            style={{ color: "#F5620F" }}
          >
            {roleCode} · {roleLabel}
          </span>
        </div>
      </div>

      {/* bottom strip */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4"
        style={{
          height: 28,
          background: "rgba(0,0,0,0.55)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span
          className="font-mono text-[9px] uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          {data.id.split("-")[0].toUpperCase()}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-[7px] h-[7px] rounded-full"
            style={{
              background: isActive ? "#22c55e" : "#ef4444",
              boxShadow: isActive ? "0 0 7px #22c55e" : "0 0 7px #ef4444",
            }}
          />
          <span
            className="text-[9px] font-bold tracking-widest uppercase"
            style={{ color: isActive ? "#22c55e" : "#ef4444" }}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
        <span
          className="font-mono text-[9px]"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          {p?.telephoneNumber ?? "—"}
        </span>
      </div>
    </div>
  );
}

// ─── Card Back ────────────────────────────────────────────────────────────────
function CardBack({ data }: { data: UserData }) {
  const p = data.profile;
  const qrValue = `${data.id}|${data.username}`;

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        width: 340,
        height: 216,
        borderRadius: 18,
        background: "#F5F5F5",
        boxShadow: "0 24px 60px rgba(0,0,0,0.25),0 0 0 1px rgba(0,0,0,0.07)",
      }}
    >
      {/* top stripe */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: "linear-gradient(90deg,#F5620F,#FF9A5C,#F5620F)" }}
      />

      {/* magnetic stripe */}
      <div
        className="absolute inset-x-0"
        style={{
          top: 30,
          height: 36,
          background: "linear-gradient(180deg,#1a1a1a,#111)",
        }}
      />

      {/* signature line */}
      <div
        className="absolute inset-x-4 flex items-center pl-2"
        style={{
          top: 74,
          height: 26,
          background: "#fff",
          borderRadius: 4,
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <span className="text-[9px] tracking-widest" style={{ color: "#DDD" }}>
          AUTHORIZED SIGNATURE
        </span>
      </div>

      {/* QR + info */}
      <div className="absolute bottom-4 left-4 flex gap-3 items-end">
        <div
          className="p-1.5 bg-white rounded-xl"
          style={{
            border: "1.5px solid rgba(245,98,15,0.2)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <QRImg value={qrValue} size={76} />
        </div>
        <div className="pb-0.5 space-y-1.5">
          {/* แผนก */}
          <div>
            <p
              className="text-[9px] font-bold tracking-widest uppercase"
              style={{ color: "#F5620F" }}
            >
              แผนก
            </p>
            <p className="text-[12px] font-black text-neutral-800 leading-tight">
              {p?.department?.name ?? "—"}
            </p>
          </div>
          {/* ตำแหน่ง */}
          <div>
            <p
              className="text-[9px] font-bold tracking-widest uppercase"
              style={{ color: "#F5620F" }}
            >
              ตำแหน่ง
            </p>
            <p className="text-[11px] font-bold text-neutral-600 leading-tight">
              {p?.role?.prefix ?? data.role.prefix} ·{" "}
              {p?.role?.name ?? data.role.name}
            </p>
          </div>
          <p
            className="font-mono text-[9px] tracking-wide"
            style={{ color: "#BBB" }}
          >
            ID: {data.id.substring(0, 14)}…
          </p>
        </div>
      </div>

      {/* scan label */}
      <div className="absolute bottom-5 right-4 text-right">
        <p
          className="text-[9px] font-bold tracking-widest uppercase"
          style={{ color: "#BBB" }}
        >
          Scan to Verify
        </p>
        <p className="text-[9px] mt-0.5" style={{ color: "#CCC" }}>
          OB ERP · HR System
        </p>
      </div>

      {/* bottom stripe */}
      <div
        className="absolute inset-x-0 bottom-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg,transparent,#F5620F 40%,#FF9A5C 60%,transparent)",
        }}
      />
    </div>
  );
}

// ─── Info Field ───────────────────────────────────────────────────────────────
function InfoField({
  label,
  value,
  icon,
  colSpan = false,
}: {
  label: string;
  value?: string | null;
  icon?: string;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? "col-span-2" : ""}>
      <p
        className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5"
        style={{ letterSpacing: "0.15em" }}
      >
        {label}
      </p>
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 min-h-[42px] bg-neutral-50 border border-neutral-200">
        {icon && (
          <span
            className="text-[13px] flex-shrink-0"
            style={{ color: "#F5620F", opacity: 0.8 }}
          >
            {icon}
          </span>
        )}
        {value ? (
          <span className="text-[13px] font-semibold text-neutral-900 leading-snug">
            {value}
          </span>
        ) : (
          <span className="text-[13px] text-neutral-300 italic">ไม่ระบุ</span>
        )}
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3.5">
        <span className="text-base">{emoji}</span>
        <span
          className="text-[10px] font-black tracking-widest uppercase text-neutral-400"
          style={{ letterSpacing: "0.2em" }}
        >
          {title}
        </span>
        <div className="flex-1 h-px bg-neutral-100 ml-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="h-px bg-neutral-100 my-6" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PortalPage() {
  const [data, setData] = useState<UserData>(MOCK);
  const [flipped, setFlip] = useState(false);

  // swap MOCK → real API
  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {});
  }, []);

  const p = data.profile;
  const fullName = p ? `${p.firstName} ${p.lastName}` : data.username;
  const address = [
    p?.addressDetail,
    p?.subdistrict?.nameTh ? `ต.${p.subdistrict.nameTh}` : null,
    p?.district?.nameTh ? `อ.${p.district.nameTh}` : null,
    p?.province?.nameTh ? `จ.${p.province.nameTh}` : null,
    p?.zipcode,
  ]
    .filter(Boolean)
    .join("  ");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .portal { font-family:'Plus Jakarta Sans',sans-serif; }
        .flip-scene { perspective: 1200px; }
        .flip-inner {
          width:340px; height:216px; position:relative;
          transform-style:preserve-3d;
          transition:transform 0.72s cubic-bezier(.4,0,.2,1);
        }
        .flip-inner.flipped { transform:rotateY(180deg); }
        .flip-face {
          position:absolute; inset:0;
          backface-visibility:hidden; -webkit-backface-visibility:hidden;
        }
        .flip-back { transform:rotateY(180deg); }
      `}</style>

      <div className="portal min-h-screen bg-neutral-100">
        {/* ── Header ── */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-neutral-200">
          <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
                <span
                  className="font-black text-[11px]"
                  style={{ color: "#F5620F" }}
                >
                  OB
                </span>
              </div>
              <span className="font-bold text-[14px] text-neutral-900 tracking-wide">
                Employee Portal
              </span>
            </div>
            <nav className="flex items-center gap-1.5 text-[12px] text-neutral-400">
              <span>หน้าแรก</span>
              <span>›</span>
              <span className="font-semibold text-neutral-900">โปรไฟล์</span>
            </nav>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-7 space-y-4">
          {/* ── Card block ── */}
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
            <div
              className="h-[3px]"
              style={{
                background: "linear-gradient(90deg,#F5620F,#FF9A5C,#F5620F)",
              }}
            />
            <div className="px-7 pt-6 pb-7 flex flex-col items-center gap-4">
              <p
                className="text-[11px] font-black tracking-[0.18em] uppercase"
                style={{ color: "#F5620F" }}
              >
                บัตรพนักงาน
              </p>

              {/* flip card */}
              <div
                className="flip-scene cursor-pointer"
                onClick={() => setFlip((f) => !f)}
              >
                <div className={`flip-inner${flipped ? " flipped" : ""}`}>
                  <div className="flip-face">
                    <CardFront data={data} />
                  </div>
                  <div className="flip-face flip-back">
                    <CardBack data={data} />
                  </div>
                </div>
              </div>

              {/* dots */}
              <div className="flex gap-1.5">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-colors duration-300"
                    style={{
                      background: (flipped ? i === 1 : i === 0)
                        ? "#F5620F"
                        : "#DDD",
                    }}
                  />
                ))}
              </div>

              <p
                className="text-[11px] text-neutral-400"
                style={{ letterSpacing: "0.12em" }}
              >
                คลิกบัตรเพื่อพลิก
              </p>
            </div>
          </div>

          {/* ── Profile block ── */}
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
            <div
              className="h-[3px]"
              style={{
                background: "linear-gradient(90deg,#F5620F,#FF9A5C,#F5620F)",
              }}
            />
            <div className="px-7 pt-7 pb-8 space-y-0">
              {/* ── Hero row ── */}
              <div className="flex gap-5 items-start flex-wrap">
                <Avatar src={p?.image ?? null} name={fullName} size={82} />

                <div className="flex-1 min-w-[180px]">
                  {/* แผนก badge */}
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2"
                    style={{
                      background: "rgba(245,98,15,0.08)",
                      border: "1px solid rgba(245,98,15,0.18)",
                    }}
                  >
                    <span
                      className="text-[10px] font-black tracking-[0.16em] uppercase"
                      style={{ color: "#F5620F" }}
                    >
                      🏢 {p?.department?.name ?? "—"}
                    </span>
                  </div>

                  <h1 className="text-[26px] font-black text-neutral-900 leading-tight">
                    {fullName}
                  </h1>
                  <p className="text-[13px] text-neutral-400 font-medium mt-0.5">
                    @{data.username}
                  </p>

                  {/* badges row */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <StatusBadge status={data.status} />

                    {/* ตำแหน่ง badge */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-900 text-white">
                      <span style={{ color: "#F5620F" }}>◈</span>
                      {data.role.prefix} · {data.role.name}
                    </span>

                    {/* level badge */}
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{
                        background: "rgba(245,98,15,0.07)",
                        color: "#F5620F",
                        border: "1px solid rgba(245,98,15,0.18)",
                      }}
                    >
                      ⬡ Level {data.role.level}
                    </span>
                  </div>
                </div>

                {/* quick contact */}
                <div className="flex flex-col gap-2 text-right text-[12px] text-neutral-500 min-w-[140px]">
                  {data.email && (
                    <a
                      href={`mailto:${data.email}`}
                      className="hover:text-neutral-800 transition-colors no-underline flex items-center gap-1.5 justify-end"
                    >
                      <span>{data.email}</span>
                      <span className="text-neutral-300">✉</span>
                    </a>
                  )}
                  {p?.telephoneNumber && (
                    <a
                      href={`tel:${p.telephoneNumber}`}
                      className="hover:text-neutral-800 transition-colors no-underline flex items-center gap-1.5 justify-end"
                    >
                      <span>{p.telephoneNumber}</span>
                      <span className="text-neutral-300">✆</span>
                    </a>
                  )}
                  {p?.lineId && (
                    <div className="flex items-center gap-1.5 justify-end">
                      <span>{p.lineId}</span>
                      <span style={{ color: "#06C755" }}>⬡</span>
                    </div>
                  )}
                </div>
              </div>

              <Divider />

              {/* ── ข้อมูลการทำงาน (ขึ้นก่อน - สำคัญกว่า) ── */}
              <Section title="ข้อมูลการทำงาน" emoji="💼">
                {/* แผนก + ตำแหน่ง เต็มกว้าง เด่นชัด */}
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <div
                    className="rounded-2xl px-4 py-3.5"
                    style={{
                      background: "rgba(245,98,15,0.05)",
                      border: "1.5px solid rgba(245,98,15,0.18)",
                    }}
                  >
                    <p
                      className="text-[9px] font-black tracking-[0.2em] uppercase mb-1"
                      style={{ color: "#F5620F" }}
                    >
                      แผนก
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🏢</span>
                      <span className="text-[14px] font-black text-neutral-900">
                        {p?.department?.name ?? "—"}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5 font-medium">
                      {p?.department?.code}
                    </p>
                  </div>
                  <div
                    className="rounded-2xl px-4 py-3.5"
                    style={{
                      background: "rgba(17,17,17,0.04)",
                      border: "1.5px solid rgba(17,17,17,0.10)",
                    }}
                  >
                    <p className="text-[9px] font-black tracking-[0.2em] uppercase mb-1 text-neutral-400">
                      ตำแหน่ง
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🎯</span>
                      <span className="text-[14px] font-black text-neutral-900">
                        {p?.role?.name ?? data.role.name}
                      </span>
                    </div>
                    <p
                      className="text-[10px] font-medium mt-0.5"
                      style={{ color: "#F5620F" }}
                    >
                      {p?.role?.prefix ?? data.role.prefix} · Level{" "}
                      {data.role.level}
                    </p>
                  </div>
                </div>

                <InfoField label="Username" value={data.username} icon="@" />
                <InfoField
                  label="สถานะ"
                  value={data.status === "ACTIVE" ? "ใช้งานอยู่" : data.status}
                  icon="●"
                />
              </Section>

              <Divider />

              {/* ── ข้อมูลส่วนตัว ── */}
              <Section title="ข้อมูลส่วนตัว" emoji="👤">
                <InfoField label="ชื่อ" value={p?.firstName} icon="✦" />
                <InfoField label="นามสกุล" value={p?.lastName} icon="✦" />
                <InfoField label="วันเกิด" value={p?.birthDate} icon="🎂" />
                <InfoField label="เพศ" value={p?.gender} icon="👤" />
                <InfoField label="สัญชาติ" value={p?.nationality} icon="🌍" />
                <InfoField
                  label="หมายเลขบัตรประชาชน"
                  value={p?.taxId}
                  icon="🆔"
                />
                <InfoField label="อีเมล" value={data.email} icon="✉" />
                <InfoField
                  label="เบอร์โทรศัพท์"
                  value={p?.telephoneNumber}
                  icon="✆"
                />
                <InfoField label="Line ID" value={p?.lineId} icon="⬡" />
              </Section>

              <Divider />

              {/* ── ที่อยู่ ── */}
              <Section title="ที่อยู่" emoji="📍">
                <InfoField label="ที่อยู่" value={address} icon="⌂" colSpan />
                <InfoField label="จังหวัด" value={p?.province?.nameTh} />
                <InfoField label="อำเภอ" value={p?.district?.nameTh} />
                <InfoField label="ตำบล" value={p?.subdistrict?.nameTh} />
                <InfoField label="รหัสไปรษณีย์" value={p?.zipcode} />
              </Section>
            </div>
          </div>

          <p className="text-center text-[11px] text-neutral-300 tracking-widest pb-4">
            ข้อมูลส่วนบุคคล · อัปเดตอัตโนมัติจากระบบ HR
          </p>
        </div>
      </div>
    </>
  );
}

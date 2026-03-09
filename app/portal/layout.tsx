
import React from "react";
const menu = [
  {
    title: "Dashboard",
    href: "/portal",
  },
  {
    title: "Profile",
    href: "/portal/profile",
  },
];
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="flex gap-2">
        {menu.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold tracking-widest"
            style={{
              color: "#111",
              background: "#F0F0F0",
            }}
          >
            {item.title}
          </a>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}

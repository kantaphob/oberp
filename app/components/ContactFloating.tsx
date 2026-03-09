"use client";

import { Phone } from "lucide-react";
import { useEffect, useState } from "react";

type ContactInfo = {
  phone: string;
  lineUrl: string;
};

export default function ContactFloating() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        // ใช้ของจริงของคุณ
        // const res = await fetch("/app/api/");
        // const data = await res.json();
        // setContact(data);

        // Mock data ชั่วคราวเพื่อให้เห็นภาพ
        setContact({
          phone: "0616366225",
          lineUrl: "https://line.me/ti/p/~",
        });
      } catch (err) {
        console.error("Failed to fetch contact info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  if (loading || !contact) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 items-end">
      {/* LINE Button with Tooltip */}
      <div className="group relative flex items-center">
        <span className="absolute right-16 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-white/10 translate-x-2 group-hover:translate-x-0 duration-300">
          คุยผ่าน LINE
        </span>
        <a
          href={contact.lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#00C300] flex items-center justify-center shadow-[0_8px_20px_rgba(0,195,0,0.3)] hover:scale-110 transition-all duration-300 border border-white/20"
        >
          {/* SVG โลโก้ LINE คมชัด 100% */}
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-white fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.935 8.922 9.467 9.608.374.079.882.247 1.011.569.117.291.076.748.037 1.054-.037.288-.239 1.436-.293 1.706-.089.435-.411 2.016 1.765 1.096 2.176-.92 11.727-6.908 11.969-13.435C24 10.686 24 10.499 24 10.304zm-14.939 3.012H6.606c-.198 0-.358-.16-.358-.358V8.694c0-.198.16-.358.358-.358h.566c.198 0 .358.16.358.358v3.541h1.531c.198 0 .358.16.358.358v.564c0 .198-.16.359-.358.359zm3.011 0h-.566c-.198 0-.358-.16-.358-.358V8.694c0-.198.16-.358.358-.358h.566c.198 0 .358.16.358.358v4.264c0 .198-.16.359-.358.359zm3.508 0h-.449c-.114 0-.214-.055-.276-.139l-2.025-2.738v2.518c0 .198-.16.358-.358.358h-.566c-.198 0-.358-.16-.358-.358V8.694c0-.198.16-.358.358-.358h.449c.114 0 .215.055.276.139l2.025 2.738V8.694c0-.198.16-.358.358-.358h.566c.198 0 .358.16.358.358v4.264c0 .198-.16.359-.358.359zm3.899-2.61h-1.621v.961h1.621c.198 0 .358.16.358.358v.564c0 .198-.16.359-.358.359h-2.545c-.198 0-.358-.16-.358-.358V8.694c0-.198.16-.358.358-.358h2.545c.198 0 .358.16.358.358v.564c0 .198-.16.358-.358.358h-1.621v.91h1.621c.198 0 .358.16.358.358v.565c0 .196-.16.355-.358.355z" />
          </svg>
        </a>
      </div>

      {/* Phone Button with Tooltip */}
      <div className="group relative flex items-center">
        <span className="absolute right-16 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-white/10 translate-x-2 group-hover:translate-x-0 duration-300">
          โทรด่วนหาเรา
        </span>
        <a
          href={`tel:${contact.phone}`}
          className="w-14 h-14 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:bg-white hover:text-black hover:scale-110 transition-all duration-300"
        >
          <Phone
            size={22}
            className="animate-[pulse_2s_ease-in-out_infinite]"
          />
        </a>
      </div>
    </div>
  );
}

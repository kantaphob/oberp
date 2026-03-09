import React from "react";

export default function PrivacyPage() {
  return (
    // Wrapper หลักที่ควบคุมพื้นหลังแบบ Liquid
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center py-16 px-4 sm:px-6">
      {/* --- Liquid Background Blobs --- */}
      {/* วงกลมสีเบลอๆ ด้านหลังเพื่อสร้างมิติแบบ Liquid */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>

      {/* --- Glass Container --- */}
      {/* กล่องหลักแบบกระจก (Glassmorphism) */}
      <main className="relative max-w-4xl w-full mx-auto p-8 sm:p-12 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-slate-800 border-b border-slate-400/20 pb-6">
          นโยบายคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy)
        </h1>

        <section className="space-y-10 text-slate-700 leading-relaxed">
          {/* บทนำ และ การรับความยินยอม */}
          <div className="bg-white/30 p-6 rounded-2xl border border-white/40 shadow-sm text-lg">
            <p>
              บริษัท{" "}
              <strong className="text-slate-900">
                OBNITHI CONSTRUCTION CO., LTD.
              </strong>{" "}
              เคารพสิทธิความเป็นส่วนตัวของลูกค้า
              นโยบายฉบับนี้จัดทำขึ้นตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ.
              2562 (PDPA)
              <br />
              <br />
              <strong>การยินยอมของลูกค้า:</strong> การที่ท่านเข้าใช้งานเว็บไซต์
              ติดต่อสอบถาม หรือส่งมอบข้อมูลให้แก่บริษัท ถือว่าท่านได้รับทราบและ{" "}
              <strong>ให้ความยินยอม</strong> แก่บริษัทในการเก็บรวบรวม ใช้
              และประมวลผลข้อมูลส่วนบุคคลของท่านตามวัตถุประสงค์ที่ระบุไว้ในนโยบายฉบับนี้แล้ว
            </p>
          </div>

          {/* 🌟 กล่องเน้นย้ำเรื่องความลับของบริษัท */}
          <div className="bg-emerald-500/10 backdrop-blur-md border-l-4 border-emerald-500 p-6 my-8 rounded-r-2xl shadow-[0_4px_16px_0_rgba(16,185,129,0.1)] relative overflow-hidden">
            {/* ของตกแต่งด้านในกล่องเขียว */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl"></div>

            <h2 className="text-xl font-bold text-emerald-900 mb-3 relative z-10">
              นโยบายการรักษาความลับขั้นสูงสุด (Strict Confidentiality)
            </h2>
            <p className="text-emerald-800 relative z-10 leading-relaxed">
              บริษัทถือว่า ข้อมูลส่วนบุคคลของลูกค้า รายละเอียดโครงการ
              ประวัติการแก้ไขข้อมูล และการเก็บรักษาข้อมูลทั้งหมด เป็น{" "}
              <strong className="text-emerald-950">
                "ความลับทางบริษัท (Company Secret)"
              </strong>{" "}
              <br />
              <br />
              บริษัทมีนโยบายเด็ดขาดที่จะ{" "}
              <strong className="text-emerald-950 bg-emerald-200/50 px-1 rounded">
                ไม่เผยแพร่ ไม่ขาย และไม่ส่งต่อข้อมูลของท่านให้แก่สาธารณชน
                หรือบุคคลที่สามเพื่อวัตถุประสงค์อื่นใดโดยเด็ดขาด
              </strong>
            </p>
          </div>

          {/* ข้อ 1 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 text-base">
                1
              </span>
              ข้อมูลส่วนบุคคลที่บริษัทเก็บรวบรวม
            </h2>
            <div className="pl-11">
              <p className="text-slate-700 mb-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
                บริษัทจะทำการเก็บรวบรวมข้อมูลส่วนบุคคลของท่าน{" "}
                <strong>ต่อเมื่อได้รับความยินยอมจากท่านก่อนเท่านั้น</strong>{" "}
                โดยข้อมูลที่อาจมีการเก็บรวบรวมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล
                (PDPA) ได้แก่:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="bg-white/40 p-4 rounded-xl border border-white/50 shadow-sm hover:bg-white/60 transition-colors">
                  <strong className="block text-slate-800 mb-1">
                    ข้อมูลระบุตัวตน (Identification Data):
                  </strong>
                  <span className="text-sm text-slate-600">
                    ชื่อ-นามสกุล, ชื่อเล่น, เลขประจำตัวประชาชน,
                    เลขหนังสือเดินทาง (Passport), เลขใบอนุญาตขับขี่,
                    เลขประจำตัวผู้เสียภาษี
                  </span>
                </li>
                <li className="bg-white/40 p-4 rounded-xl border border-white/50 shadow-sm hover:bg-white/60 transition-colors">
                  <strong className="block text-slate-800 mb-1">
                    ข้อมูลติดต่อ (Contact Data):
                  </strong>
                  <span className="text-sm text-slate-600">
                    ที่อยู่, อีเมล, เบอร์โทรศัพท์, ไลน์ไอดี (Line ID)
                  </span>
                </li>
                <li className="bg-white/40 p-4 rounded-xl border border-white/50 shadow-sm hover:bg-white/60 transition-colors">
                  <strong className="block text-slate-800 mb-1">
                    ข้อมูลเชื่อมโยงและอื่นๆ:
                  </strong>
                  <span className="text-sm text-slate-600">
                    วันเกิด, สถานที่เกิด, สัญชาติ, ข้อมูลการศึกษา,
                    ข้อมูลทางการเงิน, ข้อมูลการทำงาน, ข้อมูลทรัพย์สิน (เช่น
                    ทะเบียนรถ, โฉนดที่ดิน) และข้อมูลโครงการก่อสร้าง
                  </span>
                </li>
                <li className="bg-white/40 p-4 rounded-xl border border-white/50 shadow-sm hover:bg-white/60 transition-colors">
                  <strong className="block text-slate-800 mb-1">
                    ข้อมูลทางเทคนิค/ออนไลน์:
                  </strong>
                  <span className="text-sm text-slate-600">
                    IP Address, Cookie ID, Log file, ประเภทเบราว์เซอร์
                    และข้อมูลการใช้งานเว็บไซต์
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* ข้อ 2 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 text-base">
                2
              </span>
              วัตถุประสงค์ในการประมวลผลข้อมูล
            </h2>
            <div className="pl-11 text-slate-600">
              <p className="mb-3">
                บริษัทเก็บและใช้ข้อมูลของท่านเพื่อการดำเนินงานภายในบริษัทเท่านั้น
                ดังนี้:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  เพื่อประเมินราคา จัดทำใบเสนอราคา นัดหมายสำรวจพื้นที่
                  และเข้าทำสัญญาก่อสร้าง
                </li>
                <li>เพื่อติดต่อประสานงาน และแจ้งความคืบหน้าของโครงการ</li>
                <li>เพื่อจัดทำบัญชี ภาษี และปฏิบัติตามกฎหมายที่เกี่ยวข้อง</li>
              </ul>
            </div>
          </div>

          {/* ข้อ 3 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 text-base">
                3
              </span>
              การควบคุมการเข้าถึงข้อมูลภายใน
            </h2>
            <p className="pl-11 text-slate-600">
              เนื่องจากข้อมูลของท่านเป็นความลับทางบริษัท
              การเข้าถึงข้อมูลจะถูกจำกัดสิทธิ์เฉพาะผู้บริหารและพนักงานที่มีหน้าที่เกี่ยวข้องกับโครงการของท่านเท่านั้น
              ในกรณีที่มีความจำเป็นต้องดำเนินงานร่วมกับผู้รับเหมาช่วง
              (Sub-contractors) หรือวิศวกรภายนอก บุคคลดังกล่าวจะต้องอยู่ภายใต้{" "}
              <strong className="text-slate-800">
                สัญญารักษาความลับ (Non-Disclosure Agreement - NDA)
              </strong>{" "}
              ที่เข้มงวดอย่างเคร่งครัด
            </p>
          </div>

          {/* ข้อ 4 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 text-base">
                4
              </span>
              ระยะเวลาและการรักษาความปลอดภัยของข้อมูล
            </h2>
            <p className="pl-11 text-slate-600">
              บริษัทมีมาตรการรักษาความมั่นคงปลอดภัยของข้อมูลส่วนบุคคลอย่างเข้มงวด
              โดยจะจัดเก็บข้อมูลของท่านไว้ตลอดระยะเวลาที่มีการติดต่อทางธุรกิจร่วมกัน
              และจะจัดเก็บต่อเนื่องไปอีก 10 ปี
              เพื่อให้สอดคล้องกับเงื่อนไขการรับประกันโครงสร้างตามกฎหมาย ทั้งนี้
              บริษัทมีระบบป้องกันการเข้าถึง ดัดแปลง แก้ไข
              หรือนำข้อมูลไปเผยแพร่โดยไม่ได้รับอนุญาต
            </p>
          </div>

          {/* ข้อ 5 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 text-base">
                5
              </span>
              สิทธิของเจ้าของข้อมูลส่วนบุคคล
            </h2>
            <p className="pl-11 text-slate-600">
              ในฐานะเจ้าของข้อมูลส่วนบุคคล ท่านมีสิทธิในการขอเข้าถึง ขอรับสำเนา
              หรือขอแก้ไขข้อมูลส่วนบุคคลของท่านให้ถูกต้องและเป็นปัจจุบัน ทั้งนี้
              การใช้สิทธิดังกล่าวให้เป็นไปตามเงื่อนไขและนโยบายที่บริษัทกำหนด
            </p>
          </div>

          {/* 🌟 เพิ่มข้อ 6 เรื่องการสงวนสิทธิ์เปลี่ยนแปลงนโยบาย */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 text-base">
                6
              </span>
              การเปลี่ยนแปลงนโยบาย
            </h2>
            <p className="pl-11 text-slate-600">
              บริษัทขอสงวนสิทธิ์ในการแก้ไข ปรับปรุง
              หรือเปลี่ยนแปลงรายละเอียดในนโยบายคุ้มครองข้อมูลส่วนบุคคลฉบับนี้ได้ตลอดเวลาตามความเหมาะสม{" "}
              <strong>โดยไม่จำเป็นต้องแจ้งให้ทราบล่วงหน้า</strong> ทั้งนี้
              การเปลี่ยนแปลงใดๆ
              จะมีผลบังคับใช้ทันทีเมื่อมีการประกาศหรือเผยแพร่บนหน้าเว็บไซต์
            </p>
          </div>

          {/* ข้อ 7 (เดิมคือข้อ 6) ข้อมูลติดต่อ */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 text-base">
                7
              </span>
              ข้อมูลติดต่อ
            </h2>
            <div className="pl-11">
              <div className="bg-white/30 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
                <p className="font-bold text-slate-800 text-lg mb-2">
                  บริษัท OBNITHI CONSTRUCTION CO., LTD.
                </p>
                <div className="space-y-2 text-slate-600">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 w-16">
                      อีเมล:
                    </span>
                    <a
                      href="mailto:info@obnithi.co.th"
                      className="hover:text-blue-600 transition-colors"
                    >
                      info@obnithi.co.th
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 w-16">
                      โทรศัพท์:
                    </span>
                    <a
                      href="tel:0616366225"
                      className="hover:text-blue-600 transition-colors"
                    >
                      061-636-6225 (คุณโอห์ม) , 099-8875-076 (คุณโอบ)
                    </a>
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-300/30">
                  <p className="text-xs font-medium text-slate-500">
                    นโยบายปรับปรุงล่าสุดเมื่อ: 14 กุมภาพันธ์ 2569
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

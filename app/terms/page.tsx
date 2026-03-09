import React from "react";

export default function TermsPage() {
  return (
    // Wrapper หลักที่ควบคุมพื้นหลังแบบ Liquid
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center py-16 px-4 sm:px-6">
      {/* --- Liquid Background Blobs --- */}
      {/* วงกลมสีเบลอๆ ด้านหลัง ปรับโทนสีให้เป็นธีมส้ม/ฟ้า/ชมพู ให้ดูมีความแตกต่างแต่ยังกลมกลืนกับเซ็ตเดียวกัน */}
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-orange-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      <div className="absolute top-[40%] right-[-10%] w-[450px] h-[450px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-rose-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>

      {/* --- Glass Container --- */}
      {/* กล่องหลักแบบกระจก (Glassmorphism) */}
      <main className="relative max-w-4xl w-full mx-auto p-8 sm:p-12 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-slate-800 border-b border-slate-400/20 pb-6">
          เงื่อนไขและข้อกำหนดการใช้บริการ (Terms of Service)
        </h1>

        <section className="space-y-10 text-slate-700 leading-relaxed">
          {/* แถบอัปเดตล่าสุด */}
          <div className="bg-white/30 p-5 rounded-2xl border border-white/40 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-slate-700 font-medium">
              ข้อกำหนดการใช้งานเว็บไซต์บริษัท{" "}
              <strong className="text-slate-900">
                OBNITHI CONSTRUCTION CO., LTD.
              </strong>
            </p>
            <span className="bg-white/60 px-4 py-2 rounded-full text-sm font-semibold text-slate-600 border border-white/60 shadow-sm whitespace-nowrap">
              ฉบับปรับปรุงล่าสุด: 14 กุมภาพันธ์ 2569
            </span>
          </div>

          {/* ข้อ 1 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 text-base">
                1
              </span>
              การยอมรับเงื่อนไข
            </h2>
            <p className="pl-11 text-slate-600">
              การที่ท่านเข้าถึง ใช้งาน หรือกรอกข้อมูลผ่านเว็บไซต์ของ{" "}
              <strong className="text-slate-800">
                บริษัท OBNITHI CONSTRUCTION CO., LTD.
              </strong>{" "}
              ("บริษัท") ถือว่าท่านได้อ่าน เข้าใจ
              และตกลงผูกพันตามเงื่อนไขเหล่านี้ทุกประการ
              หากท่านไม่ยอมรับเงื่อนไขข้อใดข้อหนึ่ง
              โปรดงดเว้นการใช้งานเว็บไซต์นี้
            </p>
          </div>

          {/* ข้อ 2 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 text-base">
                2
              </span>
              ขอบเขตการให้บริการและความถูกต้องของข้อมูล
            </h2>
            <div className="pl-11 space-y-4">
              <div className="bg-white/40 p-5 rounded-xl border border-white/50 shadow-sm hover:bg-white/60 transition-colors">
                <p className="text-slate-600">
                  เว็บไซต์นี้จัดทำขึ้นเพื่อให้ข้อมูลบริการ นำเสนอผลงาน
                  และรับเรื่องประสานงานประเมินราคาก่อสร้างเบื้องต้น
                </p>
              </div>
              <div className="bg-indigo-50/50 backdrop-blur-sm p-5 rounded-xl border border-indigo-100 shadow-sm hover:bg-indigo-50/80 transition-colors">
                <strong className="block text-indigo-900 mb-2">
                  ข้อสงวนสิทธิ์เรื่องข้อมูล:
                </strong>
                <p className="text-slate-700 text-sm leading-relaxed">
                  รูปภาพ แบบแปลน ราคาประเมิน
                  และโปรโมชั่นที่ปรากฏบนเว็บไซต์เป็นเพียงข้อมูลเบื้องต้นเพื่อประกอบการตัดสินใจ
                  บริษัทขอสงวนสิทธิ์ในการแก้ไขหรือเปลี่ยนแปลงโดยอาจแจ้งให้ทราบตามความเหมาะสมผ่านช่องทางของบริษัท
                  สัญญาที่ผูกพันตามกฎหมายจะเกิดขึ้นต่อเมื่อมีการลงนามใน
                  "สัญญารับเหมาก่อสร้าง" ฉบับจริงเท่านั้น
                </p>
              </div>
            </div>
          </div>

          {/* ข้อ 3 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 text-base">
                3
              </span>
              ข้อห้ามในการใช้งาน (Acceptable Use)
            </h2>
            <p className="pl-11 text-slate-600 mb-4">
              ผู้ใช้งานตกลงที่จะไม่กระทำการดังต่อไปนี้:
            </p>
            <ul className="pl-11 grid grid-cols-1 gap-3">
              <li className="flex items-start gap-3 bg-white/40 p-4 rounded-xl border border-white/50 shadow-sm">
                <span className="text-rose-400 mt-0.5">✖</span>
                <span className="text-slate-600">
                  ให้ข้อมูลที่เป็นเท็จ หรือแอบอ้างเป็นบุคคลอื่น
                </span>
              </li>
              <li className="flex items-start gap-3 bg-white/40 p-4 rounded-xl border border-white/50 shadow-sm">
                <span className="text-rose-400 mt-0.5">✖</span>
                <span className="text-slate-600">
                  กระทำการใดๆ ที่อาจก่อให้เกิดความเสียหายต่อระบบคอมพิวเตอร์
                  เซิร์ฟเวอร์ หรือเครือข่ายของบริษัท (เช่น การแทรกแซงระบบ,
                  การส่งไวรัส)
                </span>
              </li>
              <li className="flex items-start gap-3 bg-white/40 p-4 rounded-xl border border-white/50 shadow-sm">
                <span className="text-rose-400 mt-0.5">✖</span>
                <span className="text-slate-600">
                  คัดลอก ดัดแปลง หรือทำซ้ำเนื้อหา ทรัพย์สินทางปัญญา
                  หรือแบบแปลนของบริษัทเพื่อประโยชน์ทางการค้าโดยไม่ได้รับอนุญาต
                </span>
              </li>
            </ul>
          </div>

          {/* ข้อ 4 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 text-base">
                4
              </span>
              ทรัพย์สินทางปัญญา (Intellectual Property)
            </h2>
            <p className="pl-11 text-slate-600">
              ข้อความ รูปภาพ กราฟิก โลโก้ ซอฟต์แวร์
              และเนื้อหาทั้งหมดบนเว็บไซต์นี้ เป็นทรัพย์สินทางปัญญาของบริษัท
              และได้รับความคุ้มครองตามกฎหมายทรัพย์สินทางปัญญาของประเทศไทย
            </p>
          </div>

          {/* ข้อ 5 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 text-base">
                5
              </span>
              การจำกัดความรับผิด (Limitation of Liability)
            </h2>
            <p className="pl-11 text-slate-600">
              บริษัทให้บริการเว็บไซต์นี้ตาม "สภาพที่เป็นอยู่" (As-Is)
              บริษัทจะไม่รับผิดชอบต่อความเสียหายใดๆ (รวมถึงแต่ไม่จำกัดเพียง
              การสูญเสียรายได้ กำไร หรือข้อมูล) ที่เกิดขึ้นจากการใช้งานเว็บไซต์
              การไม่สามารถเข้าใช้งานเว็บไซต์ได้ หรือความคลาดเคลื่อนของข้อมูล
              เว้นแต่เป็นกรณีที่เกิดจากความจงใจหรือประมาทเลินเล่ออย่างร้ายแรงของบริษัท
            </p>
          </div>

          {/* ข้อ 6 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 text-base">
                6
              </span>
              การชดใช้ค่าเสียหาย (Indemnification)
            </h2>
            <p className="pl-11 text-slate-600">
              ท่านตกลงที่จะปกป้องและชดใช้ค่าเสียหายให้แก่บริษัท
              หากบริษัทถูกเรียกร้อง ฟ้องร้อง หรือเกิดความเสียหายใดๆ
              อันเป็นผลมาจากการที่ท่านละเมิดเงื่อนไขการใช้งานฉบับนี้
              หรือละเมิดกฎหมาย
            </p>
          </div>

          {/* ข้อ 7 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 text-base">
                7
              </span>
              เหตุสุดวิสัย (Force Majeure)
            </h2>
            <p className="pl-11 text-slate-600">
              บริษัทได้รับการยกเว้นความรับผิด
              หากการล่าช้าหรือการไม่สามารถให้บริการได้เกิดจากเหตุสุดวิสัย เช่น
              ภัยธรรมชาติ สงคราม การนัดหยุดงาน
              ปัญหาโครงสร้างพื้นฐานทางอินเทอร์เน็ต
              หรือเหตุอื่นใดที่อยู่นอกเหนือการควบคุม
            </p>
          </div>

          {/* ข้อ 8 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-600 text-base">
                8
              </span>
              กฎหมายที่ใช้บังคับและข้อแยกส่วน
            </h2>
            <p className="pl-11 text-slate-600">
              เงื่อนไขฉบับนี้อยู่ภายใต้การบังคับและตีความตามกฎหมายแห่งราชอาณาจักรไทย
              หากข้อความใดในเงื่อนไขนี้ตกเป็นโมฆะหรือไม่สามารถบังคับใช้ได้
              ให้ถือว่าข้อความนั้นแยกออกจากเงื่อนไขส่วนที่เหลือ
              และไม่กระทบต่อความสมบูรณ์ของเงื่อนไขข้ออื่นๆ
            </p>
          </div>

          {/* 🌟 ข้อ 9 (เพิ่มใหม่) - การคุ้มครองข้อมูลส่วนบุคคล */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 text-base">
                9
              </span>
              การคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy)
            </h2>
            <p className="pl-11 text-slate-600">
              บริษัทให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน
              การเก็บรวบรวม ใช้ ประมวลผล
              และเปิดเผยข้อมูลส่วนบุคคลที่เกิดจากการใช้งานเว็บไซต์ จะเป็นไปตาม{" "}
              <strong>
                พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
              </strong>{" "}
              ท่านสามารถศึกษารายละเอียดเพิ่มเติมได้ที่หน้า{" "}
              <a
                href="/privacy"
                className="text-blue-600 hover:underline font-semibold"
              >
                นโยบายคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy)
              </a>
            </p>
          </div>

          {/* 🌟 ข้อ 10 (เพิ่มใหม่) - การแก้ไขเปลี่ยนแปลงเงื่อนไข */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-pink-500/10 text-pink-600 text-base">
                10
              </span>
              การเปลี่ยนแปลงเงื่อนไขและข้อกำหนด
            </h2>
            <p className="pl-11 text-slate-600">
              บริษัทขอสงวนสิทธิ์ในการแก้ไข ปรับปรุง
              หรือเปลี่ยนแปลงเงื่อนไขและข้อกำหนดเหล่านี้ได้ตลอดเวลาตามความเหมาะสม{" "}
              <strong>โดยไม่จำเป็นต้องแจ้งให้ทราบล่วงหน้า</strong>
              การที่ท่านใช้งานเว็บไซต์ต่อไปหลังจากการเปลี่ยนแปลง
              ถือว่าท่านได้รับทราบและยอมรับเงื่อนไขฉบับใหม่แล้ว
            </p>
          </div>

          {/* 🌟 ข้อ 11 (เพิ่มใหม่) - ช่องทางการติดต่อ */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-slate-500/10 text-slate-600 text-base">
                11
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
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

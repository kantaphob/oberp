"use client";

import { useEffect, useState } from "react";

type Province = {
  id: number;
  nameTh: string;
  nameEn: string | null;
};

type District = {
  id: number;
  provinceId: number;
  nameTh: string;
  nameEn: string | null;
};

type Subdistrict = {
  id: number;
  districtId: number;
  nameTh: string;
  nameEn: string | null;
  zipcode: number | null;
  district?: {
    id: number;
    provinceId: number;
    nameTh: string;
    province: {
      id: number;
      nameTh: string;
    };
  };
};

export default function Postcode() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);

  // Search States
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>("");
  const [zipcode, setZipcode] = useState<string>("");

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingSubdistricts, setIsLoadingSubdistricts] = useState(false);
  const [isSearchingZip, setIsSearchingZip] = useState(false);

  // Table Data State
  const [tableData, setTableData] = useState<Subdistrict[]>([]);

  // โหลดข้อมูลจังหวัดทั้งหมดครั้งแรก
  useEffect(() => {
    setIsLoadingProvinces(true);
    fetch("/api/postcode/provinces")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingProvinces(false));
  }, []);

  // 1. ค้นหาจากจังหวัด -> อำเภอ
  useEffect(() => {
    if (!selectedProvince) {
      if (!isSearchingZip) {
        setDistricts([]);
        setSelectedDistrict("");
      }
      return;
    }
    // ถ้าเรากำลังทำงานจากการ search รหัสไปรษณีย์ที่เซ็ต dropdown กลับ ไม่ต้องเคลียร์อำเภอ
    if (!isSearchingZip) {
      setSelectedDistrict(""); 
      setSelectedSubdistrict("");
      setZipcode("");
    }
    
    setIsLoadingDistricts(true);
    fetch(`/api/postcode/districts?provinceId=${selectedProvince}`)
      .then((res) => res.json())
      .then((data) => setDistricts(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingDistricts(false));
  }, [selectedProvince, isSearchingZip]);

  // 2. ค้นหาจากอำเภอ -> ตำบล
  useEffect(() => {
    if (!selectedDistrict) {
      if (!isSearchingZip) {
        setSubdistricts([]);
        setSelectedSubdistrict("");
      }
      return;
    }

    if (!isSearchingZip) {
      setSelectedSubdistrict("");
      setZipcode("");
    }

    setIsLoadingSubdistricts(true);
    fetch(`/api/postcode/subdistricts?districtId=${selectedDistrict}`)
      .then((res) => res.json())
      .then((data) => {
        setSubdistricts(data);
        if (!isSearchingZip) setTableData(data); // แสดงรายการทั้งหมดของอำเภอลงตาราง
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingSubdistricts(false));
  }, [selectedDistrict, isSearchingZip]);

  // 3. เลือกตำบล -> อัปเดตรหัสไปรษณีย์
  useEffect(() => {
    if (selectedSubdistrict && !isSearchingZip) {
      const sd = subdistricts.find((s) => s.id.toString() === selectedSubdistrict);
      if (sd) {
        setZipcode(sd.zipcode?.toString() || "");
        setTableData([sd]); // แสดงเฉพาะตำบลในตาราง
      }
    }
  }, [selectedSubdistrict, subdistricts, isSearchingZip]);

  // ค้นหาผ่านรหัสไปรษณีย์ (Debounce)
  useEffect(() => {
    if (isSearchingZip && zipcode.length === 5) {
      setIsLoadingSubdistricts(true);
      fetch(`/api/postcode/subdistricts?zipcode=${zipcode}`)
        .then((res) => res.json())
        .then((data: Subdistrict[]) => {
          setTableData(data); // แสดงผลลัพธ์ลงตารางเลย
          
          if (data.length > 0) {
            // Auto fill dropdown from the first match
            const match = data[0];
            if (match.district?.provinceId) {
              setSelectedProvince(match.district.provinceId.toString());
            }
            // Need a slight delay or trigger correctly for cascading, but standard state update 
            setTimeout(() => {
              if (match.districtId) setSelectedDistrict(match.districtId.toString());
              setTimeout(() => {
                setSelectedSubdistrict(match.id.toString());
              }, 100);
            }, 100);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => {
          setIsLoadingSubdistricts(false);
          setIsSearchingZip(false); // จบสถานะการค้นหาด้วย Zip
        });
    }
  }, [zipcode, isSearchingZip]);

  // Handle Zipcode input
  const handleZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").substring(0, 5);
    setZipcode(val);
    
    if (val.length === 5) {
      setIsSearchingZip(true);
    } else {
      setIsSearchingZip(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ข้อมูลพื้นที่ประเทศไทย (Postcode)</h1>
        <p className="text-gray-500">ระบบคัดกรอง จังหวัด อำเภอ ตำบล และค้นหาด่วนด้วยรหัสไปรษณีย์</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        {/* รหัสไปรษณีย์ (ทำเป็นแบบค้นหาได้) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">ค้นหาจากรหัสไปรษณีย์</label>
          <div className="relative">
             <input
              type="text"
              className="w-full bg-blue-50 border border-blue-300 text-blue-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-semibold placeholder-blue-300"
              value={zipcode}
              onChange={handleZipcodeChange}
              placeholder="เช่น 10200"
            />
            {isSearchingZip && (
              <div className="absolute top-3 right-3 flex items-center justify-center">
                 <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
          <select
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            value={selectedProvince}
            onChange={(e) => {
              setIsSearchingZip(false);
              setSelectedProvince(e.target.value);
            }}
            disabled={isLoadingProvinces}
          >
            <option value="">-- เลือกจังหวัด --</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.nameTh}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">อำเภอ/เขต</label>
          <select
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            value={selectedDistrict}
            onChange={(e) => {
              setIsSearchingZip(false);
              setSelectedDistrict(e.target.value);
            }}
            disabled={!selectedProvince || isLoadingDistricts}
          >
            <option value="">-- เลือกอำเภอ --</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.nameTh}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">ตำบล/แขวง</label>
          <select
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            value={selectedSubdistrict}
            onChange={(e) => {
              setIsSearchingZip(false);
              setSelectedSubdistrict(e.target.value);
            }}
            disabled={!selectedDistrict || isLoadingSubdistricts}
          >
            <option value="">-- เลือกตำบล --</option>
            {subdistricts.map((subdistrict) => (
              <option key={subdistrict.id} value={subdistrict.id}>
                {subdistrict.nameTh}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ตารางแสดงผล */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">📋 ตารางผลลัพธ์ ({tableData.length} รายการ)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">รหัสไปรษณีย์</th>
                <th scope="col" className="px-6 py-4 font-semibold">ตำบล / แขวง</th>
                <th scope="col" className="px-6 py-4 font-semibold">อำเภอ / เขต</th>
                <th scope="col" className="px-6 py-4 font-semibold">จังหวัด</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((item) => (
                  <tr key={item.id} className="bg-white border-b hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-blue-600">
                      {item.zipcode || '-'}
                    </td>
                    <td className="px-6 py-4">{item.nameTh}</td>
                    <td className="px-6 py-4">{item.district?.nameTh || districts.find(d => d.id === item.districtId)?.nameTh || 'ไม่ทราบอำเภอ'}</td>
                    <td className="px-6 py-4">
                      {item.district?.province?.nameTh || 
                       provinces.find(p => p.id.toString() === selectedProvince)?.nameTh || 
                       provinces.find(p => p.id === districts.find(d => d.id === item.districtId)?.provinceId)?.nameTh ||
                       'ไม่ทราบจังหวัด'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    ไม่พบข้อมูลพื้นที่ โปรดเลือกหรือค้นหาด้วยรหัสไปรษณีย์
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Shared service definitions used by both UI and API
// Synchronized with app/api/services/route.ts definitions

export enum ServiceType {
  Construction = "SRV-CON",
  Extension = "SRV-EXT",
  Renovation = "SRV-REN",
  Design = "SRV-DES",
  HomeInspection = "SRV-INS",
  Others = "SRV-OTH",
}

export type ServiceConfig = {
  value: ServiceType;
  label: string;
  active: boolean;
};

export const SERVICE_CONFIG: ServiceConfig[] = [
  { value: ServiceType.Construction, label: "รับเหมาก่อสร้าง (Construction)", active: true },
  { value: ServiceType.Extension, label: "ต่อเติม (Extension)", active: true },
  { value: ServiceType.Renovation, label: "รีโนเวท (Renovation)", active: true },
  { value: ServiceType.Design, label: "ออกแบบ (Design)", active: true },
  { value: ServiceType.HomeInspection, label: "ตรวจบ้าน (Home Inspection)", active: true },
  { value: ServiceType.Others, label: "อื่นๆ (Others)", active: true },
];

export const SERVICE_LABEL: Record<ServiceType, string> = SERVICE_CONFIG.reduce(
  (acc, cur) => {
    acc[cur.value] = cur.label;
    return acc;
  },
  {} as Record<ServiceType, string>,
);

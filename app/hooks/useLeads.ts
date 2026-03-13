"use client";

export type WorkflowState = {
  assignEmployee: boolean;
  contactLog: boolean;
  meeting: boolean;
  deposit: boolean;
  converted: boolean;
  createProject: boolean;
  uploadDocuments: boolean;
  paymentTracking: boolean;
  boq: boolean;
  bookingTeam: boolean;
  schedule: boolean;
  materialOrder: boolean;
  costTracking: boolean;
  invoice: boolean;
  receipt: boolean;
  expense: boolean;
  profitReport: boolean;
};

export type LeadActivity = {
  id: string;
  type: "CONTACT_LOG" | "MEETING" | "DEPOSIT" | "SYSTEM";
  content: string;
  createdAt: string;
  meta?: Record<string, unknown> | null;
};

export type LeadRecord = {
  id: number;
  type: "INDIVIDUAL" | "COMPANY";
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  phone: string;
  email: string | null;
  lineId: string | null;
  service: string;
  message: string | null;
  assignedName: string | null;
  assignedRole: string | null;
  status: string;
  convertedCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
  workflow: WorkflowState | null;
  activities: LeadActivity[];
};

export type CreateLeadInput = {
  type: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  phone: string;
  email?: string | null;
  lineId?: string | null;
  service: string;
  message?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  postalCode?: string | null;
};

type PatchLeadInput = {
  status?: string;
  assignedName?: string | null;
  assignedRole?: string | null;
  workflow?: Partial<WorkflowState>;
};

type CreateLogInput = {
  type: "CONTACT_LOG" | "MEETING" | "DEPOSIT" | "SYSTEM";
  content: string;
  meta?: Record<string, unknown> | null;
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export function useLeads() {
  const createLead = async (payload: CreateLeadInput): Promise<LeadRecord> => {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseJson<{ lead: LeadRecord }>(response);
    return data.lead;
  };

  const fetchLeads = async (): Promise<LeadRecord[]> => {
    const response = await fetch("/api/leads", { cache: "no-store" });
    const data = await parseJson<{ leads: LeadRecord[] }>(response);
    return data.leads;
  };

  const updateLead = async (leadId: number, payload: PatchLeadInput): Promise<LeadRecord> => {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseJson<{ lead: LeadRecord }>(response);
    return data.lead;
  };

  const addLog = async (leadId: number, payload: CreateLogInput): Promise<LeadActivity> => {
    const response = await fetch(`/api/leads/${leadId}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseJson<{ activity: LeadActivity }>(response);
    return data.activity;
  };

  const convertLead = async (leadId: number): Promise<LeadRecord> => {
    const response = await fetch(`/api/leads/${leadId}/convert`, {
      method: "POST",
    });
    const data = await parseJson<{ lead: LeadRecord }>(response);
    return data.lead;
  };

  return { createLead, fetchLeads, updateLead, addLog, convertLead };
}

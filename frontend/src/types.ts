export interface LabValue {
  name: string;
  value: number | string;
  unit?: string;
  range: string;
  severity: "Normal" | "Attention Required" | "Critical";
  confidence?: string;
}

export interface ClassDistribution {
  "Normal"?: number;
  "Attention Required"?: number;
  "Critical"?: number;
}

export interface AIResponseData {
  health_score?: number;
  critical_alert?: boolean;
  disease_prediction?: string;
  doctor_name?: string;
  hospital_name?: string;
  symptoms_found?: string;
  lab_values?: LabValue[];
  class_distribution?: ClassDistribution;
}

export interface APIResponse {
  filename?: string;
  raw_text: string;
  markdown: string;
  data: AIResponseData;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: "Fine" | "Attention Required" | "Critical";
  dangerPercentage: number;
  reportData?: APIResponse;
  dateStr: string;
}

export interface ReportRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  report_type: string;
  doctor_name: string;
  symptoms: string;
  original_pdf_url: string;
  simplified_text: string;
  health_score: number;
  status: string;
  created_at: string;
  pinned: boolean;
}

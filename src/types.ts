export enum IKUType {
  IKU1 = 'IKU 1: Lulusan Mendapat Pekerjaan Layak',
}

export enum IKU {
    IKU1 = 'IKU 1: Lulusan Mendapat Pekerjaan Layak',
    CONFIGURATION = 'Konfigurasi',
}

export type IKUSummary = {
    total: number;
    valid: number;
    score: number;
}

export type ToastMessage = {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

export interface AllIKUData {
    iku1Data: GraduateTracerStudy[];
    iku1TotalGraduates: number;
}

export interface PerformanceSnapshot {
  timestamp: string;
  scores: Record<string, number>;
}

export interface ProgramStudy {
    id: string;
    name: string;
    studentCount: number;
}

export interface Faculty {
    id: string;
    name: string;
    programs: ProgramStudy[];
}

// --- IKU 1 Specific Types ---
export enum GraduateStatus {
    BEKERJA = 'Bekerja',
    MELANJUTKAN_STUDI = 'Melanjutkan Studi',
    WIRAUSAHA = 'Wirausaha',
    BELUM_TERLACAK = 'Belum Terlacak',
}

export interface AIGraduateTraceResult {
    foundName?: string;
    status: GraduateStatus;
    details: string; // e.g., "Software Engineer at PT. GoTo" or "M.Sc. in Computer Science at UGM"
    evidence: string; // Justification from AI
    discoveredUrl?: string; // e.g., LinkedIn profile, news article
    verificationStatus: 'Verified' | 'Needs Confirmation' | 'Not Found';
}
export interface GraduateTracerStudy {
    id: string;
    name: string;
    nim: string;
    graduationYear: number;
    status: GraduateStatus;
    waitingMonths: number;
    income?: number;
    workLocationProvince?: string; // Province code e.g., 'JK', 'JB', 'LN'
    companyName?: string; // Or university name if continuing studies
    jobTitle?: string;
    lastTraced: string;
    individualScore: number; // The 'k' value
    evidence?: {
        documentId: string;
        fileName: string;
    };
    salaryValidation?: {
        isAnomalous: boolean;
        justification: string;
    };
    aiVerification?: AIGraduateTraceResult;
}
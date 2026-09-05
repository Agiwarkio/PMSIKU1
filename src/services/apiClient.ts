import { GraduateTracerStudy, Faculty, AIGraduateTraceResult } from '../types';

const API_BASE = 'http://localhost:8080/api';

export const apiClient = {
    // Auth
    async login(username: string, password: string) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Login gagal, periksa username dan password Anda');
        }
        return res.json();
    },

    // Configuration
    async getConfig() {
        const res = await fetch(`${API_BASE}/config`);
        if (!res.ok) throw new Error('Failed to fetch config');
        return res.json();
    },

    async updateConfig(data: { UniversityName: string; TotalGraduates: int; UniversityStructure: string }) {
        const res = await fetch(`${API_BASE}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update config');
        return res.json();
    },

    // Graduates
    async getGraduates(): Promise<GraduateTracerStudy[]> {
        const res = await fetch(`${API_BASE}/graduates`);
        if (!res.ok) throw new Error('Failed to fetch graduates');
        const data = await res.json();
        // map golang models to TS types
        return data.map((g: any) => ({
            id: g.ID,
            name: g.Name,
            nim: g.NIM,
            graduationYear: g.GraduationYear,
            status: g.Status,
            waitingMonths: g.WaitingMonths,
            income: g.Income,
            workLocationProvince: g.WorkLocationProvince,
            companyName: g.CompanyName,
            jobTitle: g.JobTitle,
            lastTraced: g.LastTraced,
            individualScore: g.IndividualScore,
            evidence: g.EvidenceID ? { documentId: g.EvidenceID, fileName: g.EvidenceName } : undefined,
            salaryValidation: g.IsSalaryAnomalous ? { isAnomalous: true, justification: g.SalaryJustification } : undefined,
            aiVerificationStatus: g.AIVerificationStatus
        }));
    },

    async saveGraduate(data: any) {
        const payload = {
            ID: data.id,
            Name: data.name,
            NIM: data.nim,
            GraduationYear: data.graduationYear,
            Status: data.status,
            WaitingMonths: data.waitingMonths,
            Income: data.income,
            WorkLocationProvince: data.workLocationProvince,
            CompanyName: data.companyName,
            JobTitle: data.jobTitle,
            EvidenceID: data.evidence?.documentId || "",
            EvidenceName: data.evidence?.fileName || "",
            IsSalaryAnomalous: data.salaryValidation?.isAnomalous || false,
            SalaryJustification: data.salaryValidation?.justification || "",
            AIVerificationStatus: data.aiVerification?.verificationStatus || ""
        };

        const method = payload.ID ? 'PUT' : 'POST';
        const url = payload.ID ? `${API_BASE}/graduates/${payload.ID}` : `${API_BASE}/graduates`;
        if (!payload.ID) {
            payload.ID = new Date().toISOString(); // generated id
        }

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to save graduate');
        return res.json();
    },

    async deleteGraduate(id: string) {
        const res = await fetch(`${API_BASE}/graduates/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete graduate');
        return res.json();
    },

    // AI
    async traceGraduateAI(nim: string, universityName: string, name: string): Promise<AIGraduateTraceResult> {
        const res = await fetch(`${API_BASE}/ai/trace`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nim, universityName, name }),
        });
        if (!res.ok) {
            const errBody = await res.text();
            console.error("Backend Error Trace:", errBody);
            throw new Error(`Failed to trace graduate: ${errBody}`);
        }
        return res.json();
    },

    async validateSalaryAI(jobTitle: string, income: number, provinceName: string) {
        const res = await fetch(`${API_BASE}/ai/validate-salary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobTitle, income, provinceName }),
        });
        if (!res.ok) {
            const errBody = await res.text();
            console.error("Backend Error Validate:", errBody);
            throw new Error(`Failed to validate salary: ${errBody}`);
        }
        return res.json();
    },

    // Summary
    async getSummary() {
        const res = await fetch(`${API_BASE}/summary`);
        if (!res.ok) throw new Error('Failed to fetch summary');
        return res.json();
    }
};

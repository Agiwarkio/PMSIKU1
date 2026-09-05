import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Briefcase, Users, CheckSquare, BarChart2, PlusCircle, Search, BrainCircuit, Loader2, Edit, Trash2, X, Save, AlertTriangle, Link as LinkIcon, Bot, Paperclip, UploadCloud, File, FolderOpen } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { GraduateTracerStudy, GraduateStatus, AIGraduateTraceResult } from '../types';
import { useToast } from '../hooks/useToast';
import { apiClient } from '../services/apiClient';
import CustomDropdown from './CustomDropdown';
import { provinceOptions } from '../services/umpService';

// --- Reusable Components ---

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; subValue?: string; color: string }> = ({ icon, label, value, subValue, color }) => (
    <div className={`flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md border-b-4 ${color}`}>
        <div className="p-3 rounded-full mr-4 bg-slate-100 dark:bg-slate-700">{icon}</div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            {subValue && <p className="text-xs text-slate-500 dark:text-slate-400">{subValue}</p>}
        </div>
    </div>
);

const GraduateStatusBadge: React.FC<{ status: GraduateStatus }> = ({ status }) => {
    const styles = {
        [GraduateStatus.BEKERJA]: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
        [GraduateStatus.MELANJUTKAN_STUDI]: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
        [GraduateStatus.WIRAUSAHA]: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300',
        [GraduateStatus.BELUM_TERLACAK]: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

type GraduateFormData = Omit<GraduateTracerStudy, 'id' | 'lastTraced' | 'aiVerification' | 'evidence' | 'individualScore' | 'salaryValidation'>;

interface SavePayload {
    formData: GraduateFormData;
    evidence?: GraduateTracerStudy['evidence'];
    salaryValidation?: GraduateTracerStudy['salaryValidation'];
    aiVerification?: AIGraduateTraceResult;
}


// --- Main Dashboard Component ---

const IKU1Dashboard: React.FC = () => {
    const { allData, summary, refreshData } = useAppContext();
    const graduates = allData?.iku1Data || [];
    const totalGraduates = allData?.iku1TotalGraduates || 0;
    const addToast = useToast();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<GraduateStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGraduate, setEditingGraduate] = useState<GraduateTracerStudy | null>(null);

    const filteredGraduates = useMemo(() => {
        return graduates
            .filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.nim.includes(searchTerm))
            .filter(g => statusFilter === 'all' || g.status === statusFilter)
            .sort((a,b) => new Date(b.lastTraced).getTime() - new Date(a.lastTraced).getTime());
    }, [graduates, searchTerm, statusFilter]);
    
    const handleAdd = () => {
        setEditingGraduate(null);
        setIsModalOpen(true);
    };

    const handleEdit = (graduate: GraduateTracerStudy) => {
        setEditingGraduate(graduate);
        setIsModalOpen(true);
    }
    
    const handleDelete = async (id: string) => {
        if(window.confirm("Yakin ingin menghapus data lulusan ini?")) {
            try {
                await apiClient.deleteGraduate(id);
                refreshData();
                addToast({title: "Data Dihapus", message: "Data lulusan berhasil dihapus.", type: 'info'});
            } catch (e) {
                addToast({title: "Error", message: "Gagal menghapus data.", type: 'error'});
            }
        }
    }
    
    const handleSave = async ({ formData, evidence, aiVerification, salaryValidation }: SavePayload) => {
        const payload = {
            id: editingGraduate?.id,
            ...formData,
            evidence,
            salaryValidation,
            aiVerification
        };

        try {
            await apiClient.saveGraduate(payload);
            refreshData();
            addToast({ title: 'Data Tersimpan', message: `Data untuk ${formData.name} berhasil disimpan.`, type: 'success' });
            setIsModalOpen(false);
        } catch (e) {
            addToast({ title: 'Error', message: `Gagal menyimpan data.`, type: 'error' });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
             <header>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <Briefcase className="w-8 h-8 mr-3 text-blue-600"/>
                    IKU 1: Lulusan Mendapat Pekerjaan Layak
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Mengelola dan melacak status lulusan untuk pemenuhan IKU 1 sesuai Kepmendikbudristek No. 210/M/2023.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard icon={<Users className="w-6 h-6 text-slate-500"/>} label="Tingkat Respons" value={`${summary?.totalRespondents || 0} / ${summary?.minSlovin || 0}`} subValue={summary?.responseRateOk ? 'Memenuhi Syarat Minimum' : 'Belum Memenuhi Syarat'} color={summary?.responseRateOk ? "border-green-400" : "border-red-400"}/>
                 <StatCard icon={<CheckSquare className="w-6 h-6 text-green-500"/>} label="Lulusan Terlacak" value={summary?.validRespondents || 0} color="border-green-400"/>
                 <StatCard icon={<BarChart2 className="w-6 h-6 text-blue-500"/>} label="Total Lulusan (N)" value={totalGraduates} subValue="Populasi Kohort" color="border-blue-400"/>
                 <StatCard icon={<BarChart2 className="w-6 h-6 text-indigo-500"/>} label="Skor Indeks IKU 1" value={(summary?.score || 0).toFixed(2)} color="border-indigo-400"/>
            </div>
            
             {summary && !summary.responseRateOk && (
                 <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-yellow-400" /></div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold dark:text-yellow-200">Peringatan: Skor IKU 1 Dihitung 0</p>
                            <p className="mt-1 text-sm">Jumlah responden ({summary.totalRespondents}) belum mencapai batas minimum ({summary.minSlovin}) yang dihitung dengan Rumus Slovin. Tambahkan lebih banyak data untuk mendapatkan skor.</p>
                        </div>
                    </div>
                </div>
             )}

            <InlineAITracer onSave={handleSave} />
            
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/80">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Database Lulusan (Tracer Study)</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handleAdd} className="flex items-center py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Tambah Manual
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Cari nama atau NIM..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm"/>
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm">
                        <option value="all">Semua Status</option>
                        {Object.values(GraduateStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama / NIM</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Detail</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Masa Tunggu</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Skor (k)</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredGraduates.length > 0 ? filteredGraduates.map(g => (
                                <tr key={g.id}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center">
                                            {g.name}
                                            {g.evidence && <Paperclip className="w-4 h-4 ml-2 text-slate-400" title={`Bukti: ${g.evidence.fileName}`} />}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">{g.nim}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap"><GraduateStatusBadge status={g.status} /></td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <div className="text-slate-800 dark:text-slate-200">{g.companyName}{g.jobTitle && ` - ${g.jobTitle}`}</div>
                                        <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center">
                                          {g.income ? `Rp ${g.income.toLocaleString('id-ID')}` : ''}
                                          {g.salaryValidation?.isAnomalous && (
                                              <AlertTriangle className="w-3.5 h-3.5 ml-2 text-yellow-500" title={g.salaryValidation.justification} />
                                          )}
                                          {g.income && g.workLocationProvince ? ' - ' : ''}{g.workLocationProvince ? provinceOptions.find(p=>p.value === g.workLocationProvince)?.label : ''}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-slate-600 dark:text-slate-300">{g.waitingMonths} bln</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600 dark:text-blue-400">{g.individualScore.toFixed(2)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button onClick={() => handleEdit(g)} className="p-1.5 text-slate-500 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete(g.id)} className="p-1.5 text-slate-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">Tidak ada data lulusan yang cocok.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
            {isModalOpen && <GraduateFormModal onClose={() => setIsModalOpen(false)} onSave={handleSave} graduate={editingGraduate} />}
        </div>
    )
}

// --- Modals & Components ---

const InlineAITracer: React.FC<{ onSave: (payload: SavePayload) => void; }> = ({ onSave }) => {
    const [nim, setNim] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AIGraduateTraceResult | null>(null);
    const addToast = useToast();
    const { universityName } = useAppContext();

    const handleTrace = async () => {
        if (!nim) return;
        setIsLoading(true);
        setResult(null);
        try {
            const traceResult = await apiClient.traceGraduateAI(nim, universityName, name);
            if (traceResult) {
                setResult(traceResult);
            } else {
                addToast({title: "Pelacakan Gagal", message: "AI tidak dapat menemukan informasi.", type: 'error'});
            }
        } catch (e: any) {
             addToast({title: "Terjadi Kesalahan", message: e.message || "Gagal menjalankan pelacakan AI.", type: 'error'});
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmAndSave = () => {
        if (!result) return;
        const formData: GraduateFormData = {
            name: result.foundName || name || `Mahasiswa NIM ${nim}`,
            nim,
            graduationYear: new Date().getFullYear() - 1, // default
            status: (result.status as GraduateStatus) || GraduateStatus.BEKERJA,
            waitingMonths: 6, // Default
            income: 0, // AI doesn't reliably get income yet
            companyName: result.details || '',
            jobTitle: '',
            workLocationProvince: 'JB', // Default
        };
        onSave({formData, aiVerification: result});
        setNim('');
        setName('');
        setResult(null);
    }
    
    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <BrainCircuit className="w-5 h-5 mr-2 text-blue-500"/>
                    Pelacakan Data Lulusan & Karir Alumni
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    🏛️ Khusus: Universitas Hamzanwadi (PDDikti Kemdiktisaintek)
                </span>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="NIM Mahasiswa (Universitas Hamzanwadi)" id="ai_nim" value={nim} onChange={e => setNim(e.target.value)} placeholder="Contoh: 1602020031 atau 160101031"/>
                    <InputField label="Nama Mahasiswa (Opsional / Terverifikasi Otomatis)" id="ai_name" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: AGI WARKIO"/>
                </div>
                <button onClick={handleTrace} disabled={isLoading || !nim} className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tarik Data PDDikti & Analisis Karir IKU 1'}
                </button>
                {result && (
                     <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3 border border-slate-200 dark:border-slate-700 animate-fade-in">
                         <h3 className="font-semibold flex items-center text-base text-slate-800 dark:text-slate-100">
                             <Bot className="w-5 h-5 mr-2 text-blue-500" /> Hasil Pelacakan AI Gemini
                         </h3>
                        <div className="space-y-2 text-sm pt-2">
                            {result.foundName && (
                                <p><span className="font-medium text-slate-600 dark:text-slate-300">Nama Entitas Terdeteksi:</span> <span className="font-bold text-slate-900 dark:text-slate-100">{result.foundName}</span></p>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-600 dark:text-slate-300">Status Terdeteksi:</span>
                                <GraduateStatusBadge status={result.status as GraduateStatus} />
                            </div>
                            <div>
                                <div className="font-medium text-slate-600 dark:text-slate-300 mb-1">Detail Riwayat:</div> 
                                <div className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">{result.details}</div>
                            </div>
                            <div>
                                <div className="font-medium text-slate-600 dark:text-slate-300 mb-1">Bukti Validasi:</div> 
                                <div className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">{result.evidence}</div>
                            </div>
                            {result.discoveredUrl && (
                                <a href={result.discoveredUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:underline">
                                    <LinkIcon size={14}/> 
                                    <span className="truncate">{result.discoveredUrl}</span>
                                </a>
                            )}
                            <p><span className="font-medium text-slate-600 dark:text-slate-300">Status Verifikasi AI:</span> <span className="font-semibold text-slate-800 dark:text-slate-100">{result.verificationStatus}</span></p>
                        </div>
                        <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-600">
                            <button onClick={handleConfirmAndSave} className="w-full py-2 px-4 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md">Konfirmasi & Simpan Hasil</button>
                        </div>
                     </div>
                 )}
            </div>
        </div>
    );
};


const GraduateFormModal: React.FC<{onClose: () => void; onSave: (payload: SavePayload) => void; graduate: GraduateTracerStudy | null}> = ({onClose, onSave, graduate}) => {
     const [formData, setFormData] = useState<GraduateFormData>({
        name: graduate?.name || '',
        nim: graduate?.nim || '',
        graduationYear: graduate?.graduationYear || new Date().getFullYear() - 1,
        status: graduate?.status || GraduateStatus.BELUM_TERLACAK,
        waitingMonths: graduate?.waitingMonths || 0,
        income: graduate?.income || 0,
        workLocationProvince: graduate?.workLocationProvince || 'JB',
        companyName: graduate?.companyName || '',
        jobTitle: graduate?.jobTitle || '',
    });
    const [evidence, setEvidence] = useState<GraduateTracerStudy['evidence'] | undefined>(graduate?.evidence);
    const [salaryValidation, setSalaryValidation] = useState<{isChecking: boolean; result: GraduateTracerStudy['salaryValidation']}>({ isChecking: false, result: graduate?.salaryValidation });
    const addToast = useToast();
    const salaryCheckTimeout = useRef<number | null>(null);
    
    const isWorkOrWirausaha = formData.status === GraduateStatus.BEKERJA || formData.status === GraduateStatus.WIRAUSAHA;

    const handleSalaryCheck = useCallback(() => {
        if (salaryCheckTimeout.current) clearTimeout(salaryCheckTimeout.current);
        
        if (isWorkOrWirausaha && formData.jobTitle && (formData.income || 0) > 100000) {
            salaryCheckTimeout.current = window.setTimeout(async () => {
                setSalaryValidation({ isChecking: true, result: undefined });
                const provinceName = provinceOptions.find(p => p.value === formData.workLocationProvince)?.label || 'Jawa Barat';
                
                try {
                    const result = await apiClient.validateSalaryAI(formData.jobTitle!, formData.income!, provinceName);
                    if (result) {
                        setSalaryValidation({ isChecking: false, result });
                    }
                } catch(e) {
                     setSalaryValidation({ isChecking: false, result: undefined });
                }
            }, 1000); // Debounce for 1 second
        }
    }, [formData.jobTitle, formData.income, formData.workLocationProvince, isWorkOrWirausaha]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ formData, evidence, salaryValidation: salaryValidation.result });
    };
    
    return (
        <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" style={{animationDuration: '150ms'}}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg">
                <header className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{graduate ? 'Edit Data Lulusan' : 'Tambah Data Lulusan'}</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X className="w-5 h-5" /></button>
                </header>
                <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Nama Lengkap" id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <InputField label="NIM" id="nim" value={formData.nim} onChange={e => setFormData({...formData, nim: e.target.value})} required />
                    </div>
                     <InputField label="Tahun Lulus" id="gradYear" type="number" value={formData.graduationYear} onChange={e => setFormData({...formData, graduationYear: parseInt(e.target.value)})} />
                     <CustomDropdown id="status" options={Object.values(GraduateStatus).map(s => ({value: s, label: s}))} value={formData.status} onChange={val => setFormData({...formData, status: val as GraduateStatus})} />
                     <InputField label="Masa Tunggu (Bulan)" id="waitingMonths" type="number" min="0" max="12" value={formData.waitingMonths} onChange={e => setFormData({...formData, waitingMonths: parseInt(e.target.value)})} />

                     {isWorkOrWirausaha && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-4 border border-slate-200 dark:border-slate-700">
                            <InputField label={formData.status === GraduateStatus.BEKERJA ? "Nama Perusahaan" : "Nama Usaha"} id="companyName" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                            <InputField label="Jabatan Pekerjaan" id="jobTitle" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} onBlur={handleSalaryCheck} />
                            <div>
                                <InputField label="Penghasilan per Bulan (Bruto)" id="income" type="number" min="0" value={formData.income} onChange={e => setFormData({...formData, income: parseInt(e.target.value)})} onBlur={handleSalaryCheck}/>
                                {salaryValidation.isChecking && <div className="text-xs text-slate-500 mt-1 flex items-center"><Loader2 className="w-3 h-3 mr-1.5 animate-spin"/>AI sedang memvalidasi gaji...</div>}
                                {salaryValidation.result?.isAnomalous && (
                                    <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 flex items-start">
                                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 mt-0.5"/>
                                        <span>{salaryValidation.result.justification}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Lokasi Kerja</label>
                                <CustomDropdown id="workLocation" options={provinceOptions} value={formData.workLocationProvince || 'JB'} onChange={val => setFormData({...formData, workLocationProvince: val})} />
                            </div>
                        </div>
                     )}
                     {formData.status === GraduateStatus.MELANJUTKAN_STUDI && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-4 border border-slate-200 dark:border-slate-700">
                             <InputField label="Nama Perguruan Tinggi Tujuan" id="companyName" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                        </div>
                     )}
                </main>
                 <footer className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-xl border-t border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium">Batal</button>
                    <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4 mr-2 inline"/> Simpan</button>
                </footer>
            </form>
        </div>
        </>
    );
}

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, id, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
        <input id={id} {...props} className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
    </div>
);

export default IKU1Dashboard;
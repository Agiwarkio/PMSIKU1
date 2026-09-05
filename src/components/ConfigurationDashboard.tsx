import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import CustomNumberInput from './CustomNumberInput';
import { Faculty, ProgramStudy } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { apiClient } from '../services/apiClient';

const ConfigItem: React.FC<{
    label: string;
    description: string;
    value: number;
    onSave: (label: string, value: number) => void;
}> = ({ label, description, value: initialValue, onSave }) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => { setValue(initialValue); }, [initialValue]);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{label}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">{description}</p>
            </div>
            <div className="flex-shrink-0 pt-2 sm:pt-0">
                <CustomNumberInput
                    value={value}
                    onChange={setValue}
                    onSave={(valueToSave) => onSave(label, valueToSave)}
                />
            </div>
        </div>
    );
}

const ConfigurationDashboard: React.FC = () => {
    const { refreshData, universityName: contextUName, faculties: contextFaculties, allData } = useAppContext();
    const addToast = useToast();
    
    const [universityName, setUniversityName] = useState(contextUName);
    const [faculties, setFaculties] = useState<Faculty[]>(contextFaculties);
    const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
    const [facultyName, setFacultyName] = useState('');
    const [editingProgram, setEditingProgram] = useState<{ facultyId: string, program: ProgramStudy | null } | null>(null);
    const [programName, setProgramName] = useState('');
    const [studentCount, setStudentCount] = useState(0);

    useEffect(() => { setUniversityName(contextUName); }, [contextUName]);
    useEffect(() => { setFaculties(contextFaculties); }, [contextFaculties]);

    const handleSaveConfig = async (label: string, value: number) => {
        try {
            await apiClient.updateConfig({
                UniversityName: universityName,
                TotalGraduates: value,
                UniversityStructure: JSON.stringify(faculties)
            });
            refreshData();
            addToast({ title: label, message: 'berhasil disimpan!', type: 'success' });
        } catch (e) {
            addToast({ title: 'Error', message: 'Gagal menyimpan', type: 'error' });
        }
    };

    const handleSaveUniversityName = async () => {
        try {
            await apiClient.updateConfig({
                UniversityName: universityName,
                TotalGraduates: allData?.iku1TotalGraduates || 0,
                UniversityStructure: JSON.stringify(faculties)
            });
            refreshData();
            addToast({ title: 'Nama Institusi', message: 'berhasil disimpan!', type: 'success' });
        } catch (e) {
            addToast({ title: 'Error', message: 'Gagal menyimpan', type: 'error' });
        }
    };

    const updateAndRefreshFaculties = async (newFaculties: Faculty[]) => {
        setFaculties(newFaculties);
        try {
            await apiClient.updateConfig({
                UniversityName: universityName,
                TotalGraduates: allData?.iku1TotalGraduates || 0,
                UniversityStructure: JSON.stringify(newFaculties)
            });
            refreshData();
        } catch (e) {
            addToast({ title: 'Error', message: 'Gagal menyimpan struktur', type: 'error' });
        }
    };

    const handleSaveFaculty = () => {
        if (!facultyName.trim()) return;
        let newFaculties;
        if (editingFacultyId) {
            newFaculties = faculties.map(f => f.id === editingFacultyId ? { ...f, name: facultyName } : f);
            addToast({ title: 'Fakultas', message: 'Nama fakultas berhasil diperbarui.', type: 'success' });
        } else {
            newFaculties = [...faculties, { id: Date.now().toString(), name: facultyName, programs: [] }];
            addToast({ title: 'Fakultas', message: 'Fakultas baru berhasil ditambahkan.', type: 'success' });
        }
        updateAndRefreshFaculties(newFaculties);
        setEditingFacultyId(null);
        setFacultyName('');
    };

    const handleDeleteFaculty = (id: string) => {
        if (window.confirm("Yakin ingin menghapus fakultas ini beserta semua program studinya?")) {
            updateAndRefreshFaculties(faculties.filter(f => f.id !== id));
        }
    };
    
    const handleSaveProgram = () => {
        if (!programName.trim() || !editingProgram) return;
        const { facultyId, program } = editingProgram;
        
        const newFaculties = faculties.map(f => {
            if (f.id === facultyId) {
                if (program) { // Editing
                    const updatedPrograms = f.programs.map(p => 
                        p.id === program.id ? { ...p, name: programName, studentCount } : p
                    );
                    return { ...f, programs: updatedPrograms };
                } else { // Adding
                    const newProgram = { id: Date.now().toString(), name: programName, studentCount };
                    return { ...f, programs: [...f.programs, newProgram] };
                }
            }
            return f;
        });
        updateAndRefreshFaculties(newFaculties);
        setEditingProgram(null);
        setProgramName('');
        setStudentCount(0);
    };

    const handleDeleteProgram = (facultyId: string, programId: string) => {
        const newFaculties = faculties.map(f => f.id === facultyId ? { ...f, programs: f.programs.filter(p => p.id !== programId) } : f);
        updateAndRefreshFaculties(newFaculties);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
             <header>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <Settings className="w-8 h-8 mr-3 text-blue-600" />
                    Konfigurasi Data Dasar
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Atur nilai populasi dasar dan nama institusi yang digunakan dalam perhitungan dan fitur AI.
                </p>
            </header>

            <div className="space-y-5">
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Nama Institusi</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">Nama ini akan digunakan oleh fitur AI untuk memberikan hasil yang lebih relevan dengan institusi Anda.</p>
                    </div>
                     <div className="flex-shrink-0 pt-2 sm:pt-0 flex items-center gap-2">
                        <input
                            type="text"
                            value={universityName}
                            onChange={(e) => setUniversityName(e.target.value)}
                            className="block w-64 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                         <button onClick={handleSaveUniversityName} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"><Save className="w-5 h-5"/></button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/80">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Struktur Akademik & Demografi</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Definisikan struktur fakultas dan program studi institusi Anda. Data ini akan digunakan AI untuk analisis potensi kemitraan yang lebih akurat.</p>
                    <div className="space-y-4">
                        {faculties.map(faculty => (
                            <div key={faculty.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200">{faculty.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setEditingFacultyId(faculty.id); setFacultyName(faculty.name); }} className="p-1.5 text-slate-500 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDeleteFaculty(faculty.id)} className="p-1.5 text-slate-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {faculty.programs.map(program => (
                                         <div key={program.id} className="flex justify-between items-center p-2 bg-white dark:bg-slate-700 rounded">
                                            <div>
                                                <p className="text-sm font-medium">{program.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{program.studentCount} mahasiswa</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setEditingProgram({ facultyId: faculty.id, program }); setProgramName(program.name); setStudentCount(program.studentCount); }} className="p-1.5 text-slate-500 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4"/></button>
                                                <button onClick={() => handleDeleteProgram(faculty.id, program.id)} className="p-1.5 text-slate-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => { setEditingProgram({ facultyId: faculty.id, program: null }); setProgramName(''); setStudentCount(0); }} className="w-full text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-2 rounded flex items-center justify-center transition-colors"><Plus className="w-4 h-4 mr-1"/> Tambah Prodi</button>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center gap-2">
                            <input type="text" value={editingFacultyId ? '' : facultyName} onChange={e => setFacultyName(e.target.value)} placeholder="Nama Fakultas Baru" className="flex-grow px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm" disabled={!!editingFacultyId}/>
                            <button onClick={handleSaveFaculty} disabled={!!editingFacultyId} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-400">Tambah Fakultas</button>
                        </div>
                         {editingFacultyId && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-700">
                                <h5 className="text-sm font-bold mb-2">Edit Nama Fakultas</h5>
                                <div className="flex items-center gap-2">
                                    <input type="text" value={facultyName} onChange={e => setFacultyName(e.target.value)} className="flex-grow px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                                    <button onClick={handleSaveFaculty} className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Simpan</button>
                                    <button onClick={() => {setEditingFacultyId(null); setFacultyName('');}} className="px-3 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md text-sm hover:bg-slate-300">Batal</button>
                                </div>
                            </div>
                        )}
                         {editingProgram && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-700">
                                <h5 className="text-sm font-bold mb-2">{editingProgram.program ? 'Edit' : 'Tambah'} Program Studi</h5>
                                <div className="flex items-center gap-2">
                                    <input type="text" value={programName} onChange={e => setProgramName(e.target.value)} placeholder="Nama Prodi" className="flex-grow px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                                    <input type="number" value={studentCount} onChange={e => setStudentCount(Number(e.target.value))} placeholder="Jml Mahasiswa" className="w-32 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                                    <button onClick={handleSaveProgram} className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Simpan</button>
                                    <button onClick={() => setEditingProgram(null)} className="px-3 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md text-sm hover:bg-slate-300">Batal</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 pt-4 border-t border-slate-200 dark:border-slate-700">Populasi IKU</h3>
                 <ConfigItem
                    label="Total Lulusan Wisuda Terakhir"
                    description="Jumlah total lulusan (populasi) yang digunakan sebagai penyebut dalam perhitungan IKU 1."
                    value={allData?.iku1TotalGraduates || 0}
                    onSave={handleSaveConfig}
                />

            </div>
        </div>
    );
};

export default ConfigurationDashboard;
import React from 'react';
import { IKU } from '../types';
import { Settings, X, Briefcase } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface NavigationProps {
    activeIKU: IKU;
    onNavigate: (iku: IKU) => void;
    isOpen: boolean;
    onClose: () => void;
}

const IKU_ITEMS = [
    { id: IKU.IKU1, label: 'IKU 1: Lulusan', icon: Briefcase, group: 'Utama' },
    { id: IKU.CONFIGURATION, label: 'Konfigurasi', icon: Settings, group: 'Lainnya' },
];

const GROUPS = ['Utama', 'Lainnya'];

const Navigation: React.FC<NavigationProps> = ({ activeIKU, onNavigate, isOpen, onClose }) => {
    const { summary } = useAppContext();
    return (
        <nav className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200/80 dark:border-slate-700/80 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex-shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex justify-between items-center p-4 border-b border-slate-200/80 dark:border-slate-700/80">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">PMS IKU 1</h2>
                <button onClick={onClose} className="md:hidden p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <ul className="h-[calc(100vh-65px)] overflow-y-auto p-3">
                {GROUPS.map(group => (
                    <li key={group}>
                        <h3 className="px-3 pt-4 pb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{group}</h3>
                        <ul className="space-y-1">
                        {IKU_ITEMS.filter(item => item.group === group).map(item => {
                            const isActive = activeIKU === item.id;
                            const score = (item.id === IKU.IKU1 && summary) ? summary.score : undefined;
                            
                            const scoreColorClass = score === undefined ? '' : score >= 80 
                                ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-500/20' 
                                : score >= 50 
                                ? 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-500/20' 
                                : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-500/20';

                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => { onNavigate(item.id); onClose(); }}
                                        className={`w-full flex items-center p-3 text-sm font-medium rounded-lg text-left transition-all duration-200 group relative ${
                                            isActive
                                                ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100'
                                        }`}
                                    >
                                        <div className={`absolute left-0 h-6 w-1 rounded-r-full transition-all duration-200 ${isActive ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                        <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                        <span className="flex-1">{item.label}</span>
                                        {score !== undefined && item.id === IKU.IKU1 && (
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isActive ? 'bg-blue-600 text-white' : scoreColorClass}`}>
                                                {score.toFixed(1)}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                        </ul>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navigation;
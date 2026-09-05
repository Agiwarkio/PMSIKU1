import React from 'react';
import { Moon, Sun, Menu, LogOut, User } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
    onToggleNav: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onToggleNav }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-700/80">
      <div className="mx-auto py-3 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
               <button onClick={onToggleNav} className="md:hidden p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Buka navigasi">
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex-shrink-0 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-md border border-slate-200/80 dark:border-slate-700/80">
                <Logo className="h-9 w-9" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">Partner Management System</h1>
                <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 truncate">Platform Intelijen Strategis untuk IKU 1</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
                {user && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <User size={14} className="text-blue-500" />
                        <span>{user.name || user.username}</span>
                    </div>
                )}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Toggle theme"
                    title="Ubah Tema"
                >
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>
                <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200/60 dark:border-red-800/60 transition-colors"
                    title="Keluar dari Aplikasi"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Keluar</span>
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
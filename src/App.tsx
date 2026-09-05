import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Navigation from './components/Navigation';
import LoginPage from './components/LoginPage';
import { IKU } from './types';
import { ToastProvider } from './hooks/useToast';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const MainContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeIKU, setActiveIKU] = useState<IKU>(IKU.IKU1);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  const toggleNav = useCallback(() => setIsNavOpen(prev => !prev), []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="relative min-h-screen md:flex bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Navigation activeIKU={activeIKU} onNavigate={setActiveIKU} isOpen={isNavOpen} onClose={toggleNav} />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <Header theme={theme} toggleTheme={toggleTheme} onToggleNav={toggleNav} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[radial-gradient(theme('colors.slate.200')_1px,transparent_0)] dark:bg-[radial-gradient(theme('colors.slate.700')_1px,transparent_0)] [background-size:20px_20px]">
          <Dashboard activeIKU={activeIKU} />
        </main>
      </div>
       {isNavOpen && <div onClick={toggleNav} className="fixed inset-0 bg-black/50 z-30 md:hidden" aria-hidden="true" />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <MainContent />
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
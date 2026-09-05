import React, { useState } from 'react';
import { Lock, User, LogIn, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Username dan password tidak boleh kosong');
            return;
        }

        setIsLoading(true);
        try {
            await login(username, password);
        } catch (err: any) {
            setError(err.message || 'Login gagal. Periksa kredensial Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
            {/* Background Decorative Grids & Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent dark:from-blue-600/15" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Header Logo Card */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white shadow-xl shadow-blue-500/25 mb-4 transform hover:scale-105 transition-transform duration-300">
                        <ShieldCheck className="w-9 h-9" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
                        Partner Management System
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Platform Intelijen Strategis untuk Pemenuhan IKU 1
                    </p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Masuk ke Akun</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Masukkan kredensial admin Anda untuk melanjutkan</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                            <Sparkles size={12} /> Portal Resmi
                        </span>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3 animate-shake">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Masukkan username admin..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password Anda..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    <span>Masuk ke Dashboard</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Akun Bawaan: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-blue-600 dark:text-blue-400 font-semibold">admin</code> / <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-blue-600 dark:text-blue-400 font-semibold">admin123</code>
                        </p>
                    </div>
                </div>

                {/* Footer copyright */}
                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
                    © {new Date().getFullYear()} PMS IKU 1 • Ditjen Diktiristek Kemendikbudristek
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

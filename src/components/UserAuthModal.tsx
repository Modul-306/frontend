'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotify } from '@/context/NotificationContext';

interface Props {
    onClose: () => void;
    onSuccess: (userId: string, email: string) => void;
}

export default function UserAuthModal({ onClose, onSuccess }: Props) {
    const { login } = useAuth();
    const { t, locale } = useLanguage();
    const { notify } = useNotify();
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('auth/login', { email, password });
            login(res.data.token, res.data.user_id, email, res.data.role);
            notify(t.auth.login_success, 'success');
            onSuccess(res.data.user_id, email);
        } catch {
            setError(t.auth.invalid_creds);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError(t.auth.passwords_mismatch);
            return;
        }
        setLoading(true);
        try {
            await api.post('auth/register', { email, password });
            const res = await api.post('auth/login', { email, password });
            login(res.data.token, res.data.user_id, email, res.data.role);
            notify(t.auth.register_success, 'success');
            onSuccess(res.data.user_id, email);
        } catch (err: any) {
            const msg = err?.response?.data?.error || t.auth.register_failed;
            setError(typeof msg === 'string' ? msg : t.auth.email_in_use);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md mx-4 bg-white border border-farm-bark/30 rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 w-48 h-48 bg-farm-gold/10 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-farm-pine/5 rounded-full blur-3xl -z-10" />

                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-farm-forest/40 hover:text-farm-forest transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-farm-forest to-farm-pine rounded-full flex items-center justify-center text-farm-cream mx-auto mb-5 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-serif text-farm-forest">
                        {tab === 'login' ? t.auth.welcome : t.auth.create_account}
                    </h2>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-farm-forest to-farm-gold mx-auto mt-3 rounded-full" />
                </div>

                <div className="flex bg-farm-bark/20 rounded-full p-1 mb-8">
                    <button
                        onClick={() => { setTab('login'); setError(''); }}
                        className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 ${tab === 'login' ? 'bg-white text-farm-forest shadow-sm' : 'text-farm-forest/50 hover:text-farm-forest'}`}
                    >
                        {t.common.login}
                    </button>
                    <button
                        onClick={() => { setTab('register'); setError(''); }}
                        className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 ${tab === 'register' ? 'bg-white text-farm-forest shadow-sm' : 'text-farm-forest/50 hover:text-farm-forest'}`}
                    >
                        {t.common.register}
                    </button>
                </div>

                <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-5">
                    <div>
                        <label className="premium-label">{t.auth.email}</label>
                        <input
                            id="auth-email"
                            className="premium-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="premium-label">{t.auth.password}</label>
                        <input
                            id="auth-password"
                            className="premium-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {tab === 'register' && (
                        <div>
                            <label className="premium-label">{t.auth.confirm_password}</label>
                            <input
                                id="auth-confirm-password"
                                className="premium-input"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-red-500 text-xs font-medium text-center bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                            {error}
                        </p>
                    )}

                    <button
                        id="auth-submit"
                        disabled={loading}
                        className="premium-btn w-full mt-2"
                    >
                        {loading ? '...' : tab === 'login' ? t.auth.sign_in : t.auth.sign_up}
                    </button>
                </form>
            </div>
        </div>
    );
}

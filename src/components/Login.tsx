'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotify } from '@/context/NotificationContext';

export default function Login({ onLogin }: { onLogin: (role: string) => void }) {
    const { login } = useAuth();
    const { t, locale } = useLanguage();
    const { notify } = useNotify();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('auth/login', { email, password });
            // Only platform_admin can access this page
            if (res.data.role !== 'platform_admin') {
                setError(t.auth.access_denied_admin);
                return;
            }
            login(res.data.token, res.data.user_id, email, res.data.role);
            notify(t.auth.welcome_back, 'success');
            onLogin(res.data.role);
        } catch {
            setError(t.auth.invalid_creds);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white border border-farm-bark/30 p-12 md:p-16 mt-20 rounded-3xl shadow-2xl relative overflow-hidden group animate-in zoom-in-95 duration-1000">
            <div className="absolute top-0 right-0 w-64 h-64 bg-farm-gold/10 rounded-full blur-3xl -z-10 group-hover:bg-farm-pine/10 transition-colors duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-farm-pine/5 rounded-full blur-3xl -z-10" />

            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-tr from-farm-forest to-farm-pine rounded-full flex items-center justify-center text-farm-cream mx-auto mb-8 shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-white/10 group-hover:opacity-0 transition-opacity" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-4xl font-serif text-farm-forest mb-4">{t.auth.secured_access}</h2>
                <div className="h-1 w-16 bg-gradient-to-r from-farm-forest to-farm-gold mx-auto mb-6 rounded-full" />
                <p className="premium-badge-gold inline-block">{t.auth.platform_admin_badge}</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-8">
                <div>
                    <label className="premium-label">{t.auth.email}</label>
                    <input id="admin-email" className="premium-input" type="email" placeholder="admin@cattlehof.ch" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label className="premium-label">{t.auth.password}</label>
                    <input id="admin-password" className="premium-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                {error && (
                    <p className="text-red-500 text-xs font-medium text-center bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                        {error}
                    </p>
                )}
                <button id="admin-login-submit" disabled={loading} className="premium-btn w-full mt-8 shadow-xl">
                    {loading ? t.common.loading : t.auth.enter_ledger}
                </button>
            </form>
        </div>
    );
}

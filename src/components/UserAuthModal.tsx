'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface Props {
    onClose: () => void;
    onSuccess: (userId: string, email: string) => void;
}

export default function UserAuthModal({ onClose, onSuccess }: Props) {
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
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user_id', res.data.user_id);
            localStorage.setItem('user_email', email);
            localStorage.setItem('user_role', res.data.role);
            onSuccess(res.data.user_id, email);
        } catch {
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/register', { email, password });
            // Auto-login after registration
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user_id', res.data.user_id);
            localStorage.setItem('user_email', email);
            localStorage.setItem('user_role', res.data.role);
            onSuccess(res.data.user_id, email);
        } catch (err: any) {
            const msg = err?.response?.data || 'Registration failed.';
            setError(typeof msg === 'string' ? msg : 'Email may already be in use.');
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md mx-4 bg-white border border-farm-bark/30 rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-farm-gold/10 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-farm-pine/5 rounded-full blur-3xl -z-10" />

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-farm-forest/40 hover:text-farm-forest transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-farm-forest to-farm-pine rounded-full flex items-center justify-center text-farm-cream mx-auto mb-5 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-serif text-farm-forest">
                        {tab === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-farm-forest to-farm-gold mx-auto mt-3 rounded-full" />
                </div>

                {/* Tab switcher */}
                <div className="flex bg-farm-bark/20 rounded-full p-1 mb-8">
                    <button
                        onClick={() => { setTab('login'); setError(''); }}
                        className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 ${tab === 'login' ? 'bg-white text-farm-forest shadow-sm' : 'text-farm-forest/50 hover:text-farm-forest'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setTab('register'); setError(''); }}
                        className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 ${tab === 'register' ? 'bg-white text-farm-forest shadow-sm' : 'text-farm-forest/50 hover:text-farm-forest'}`}
                    >
                        Register
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-5">
                    <div>
                        <label className="premium-label">Email</label>
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
                        <label className="premium-label">Password</label>
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
                            <label className="premium-label">Confirm Password</label>
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
                        {loading ? '...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}

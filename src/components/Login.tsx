'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function Login({ onLogin }: { onLogin: (role: string) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            onLogin(res.data.role);
        } catch (err) {
            alert('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 mt-20">
            <h2 className="text-3xl font-black mb-8 text-center text-primary">WELCOME BACK</h2>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                    <input className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-primary outline-none" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                    <input className="w-full bg-gray-50 border-0 p-4 rounded-2xl focus:ring-2 focus:ring-primary outline-none" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button disabled={loading} className="btn-primary w-full py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg">
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}

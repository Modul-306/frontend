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
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            onLogin(res.data.role);
        } catch (err) {
            alert('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white border border-farm-bark p-16 mt-20 animate-in zoom-in-95 duration-1000">
            <div className="text-center mb-12">
                <div className="w-16 h-16 bg-farm-forest flex items-center justify-center text-farm-cream mx-auto mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-5xl tracking-tighter uppercase mb-4">Secured Access</h2>
                <div className="h-0.5 w-12 bg-farm-forest mx-auto mb-6" />
                <p className="text-farm-gold font-bold text-[10px] uppercase tracking-[0.3em]">The Farmer's Key</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-10">
                <div className="space-y-2">
                    <label className="farm-label">Email Record</label>
                    <input className="farm-input font-serif italic" type="email" placeholder="farmer@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <label className="farm-label">Passphrase</label>
                    <input className="farm-input font-serif italic" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button disabled={loading} className="farm-btn w-full py-4 text-xs uppercase tracking-[0.2em] mt-6">
                    {loading ? 'Confirming...' : 'Enter the Ledger'}
                </button>
            </form>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import GlobalAdmin from '@/components/GlobalAdmin';
import Login from '@/components/Login';

export default function AdminLoginPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setIsAuthenticated(true);
    }, []);

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-farm-clay p-6">
                <Login onLogin={() => setIsAuthenticated(true)} />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-farm-cream">
            <nav className="nav-humble">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-farm-forest flex items-center justify-center text-farm-cream font-serif text-xl font-bold">R</div>
                        <span className="text-3xl font-serif font-bold text-farm-forest uppercase tracking-widest">Market Registry</span>
                    </div>
                    <button 
                        className="text-[10px] font-bold text-farm-forest/40 hover:text-farm-gold transition-colors uppercase tracking-[0.3em]" 
                        onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); }}
                    >
                        Secure Logout
                    </button>
                </div>
            </nav>
            <div className="container mx-auto px-8 py-24">
                <GlobalAdmin />
            </div>
        </main>
    );
}

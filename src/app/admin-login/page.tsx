'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
            <main className="min-h-screen bg-farm-cream relative overflow-hidden flex flex-col justify-center py-12">
                <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-farm-parchment to-transparent -z-10" />
                <Login onLogin={() => setIsAuthenticated(true)} />
                <div className="mt-8 text-center animate-in fade-in duration-1000 delay-500">
                    <Link href="/" className="text-farm-forest/40 hover:text-farm-forest font-bold text-xs uppercase tracking-widest transition-colors">
                        ← Return to Public Directory
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-farm-cream">
            <nav className="nav-premium">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-farm-forest to-farm-pine flex items-center justify-center text-farm-cream font-serif text-xl font-bold shadow-md group-hover:shadow-lg transition-all duration-300">
                            P
                        </div>
                        <span className="text-2xl font-serif font-bold text-farm-forest uppercase tracking-widest">Platform Admin</span>
                    </Link>
                    <button 
                        className="premium-btn-outline !py-2" 
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

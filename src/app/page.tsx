'use client';

import { useState, useEffect } from 'react';
import GlobalAdmin from '@/components/GlobalAdmin';
import Login from '@/components/Login';

export default function RootPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setIsAuthenticated(true);
    }, []);

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-background p-6">
                <Login onLogin={() => setIsAuthenticated(true)} />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <nav className="glass-nav px-6 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
                        <span className="text-2xl font-black text-primary tracking-tight">CATTLEHOF CENTRAL</span>
                    </div>
                    <button className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors" onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); }}>Logout</button>
                </div>
            </nav>
            <GlobalAdmin />
        </main>
    );
}

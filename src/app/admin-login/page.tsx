'use client';

import Link from 'next/link';
import GlobalAdmin from '@/components/GlobalAdmin';
import Login from '@/components/Login';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
    const { user, loading, logout, login } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-farm-cream">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-farm-forest"></div>
            </div>
        );
    }

    if (!user || user.role !== 'platform_admin') {
        return (
            <main className="min-h-screen bg-farm-cream relative overflow-hidden flex flex-col justify-center py-12">
                <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-farm-parchment to-transparent -z-10" />
                <Login onLogin={() => {
                    // refreshUser is called within login in AuthContext
                }} />
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
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-farm-forest/70 font-semibold hidden sm:block">{user.email}</span>
                        <button
                            id="logout-btn"
                            onClick={logout}
                            className="text-farm-forest/60 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-all duration-300"
                            title="Logout"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>
            <div className="container mx-auto px-8 py-24">
                <GlobalAdmin />
            </div>
        </main>
    );
}

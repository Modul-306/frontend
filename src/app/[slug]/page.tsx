'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Shop from '@/components/Shop';
import Admin from '@/components/Admin';
import api from '@/lib/api';
import { Tenant } from '@/types';
import UserAuthModal from '@/components/UserAuthModal';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

export default function TenantPage() {
    const { slug } = useParams();
    const { user, logout } = useAuth();
    const { t, locale } = useLanguage();
    const [view, setView] = useState<'shop' | 'admin'>('shop');
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [owners, setOwners] = useState<{id: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        if (typeof slug === 'string') {
            setLoading(true);
            setNotFound(false);
            localStorage.setItem('tenant_slug', slug); // Store for API interceptor
            
            const fetchData = async () => {
                try {
                    const res = await api.get(`/tenants/${slug}`);
                    setTenant(res.data);
                    
                    // Fetch owners for this tenant
                    const ownersRes = await api.get(`/tenants/${res.data.id}/owners`);
                    setOwners(ownersRes.data || []);
                } catch (err) {
                    console.error("Could not fetch tenant data", err);
                    setNotFound(true);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchData();
        }
        return () => {
            localStorage.removeItem('tenant_slug');
        };
    }, [slug]);

    const isOwner = user && tenant && (
        user.role === 'platform_admin' || 
        owners.some(o => o.id === user.id)
    );

    if (loading) {
        return (
            <main className="min-h-screen bg-farm-cream flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-farm-forest/30 border-t-farm-forest rounded-full animate-spin" />
                    <p className="text-farm-forest/60 font-serif text-lg">{t.common.loading}</p>
                </div>
            </main>
        );
    }

    if (notFound) {
        return (
            <main className="min-h-screen bg-farm-cream flex items-center justify-center px-6">
                <div className="text-center max-w-lg animate-in fade-in zoom-in-95 duration-700">
                    <div className="mb-6 select-none">
                        <span className="text-[10rem] md:text-[14rem] font-serif font-black text-farm-forest/10 leading-none">
                            404
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-farm-forest mb-3">
                        {t.errors.not_found_title}
                    </h1>
                    <p className="text-farm-forest/60 text-base md:text-lg mb-8 leading-relaxed">
                        {t.errors.not_found_desc.replace('{slug}', typeof slug === 'string' ? slug : '')}
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-farm-forest to-farm-pine text-farm-cream font-bold text-sm uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                        <span>🏠</span>
                        {t.errors.back_to_safety}
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-farm-cream">
            <nav className="nav-premium !z-[1000] relative">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-farm-forest to-farm-pine flex items-center justify-center text-farm-cream font-serif text-xl font-bold shadow-md group-hover:shadow-lg transition-all duration-300 overflow-hidden">
                            {tenant?.icon_url?.Valid ? (
                                <img src={tenant.icon_url.String} alt="Farm Logo" className="w-full h-full object-cover" />
                            ) : (
                                typeof slug === 'string' ? slug.charAt(0).toUpperCase() : 'F'
                            )}
                        </div>
                        <span className="text-2xl font-serif font-bold text-farm-forest uppercase tracking-widest">{tenant?.name || slug}</span>
                    </Link>
                    
                    {isOwner && (
                        <div className="flex bg-farm-bark/30 p-1 rounded-full border border-farm-bark backdrop-blur-sm shadow-inner">
                            <button 
                                className={`px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 ${view === 'shop' ? 'bg-white text-farm-forest shadow-sm' : 'text-farm-forest/50 hover:text-farm-forest'}`} 
                                onClick={() => setView('shop')}
                            >
                                {t.common.visit_storefront}
                            </button>
                            <button 
                                id="workbench-btn"
                                className={`px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 ${view === 'admin' ? 'bg-white text-farm-forest shadow-sm' : 'text-farm-forest/50 hover:text-farm-forest'}`} 
                                onClick={() => setView('admin')}
                            >
                                {t.admin.workbench}
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <LanguageToggle />
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-farm-forest/70 font-semibold hidden sm:block">{user.email}</span>
                                <button
                                    id="logout-btn"
                                    onClick={() => {
                                        logout();
                                        setView('shop');
                                    }}
                                    className="text-farm-forest/60 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-all duration-300"
                                    title={t.common.logout}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <button
                                id="open-auth-modal-btn"
                                onClick={() => setShowAuthModal(true)}
                                className="text-xs font-bold uppercase tracking-[0.2em] text-farm-forest/60 hover:text-farm-gold transition-colors"
                            >
                                {t.common.login} / {t.common.register}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <div className="animate-in fade-in zoom-in-95 duration-1000">
                {view === 'shop' || !isOwner ? <Shop tenant={tenant} /> : <Admin />}
            </div>

            {showAuthModal && (
                <UserAuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => {
                        setShowAuthModal(false);
                    }}
                />
            )}
        </main>
    );
}

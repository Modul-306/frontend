'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Shop from '@/components/Shop';
import Admin from '@/components/Admin';
import api from '@/lib/api';
import { Tenant } from '@/types';

export default function TenantPage() {
    const { slug } = useParams();
    const [view, setView] = useState<'shop' | 'admin'>('shop');
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        if (typeof slug === 'string') {
            setLoading(true);
            setNotFound(false);
            api.get(`/tenants/${slug}`)
               .then(res => {
                   const t: Tenant = res.data;
                   setTenant(t);

                   // Check ownership: compare stored user_id with tenant.owner_id
                   const storedUserId = localStorage.getItem('user_id');
                   if (storedUserId && t.owner_id === storedUserId) {
                       setIsOwner(true);
                   } else {
                       setIsOwner(false);
                   }

                   setLoading(false);
               })
               .catch(err => {
                   console.error("Could not fetch tenant", err);
                   setNotFound(true);
                   setLoading(false);
               });
        }
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-farm-cream flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-farm-forest/30 border-t-farm-forest rounded-full animate-spin" />
                    <p className="text-farm-forest/60 font-serif text-lg">Loading...</p>
                </div>
            </main>
        );
    }

    if (notFound) {
        return (
            <main className="min-h-screen bg-farm-cream flex items-center justify-center px-6">
                <div className="text-center max-w-lg animate-in fade-in zoom-in-95 duration-700">
                    {/* Big 404 */}
                    <div className="mb-6 select-none">
                        <span className="text-[10rem] md:text-[14rem] font-serif font-black text-farm-forest/10 leading-none">
                            404
                        </span>
                    </div>

                    {/* Message */}
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-farm-forest mb-3">
                        Lost in the Fields
                    </h1>
                    <p className="text-farm-forest/60 text-base md:text-lg mb-8 leading-relaxed">
                        The farm <span className="font-semibold text-farm-forest/80">&ldquo;{slug}&rdquo;</span> doesn&apos;t exist or may have moved. Let&apos;s get you back on track.
                    </p>

                    {/* CTA Button */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-farm-forest to-farm-pine text-farm-cream font-bold text-sm uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                        <span>🏠</span>
                        Take me back to safety
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-farm-cream">
            <nav className="nav-premium">
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
                    
                    <div className="flex bg-farm-bark/30 p-1 rounded-full border border-farm-bark backdrop-blur-sm shadow-inner">
                        <button 
                            className={`px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 ${view === 'shop' ? 'bg-white text-farm-forest shadow-sm' : 'text-farm-forest/50 hover:text-farm-forest'}`} 
                            onClick={() => setView('shop')}
                        >
                            Storefront
                        </button>
                        {isOwner && (
                            <button 
                                id="workbench-btn"
                                className={`px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 ${view === 'admin' ? 'bg-white text-farm-forest shadow-sm' : 'text-farm-forest/50 hover:text-farm-forest'}`} 
                                onClick={() => setView('admin')}
                            >
                                Workbench
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <div className="animate-in fade-in zoom-in-95 duration-1000">
                {view === 'shop' || !isOwner ? <Shop tenant={tenant} /> : <Admin />}
            </div>
        </main>
    );
}

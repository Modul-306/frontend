'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Tenant } from '@/types';

export default function RootPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const farmImages = [
        'photo-1500382017468-9049fed747ef', // Field
        'photo-1500076656116-558758c991c1', // Barn
        'photo-1595113316349-9fa4046a6178', // Red Barn
        'photo-1495107334309-fcf20504a5ab', // Landscape
        'photo-1523348837708-15d4a09cfac2', // Veggie Garden
    ];

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const res = await api.get('/tenants');
                setTenants(res.data || []);
            } catch (err) {
                console.error('Failed to fetch tenants', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTenants();
    }, []);

    const filteredTenants = tenants.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-farm-cream">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-forest"></div>
        </div>
    );


    return (
        <main className="min-h-screen bg-farm-cream">
            {/* Humble Hero */}
            <section className="container mx-auto px-8 pt-32 pb-48 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-7xl md:text-9xl mb-8 leading-tight">
                        FARMER'S <br/> MARKET
                    </h1>
                    <div className="h-0.5 w-24 bg-farm-forest mx-auto mb-10" />
                    <p className="text-xl md:text-2xl text-farm-forest/60 max-w-2xl mx-auto leading-relaxed mb-12 font-serif italic">
                        Authentic produce and handmade goods, delivered directly from the fields to your doorstep. Supporting local agriculture, one stall at a time.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        <a href="#shops" className="farm-btn">Browse Local Stalls</a>
                        <Link href="/admin-login" className="farm-btn-outline">Register your Farm</Link>
                    </div>
                </div>
            </section>

            <div id="shops" className="container mx-auto px-8 pb-48">
                <div className="flex flex-col items-center mb-16 text-center">
                    <h2 className="text-3xl md:text-4xl uppercase tracking-[0.2em] mb-8">Active Stalls</h2>
                    
                    <div className="w-full max-w-xl relative">
                        <input 
                            type="text" 
                            className="farm-input text-center text-lg italic" 
                            placeholder="Search for a specific producer..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTenants.length === 0 ? (
                        <div className="col-span-full py-32 text-center border border-farm-bark text-farm-forest/40">
                            <p className="text-xl italic">No farm shops found matching your search.</p>
                            <button onClick={() => setSearchQuery('')} className="text-farm-gold font-bold uppercase text-xs mt-4 hover:underline">Clear Search</button>
                        </div>
                    ) : filteredTenants.map((tenant, index) => (
                        <Link href={`/${tenant.slug}`} key={tenant.id} className="farm-card group block">
                            <div className="relative h-64 bg-farm-bark/20">
                                <img 
                                    src={`https://images.unsplash.com/${farmImages[index % farmImages.length]}?auto=format&fit=crop&q=80&w=600`}
                                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                                    alt="Farm market stall"
                                />
                                <div className="absolute inset-0 bg-farm-forest/5" />
                            </div>
                            <div className="p-8 text-center">
                                <h3 className="text-3xl mb-4 group-hover:text-farm-gold transition-colors">{tenant.name}</h3>
                                <p className="text-farm-forest/60 text-sm leading-relaxed mb-8">Visit our market stall for the freshest seasonal produce and handcrafted local goods.</p>
                                <div className="flex flex-col items-center pt-6 border-t border-farm-bark">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40 mb-4">Established {new Date(tenant.created_at).getFullYear()}</span>
                                    <span className="text-farm-forest font-bold uppercase tracking-widest text-xs">
                                        Enter Shop →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <footer className="bg-farm-forest py-24 text-center text-farm-cream">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl mb-8 text-farm-cream">THE HUMBLE FARM</h2>
                    <p className="text-farm-cream/40 font-bold uppercase tracking-widest text-xs mb-6">© 2024 Local Farmer's Market Platform</p>
                    <div className="flex justify-center space-x-12">
                        <Link href="/admin-login" className="text-farm-cream/30 hover:text-farm-cream text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">Platform Administration</Link>
                        <a href="#" className="text-farm-cream/30 hover:text-farm-cream text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">Privacy & Terms</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}

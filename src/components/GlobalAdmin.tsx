'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export default function GlobalAdmin() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchTenants = async () => {
        try {
            const res = await api.get('/tenants');
            setTenants(res.data || []);
        } catch (err) {
            console.error('Failed to fetch tenants', err);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleCreateTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/tenants', { name, slug });
            alert('Tenant created!');
            setName('');
            setSlug('');
            fetchTenants();
        } catch (err) {
            console.error('Failed to create tenant', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-1000">
            <div className="flex flex-col items-center mb-24 text-center">
                <h1 className="text-6xl md:text-7xl mb-6">Market Registry</h1>
                <div className="h-0.5 w-32 bg-farm-forest mx-auto mb-8" />
                <p className="text-farm-forest/50 font-serif italic text-xl max-w-2xl mx-auto leading-relaxed">The central ledger for all community farm stalls.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <section className="bg-white border border-farm-bark p-12 md:p-16">
                    <div className="flex flex-col items-center text-center mb-16">
                        <h2 className="text-3xl uppercase tracking-[0.2em] mb-4 text-farm-forest">Onboarding</h2>
                        <span className="text-farm-gold text-[10px] font-bold uppercase tracking-widest">Register New Community Stall</span>
                    </div>

                    <form onSubmit={handleCreateTenant} className="space-y-10">
                        <div className="space-y-2">
                            <label className="farm-label">Stall Name</label>
                            <input className="farm-input font-serif italic" placeholder="e.g. Green Valley Farm" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="farm-label">Market Slug (URL)</label>
                            <input className="farm-input font-serif italic" placeholder="e.g. green-valley" value={slug} onChange={e => setSlug(e.target.value)} required />
                        </div>
                        <button disabled={loading} className="farm-btn w-full py-4 text-xs uppercase tracking-[0.2em] mt-6">
                            {loading ? 'Registering...' : 'Formalize Stall Registration'}
                        </button>
                    </form>
                </section>

                <section className="bg-white border border-farm-bark p-12 md:p-16">
                    <div className="flex flex-col items-center text-center mb-16">
                        <h2 className="text-3xl uppercase tracking-[0.2em] mb-4 text-farm-forest">Registry</h2>
                        <span className="text-farm-gold text-[10px] font-bold uppercase tracking-widest">Active Community Producers</span>
                    </div>

                    <div className="space-y-6">
                        {tenants.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-8 bg-farm-cream border border-farm-bark group hover:border-farm-forest transition-colors">
                                <div>
                                    <div className="text-2xl mb-1 text-farm-forest uppercase tracking-tighter">{t.name}</div>
                                    <div className="text-[10px] text-farm-gold font-bold uppercase tracking-widest">Unique ID: {t.slug}</div>
                                </div>
                                <div className="text-[10px] text-farm-forest/30 font-bold uppercase tracking-widest text-right">
                                    Enrolled <br/> {new Date(t.created_at).toLocaleDateString('en-GB')}
                                </div>
                            </div>
                        ))}
                        {tenants.length === 0 && (
                            <div className="py-24 text-center text-farm-forest/30 italic font-serif text-xl">
                                No stalls currently registered in the ledger.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

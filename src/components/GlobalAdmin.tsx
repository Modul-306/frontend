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
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-black mb-8 text-primary">GLOBAL ADMIN</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6">Create New Shop (Tenant)</h2>
                    <form onSubmit={handleCreateTenant} className="space-y-4">
                        <input className="w-full bg-gray-50 border-0 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary" placeholder="Shop Name (e.g. Green Valley Farm)" value={name} onChange={e => setName(e.target.value)} required />
                        <input className="w-full bg-gray-50 border-0 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary" placeholder="Slug (e.g. green-valley)" value={slug} onChange={e => setSlug(e.target.value)} required />
                        <button disabled={loading} className="btn-primary w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20">
                            {loading ? 'Creating...' : 'Register Shop'}
                        </button>
                    </form>
                </section>

                <section className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6">Existing Shops</h2>
                    <div className="space-y-3">
                        {tenants.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <div className="font-bold text-gray-900">{t.name}</div>
                                    <div className="text-xs text-primary font-mono uppercase tracking-tighter">{t.slug}.cattlehof.voyagera.ch</div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {new Date(t.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

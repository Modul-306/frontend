'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useNotify } from '@/context/NotificationContext';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    icon_url?: { String: string; Valid: boolean };
    category?: { String: string; Valid: boolean };
    owner_id?: string;
    created_at: string;
}

interface User {
    id: string;
    email: string;
    role: string;
}

export default function GlobalAdmin() {
    const { t, locale } = useLanguage();
    const { notify } = useNotify();
    const [tenants, setTenants] = useState<(Tenant & { owners: User[] })[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [showRegisterForm, setShowRegisterForm] = useState(false);

    useEffect(() => {
        fetchTenants();
        fetchUsers();
    }, []);

    const fetchTenants = async () => {
        try {
            const res = await api.get('tenants');
            const rawTenants = res.data || [];
            if (!Array.isArray(rawTenants)) {
                setTenants([]);
                return;
            }
            const tenantsWithOwners = await Promise.all(rawTenants.map(async (t: Tenant) => {
                try {
                    const ownersRes = await api.get(`tenants/${t.id}/owners`);
                    return { ...t, owners: ownersRes.data || [] };
                } catch (err) {
                    console.error(`Failed to fetch owners for tenant ${t.id}`, err);
                    return { ...t, owners: [] };
                }
            }));
            setTenants(tenantsWithOwners);
        } catch (err) {
            console.error('Failed to fetch tenants', err);
            notify(t.global_admin.fetch_error || 'Failed to fetch tenants', 'error');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('users');
            setUsers(res.data || []);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const handleCreateTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('tenants', { name, slug });
            notify(t.global_admin.create_success, 'success');
            setName('');
            setSlug('');
            setShowRegisterForm(false);
            fetchTenants();
        } catch {
            notify(t.global_admin.create_error, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTenant = async (id: string) => {
        if (!confirm(t.global_admin.delete_confirm)) return;
        try {
            await api.delete(`tenants/${id}`);
            notify(t.global_admin.delete_success, 'success');
            fetchTenants();
        } catch {
            notify(t.global_admin.delete_error, 'error');
        }
    };

    const handleAddOwner = async (tenantId: string, ownerId: string) => {
        if (!ownerId) return;
        try {
            await api.post(`tenants/${tenantId}/owners`, { user_id: ownerId });
            notify(t.global_admin.assign_success, 'success');
            fetchTenants();
        } catch {
            notify(t.global_admin.assign_error, 'error');
        }
    };

    const handleRemoveOwner = async (tenantId: string, ownerId: string) => {
        try {
            await api.delete(`tenants/${tenantId}/owners/${ownerId}`);
            notify(t.common.success, 'success');
            fetchTenants();
        } catch {
            notify(t.common.error, 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
                <div>
                    <h1 className="text-5xl font-serif text-farm-forest mb-2">{t.global_admin.registry_title}</h1>
                    <p className="text-farm-forest/40 font-sans text-lg uppercase tracking-widest text-xs font-bold">{t.global_admin.registry_subtitle}</p>
                </div>
                <button 
                    onClick={() => setShowRegisterForm(!showRegisterForm)}
                    className="premium-btn shadow-xl hover:scale-105 transition-transform"
                >
                    {showRegisterForm ? t.common.cancel : t.global_admin.register_btn}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Registration Form */}
                <div className={`lg:col-span-1 transition-all duration-500 ${showRegisterForm ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none hidden'}`}>
                    <div className="glass-panel p-10 rounded-3xl sticky top-24 border-farm-gold/20">
                        <h2 className="text-2xl font-serif mb-8 text-farm-forest flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-farm-gold/20 flex items-center justify-center text-farm-gold text-sm italic">i</span>
                            {t.global_admin.stall_info}
                        </h2>
                        <form onSubmit={handleCreateTenant} className="space-y-6">
                            <div>
                                <label className="premium-label">{t.global_admin.market_name}</label>
                                <input 
                                    className="premium-input" 
                                    placeholder="e.g. Sunny Meadows Farm" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="premium-label">{t.global_admin.access_slug}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-farm-forest/30 text-sm">/</span>
                                    <input 
                                        className="premium-input !pl-8" 
                                        placeholder="sunny-meadows" 
                                        value={slug} 
                                        onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                                        required 
                                    />
                                </div>
                            </div>
                            <button id="register-stall-submit" disabled={loading} className="premium-btn w-full mt-4">
                                {loading ? t.common.loading : t.global_admin.commit_btn}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Registry Table */}
                <section className={`${showRegisterForm ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-500`}>
                    <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border-farm-bark/10">
                        <div className="bg-farm-forest/5 p-6 border-b border-farm-bark/10">
                            <h2 className="font-serif text-xl text-farm-forest">{t.global_admin.active_stalls}</h2>
                        </div>
                        
                        {tenants.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40 border-b border-farm-bark/10">
                                            <th className="px-8 py-4">{t.global_admin.stall_col}</th>
                                            <th className="px-8 py-4">{t.global_admin.status_col}</th>
                                            <th className="px-8 py-4">{t.global_admin.ledger_col}</th>
                                            <th className="px-8 py-4 text-right">{t.global_admin.date_col}</th>
                                            <th className="px-8 py-4 text-right">{t.global_admin.action_col}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-farm-bark/5">
                                        {tenants.map((tenant) => (
                                            <tr key={tenant.id} className="group hover:bg-farm-parchment/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-farm-bark/10 flex items-center justify-center font-serif font-bold text-farm-forest overflow-hidden">
                                                            {tenant.icon_url?.Valid ? (
                                                                <img src={tenant.icon_url.String} className="w-full h-full object-cover" />
                                                            ) : tenant.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-serif font-bold text-farm-forest">{tenant.name}</div>
                                                            <div className="text-[10px] text-farm-forest/40 font-mono tracking-tighter">ID: {tenant.id.slice(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="premium-badge text-[9px] bg-green-50 text-green-700 border-green-200">{t.global_admin.active_status}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {tenant.owners.map(owner => (
                                                            <span key={owner.id} className="inline-flex items-center gap-1 bg-farm-pine/10 text-farm-pine px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                                {owner.email}
                                                                <button onClick={() => handleRemoveOwner(tenant.id, owner.id)} className="hover:text-red-500">×</button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <select 
                                                        className="bg-transparent border-none text-xs font-bold text-farm-forest/40 focus:ring-0 cursor-pointer p-0 pr-8 hover:text-farm-pine transition-colors"
                                                        value=""
                                                        onChange={(e) => handleAddOwner(tenant.id, e.target.value)}
                                                    >
                                                        <option value="">+ {t.global_admin.ledger_col}</option>
                                                        {users.filter(u => !tenant.owners.find(o => o.id === u.id)).map(u => (
                                                            <option key={u.id} value={u.id}>{u.email}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-8 py-6 text-right text-xs font-medium text-farm-forest/60">
                                                    {formatDate(tenant.created_at)}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteTenant(tenant.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-full"
                                                        title={t.global_admin.revoke_title}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h14" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-20 text-center text-farm-forest/20 italic font-serif text-xl">
                                {t.global_admin.no_stalls}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

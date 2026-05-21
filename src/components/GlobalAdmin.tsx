'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    icon_url?: { Valid: boolean; String: string };
    owner_id?: string | null;
    created_at: any;
}

interface UserOption {
    id: string;
    email: string;
    role: string;
}

export default function GlobalAdmin() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [loading, setLoading] = useState(false);

    // Owner search for create form
    const [ownerSearch, setOwnerSearch] = useState('');
    const [selectedOwner, setSelectedOwner] = useState<UserOption | null>(null);
    const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
    const ownerSearchRef = useRef<HTMLDivElement>(null);

    // Edit tenant state
    const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [editOwnerSelected, setEditOwnerSelected] = useState<UserOption | null>(null);
    const [editOwnerSearch, setEditOwnerSearch] = useState('');
    const [showEditOwnerDropdown, setShowEditOwnerDropdown] = useState(false);
    const editOwnerSearchRef = useRef<HTMLDivElement>(null);

    // Owner edit state (per tenant in list)
    const [ownerEditId, setOwnerEditId] = useState<string | null>(null);
    const [ownerEditSearch, setOwnerEditSearch] = useState('');
    const [ownerEditSelected, setOwnerEditSelected] = useState<UserOption | null>(null);
    const [showOwnerEditDropdown, setShowOwnerEditDropdown] = useState(false);

    const filteredOwnerUsers = users.filter(u =>
        u.email.toLowerCase().includes(ownerSearch.toLowerCase())
    );
    const filteredOwnerEditUsers = users.filter(u =>
        u.email.toLowerCase().includes(ownerEditSearch.toLowerCase())
    );
    const filteredEditOwnerUsers = users.filter(u =>
        u.email.toLowerCase().includes(editOwnerSearch.toLowerCase())
    );

    const fetchTenants = async () => {
        try {
            const res = await api.get('/tenants');
            console.log('fetchTenants returned:', res.data);
            setTenants(res.data || []);
        } catch (err) {
            console.error('Failed to fetch tenants', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data || []);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    useEffect(() => {
        fetchTenants();
        fetchUsers();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ownerSearchRef.current && !ownerSearchRef.current.contains(e.target as Node)) {
                setShowOwnerDropdown(false);
            }
            if (editOwnerSearchRef.current && !editOwnerSearchRef.current.contains(e.target as Node)) {
                setShowEditOwnerDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleCreateTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalOwner = selectedOwner;
            if (!finalOwner && ownerSearch.trim() !== '') {
                const exactMatch = users.find(u => u.email.toLowerCase() === ownerSearch.trim().toLowerCase());
                if (exactMatch) {
                    finalOwner = exactMatch;
                }
            }
            await api.post('/tenants', {
                name,
                slug,
                owner_id: finalOwner?.id || '',
            });
            setName('');
            setSlug('');
            setOwnerSearch('');
            setSelectedOwner(null);
            fetchTenants();
        } catch (err) {
            console.error('Failed to create tenant', err);
            alert('Error creating tenant.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure? This will delete all products, blogs, and users for this tenant!")) return;
        try {
            await api.delete(`/tenants/${id}`);
            fetchTenants();
        } catch (err) {
            console.error('Failed to delete tenant', err);
            alert("Error deleting tenant.");
        }
    };

    const startEdit = (t: Tenant) => {
        setEditingTenantId(t.id);
        setEditName(t.name);
        setEditSlug(t.slug);
        
        if (t.owner_id) {
            const currentOwner = users.find(u => u.id === t.owner_id);
            setEditOwnerSelected(currentOwner || null);
        } else {
            setEditOwnerSelected(null);
        }
        setEditOwnerSearch('');
        setShowEditOwnerDropdown(false);
    };

    const handleSaveEdit = async (id: string) => {
        console.log('handleSaveEdit called for tenant ID:', id);
        let finalOwner = editOwnerSelected;
        if (!finalOwner && editOwnerSearch.trim() !== '') {
            const exactMatch = users.find(u => u.email.toLowerCase() === editOwnerSearch.trim().toLowerCase());
            if (exactMatch) {
                finalOwner = exactMatch;
            }
        }
        console.log('Selected owner for save:', finalOwner);
        
        try {
            console.log('Updating tenant name and slug...');
            const res1 = await api.put(`/tenants/${id}`, { name: editName, slug: editSlug });
            console.log('Updated tenant response:', res1.data);
            
            const ownerId = finalOwner?.id || '';
            console.log('Updating tenant owner to:', ownerId);
            const res2 = await api.put(`/tenants/${id}/owner`, {
                owner_id: ownerId,
            });
            console.log('Updated owner response:', res2.data);
            
            setEditingTenantId(null);
            fetchTenants();
        } catch (err: any) {
            console.error('Failed to update tenant', err);
            const errMsg = err?.response?.data || err?.message || 'Unknown error';
            alert(`Error updating tenant: ${errMsg}`);
        }
    };

    const startOwnerEdit = (t: Tenant) => {
        setOwnerEditId(t.id);
        setOwnerEditSearch('');
        if (t.owner_id) {
            const currentOwner = users.find(u => u.id === t.owner_id);
            setOwnerEditSelected(currentOwner || null);
        } else {
            setOwnerEditSelected(null);
        }
        setShowOwnerEditDropdown(false);
    };

    const handleSaveOwner = async (tenantId: string) => {
        let finalOwner = ownerEditSelected;
        if (!finalOwner && ownerEditSearch.trim() !== '') {
            const exactMatch = users.find(u => u.email.toLowerCase() === ownerEditSearch.trim().toLowerCase());
            if (exactMatch) {
                finalOwner = exactMatch;
            }
        }
        try {
            console.log('handleSaveOwner - saving owner for tenant:', tenantId, 'owner:', finalOwner);
            await api.put(`/tenants/${tenantId}/owner`, {
                owner_id: finalOwner?.id || '',
            });
            setOwnerEditId(null);
            fetchTenants();
        } catch (err) {
            console.error('Failed to set owner', err);
            alert("Error setting owner.");
        }
    };

    const getOwnerEmail = (t: Tenant) => {
        console.log('getOwnerEmail called for tenant:', t.name, 'owner_id:', t.owner_id, 'type:', typeof t.owner_id);
        if (!t.owner_id) return null;
        const u = users.find(u => u.id === t.owner_id);
        console.log('Matching user found:', u);
        return u?.email ?? t.owner_id.slice(0, 8) + '…';
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-1000">
            <header className="flex flex-col items-center mb-24 text-center">
                <span className="premium-badge-gold mb-6 inline-block">Platform Administration</span>
                <h1 className="text-5xl md:text-6xl mb-6 font-serif">Market Registry</h1>
                <div className="h-1 w-24 bg-gradient-to-r from-farm-forest to-farm-gold mx-auto mb-8 rounded-full" />
                <p className="text-farm-forest/50 font-sans text-lg max-w-2xl mx-auto leading-relaxed font-light">The central ledger for all community farm stalls.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* ── Create Tenant Form ── */}
                <section className="glass-panel p-10 md:p-14 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-farm-gold/5 rounded-full blur-3xl -z-10 group-hover:bg-farm-gold/10 transition-colors duration-700" />
                    
                    <div className="mb-12">
                        <h2 className="text-3xl font-serif mb-2 text-farm-forest">Onboarding</h2>
                        <p className="text-farm-forest/40 font-sans text-sm">Register a new community stall into the ecosystem.</p>
                    </div>

                    <form onSubmit={handleCreateTenant} className="space-y-8 relative z-10">
                        <div>
                            <label className="premium-label">Stall Name</label>
                            <input className="premium-input" placeholder="e.g. Green Valley Farm" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="premium-label">Market Slug (URL)</label>
                            <input className="premium-input" placeholder="e.g. green-valley" value={slug} onChange={e => setSlug(e.target.value)} required />
                            <p className="text-[10px] text-farm-forest/40 mt-2 ml-4">This will be the unique URL: /green-valley</p>
                        </div>

                        {/* Owner search */}
                        <div className="border-t border-farm-bark/30 pt-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-farm-forest/40 mb-5">Assign Owner (Optional)</p>
                            <div ref={ownerSearchRef} className="relative">
                                <label className="premium-label">Search User</label>
                                {selectedOwner ? (
                                    <div className="flex items-center justify-between premium-input cursor-default">
                                        <span className="text-farm-forest text-sm">
                                            <span className="font-semibold">{selectedOwner.email}</span>
                                            <span className="text-farm-forest/40 ml-2 text-xs">({selectedOwner.role})</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedOwner(null); setOwnerSearch(''); }}
                                            className="text-farm-forest/40 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <input
                                        className="premium-input"
                                        placeholder="Search by email…"
                                        value={ownerSearch}
                                        onChange={e => { setOwnerSearch(e.target.value); setShowOwnerDropdown(true); }}
                                        onFocus={() => setShowOwnerDropdown(true)}
                                    />
                                )}
                                {showOwnerDropdown && !selectedOwner && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-farm-bark/30 z-20 max-h-48 overflow-y-auto">
                                        {filteredOwnerUsers.length === 0 ? (
                                            <div className="px-4 py-3 text-farm-forest/40 text-sm italic">No users found</div>
                                        ) : filteredOwnerUsers.map(u => (
                                            <button
                                                key={u.id}
                                                type="button"
                                                onClick={() => { setSelectedOwner(u); setOwnerSearch(''); setShowOwnerDropdown(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-farm-cream transition-colors flex items-center justify-between group/opt"
                                            >
                                                <span className="text-farm-forest text-sm font-medium">{u.email}</span>
                                                <span className="text-[10px] text-farm-forest/40 font-bold uppercase tracking-widest bg-farm-bark/20 px-2 py-0.5 rounded-full">{u.role}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button disabled={loading} className="premium-btn w-full mt-4">
                            {loading ? 'Registering...' : 'Formalize Stall Registration'}
                        </button>
                    </form>
                </section>

                {/* ── Active Registry ── */}
                <section className="glass-panel p-10 md:p-14 rounded-3xl relative overflow-hidden flex flex-col h-[700px] group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-farm-pine/5 rounded-full blur-3xl -z-10 group-hover:bg-farm-pine/10 transition-colors duration-700" />
                    
                    <div className="mb-8">
                        <h2 className="text-3xl font-serif mb-2 text-farm-forest">Active Registry</h2>
                        <p className="text-farm-forest/40 font-sans text-sm">All {tenants.length} current producers.</p>
                    </div>

                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {tenants.map(t => (
                            <div key={t.id} className="p-6 bg-white rounded-2xl border border-farm-bark/50 group/item hover:border-farm-pine/20 hover:shadow-md transition-all flex flex-col gap-4 relative">
                                {editingTenantId === t.id ? (
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <label className="premium-label mb-1 block">Stall Name</label>
                                            <input className="premium-input text-sm p-3" value={editName} onChange={e => setEditName(e.target.value)} placeholder="e.g. Green Valley Farm" />
                                        </div>
                                        <div>
                                            <label className="premium-label mb-1 block">Market Slug</label>
                                            <input className="premium-input text-sm p-3" value={editSlug} onChange={e => setEditSlug(e.target.value)} placeholder="e.g. green-valley" />
                                        </div>
                                        <div>
                                            <label className="premium-label mb-1 block">Owner</label>
                                            <div ref={editOwnerSearchRef} className="relative">
                                                {editOwnerSelected ? (
                                                    <div className="flex items-center justify-between premium-input text-sm p-3 cursor-default">
                                                        <span className="text-farm-forest">
                                                            <span className="font-semibold">{editOwnerSelected.email}</span>
                                                            <span className="text-farm-forest/40 ml-2 text-xs">({editOwnerSelected.role})</span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setEditOwnerSelected(null); setEditOwnerSearch(''); }}
                                                            className="text-farm-forest/40 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <input
                                                        className="premium-input text-sm p-3"
                                                        placeholder="Search by email…"
                                                        value={editOwnerSearch}
                                                        onChange={e => { setEditOwnerSearch(e.target.value); setShowEditOwnerDropdown(true); }}
                                                        onFocus={() => setShowEditOwnerDropdown(true)}
                                                    />
                                                )}
                                                {showEditOwnerDropdown && !editOwnerSelected && (
                                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-farm-bark/30 z-20 max-h-48 overflow-y-auto">
                                                        {filteredEditOwnerUsers.length === 0 ? (
                                                            <div className="px-4 py-3 text-farm-forest/40 text-sm italic">No users found</div>
                                                        ) : filteredEditOwnerUsers.map(u => (
                                                            <button
                                                                key={u.id}
                                                                type="button"
                                                                onClick={() => { setEditOwnerSelected(u); setEditOwnerSearch(''); setShowEditOwnerDropdown(false); }}
                                                                className="w-full text-left px-4 py-3 hover:bg-farm-cream transition-colors flex items-center justify-between group/opt"
                                                            >
                                                                <span className="text-farm-forest text-sm font-medium">{u.email}</span>
                                                                <span className="text-[10px] text-farm-forest/40 font-bold uppercase tracking-widest bg-farm-bark/20 px-2 py-0.5 rounded-full">{u.role}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => handleSaveEdit(t.id)} className="px-4 py-2 bg-farm-pine text-white text-xs font-bold uppercase tracking-widest rounded-lg flex-1 hover:bg-farm-forest transition-colors">Save</button>
                                            <button onClick={() => setEditingTenantId(null)} className="px-4 py-2 bg-farm-bark/20 text-farm-forest text-xs font-bold uppercase tracking-widest rounded-lg flex-1 hover:bg-farm-bark/40 transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                ) : ownerEditId === t.id ? (
                                    /* Owner assignment panel */
                                    <div className="flex flex-col gap-3">
                                        <p className="text-xs font-bold uppercase tracking-widest text-farm-forest/50">Set Owner for <span className="text-farm-forest">{t.name}</span></p>
                                        <div className="relative">
                                            {ownerEditSelected ? (
                                                <div className="flex items-center justify-between premium-input cursor-default">
                                                    <span className="text-farm-forest text-sm font-semibold">{ownerEditSelected.email}</span>
                                                    <button type="button" onClick={() => { setOwnerEditSelected(null); setOwnerEditSearch(''); }} className="text-farm-forest/40 hover:text-red-500 ml-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <input
                                                    autoFocus
                                                    className="premium-input text-sm"
                                                    placeholder="Search user by email…"
                                                    value={ownerEditSearch}
                                                    onChange={e => { setOwnerEditSearch(e.target.value); setShowOwnerEditDropdown(true); }}
                                                    onFocus={() => setShowOwnerEditDropdown(true)}
                                                />
                                            )}
                                            {showOwnerEditDropdown && !ownerEditSelected && (
                                                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-farm-bark/30 z-20 max-h-36 overflow-y-auto">
                                                    {filteredOwnerEditUsers.length === 0 ? (
                                                        <div className="px-4 py-3 text-farm-forest/40 text-sm italic">No users found</div>
                                                    ) : filteredOwnerEditUsers.map(u => (
                                                        <button key={u.id} type="button"
                                                            onClick={() => { setOwnerEditSelected(u); setOwnerEditSearch(''); setShowOwnerEditDropdown(false); }}
                                                            className="w-full text-left px-4 py-2.5 hover:bg-farm-cream text-sm text-farm-forest font-medium transition-colors flex justify-between items-center"
                                                        >
                                                            {u.email}
                                                            <span className="text-[10px] text-farm-forest/40 font-bold uppercase tracking-widest">{u.role}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleSaveOwner(t.id)} className="px-4 py-2 bg-farm-pine text-white text-xs font-bold uppercase tracking-widest rounded-lg flex-1 hover:bg-farm-forest transition-colors">
                                                {ownerEditSelected ? 'Set Owner' : 'Clear Owner'}
                                            </button>
                                            <button onClick={() => setOwnerEditId(null)} className="px-4 py-2 bg-farm-bark/20 text-farm-forest text-xs font-bold uppercase tracking-widest rounded-lg flex-1 hover:bg-farm-bark/40 transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-farm-cream flex items-center justify-center font-serif font-bold text-farm-pine text-lg border border-farm-bark overflow-hidden">
                                                {t.icon_url?.Valid ? (
                                                    <img src={t.icon_url.String} alt={`${t.name} icon`} className="w-full h-full object-cover" />
                                                ) : (
                                                    t.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-lg font-serif mb-0.5 text-farm-forest">{t.name}</div>
                                                <div className="text-[10px] text-farm-gold font-bold uppercase tracking-widest bg-farm-gold/10 px-2 py-0.5 rounded-full inline-block">/{t.slug}</div>
                                                {t.owner_id ? (
                                                    <div className="text-[10px] text-farm-pine font-semibold mt-1 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                        {getOwnerEmail(t)}
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] text-farm-forest/30 mt-1">No owner</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-[10px] text-farm-forest/40 font-bold uppercase tracking-widest text-right">
                                                Enrolled <br/> <span className="text-farm-forest/80 font-sans font-medium">{formatDate(t.created_at)}</span>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                {/* Set Owner */}
                                                <button onClick={() => startOwnerEdit(t)} title="Set Owner" className="text-farm-pine hover:text-farm-gold transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </button>
                                                {/* Edit */}
                                                <button onClick={() => startEdit(t)} title="Edit" className="text-farm-pine hover:text-farm-gold transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                {/* Delete */}
                                                <button onClick={() => handleDelete(t.id)} title="Delete" className="text-red-400 hover:text-red-600 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {tenants.length === 0 && (
                            <div className="py-24 text-center text-farm-forest/30 italic font-serif text-xl border-2 border-dashed border-farm-bark rounded-2xl">
                                No stalls currently registered in the ledger.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

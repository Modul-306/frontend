'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotify } from '@/context/NotificationContext';
import { formatCurrency, formatLongDate } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ShoppingBag, Star, MessageSquare, Download, User as UserIcon, MapPin, Settings, CheckCircle, Mail } from 'lucide-react';

interface Order {
    id: string;
    total_amount: string;
    status: string;
    created_at: string;
}

export default function UserProfile() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { notify } = useNotify();
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [loyalty, setLoyalty] = useState<{tier: string, discount_percent: string} | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile Form State
    const [fullName, setFullName] = useState('');
    const [street, setStreet] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [city, setCity] = useState('');

    useEffect(() => {
        if (user) {
            fetchOrders();
            fetchLoyalty();
            fetchProfile();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('orders/my');
            setOrders(res.data || []);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLoyalty = async () => {
        try {
            const res = await api.get('loyalty');
            setLoyalty(res.data);
        } catch (err) {
            console.error('Failed to fetch loyalty', err);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('auth/profile');
            setFullName(res.data.full_name || '');
            setStreet(res.data.street || '');
            setZipCode(res.data.zip_code || '');
            setCity(res.data.city || '');
        } catch (err) {
            console.error('Failed to fetch profile', err);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('auth/profile', { 
                full_name: fullName, 
                street,
                zip_code: zipCode,
                city
            });
            notify(t.profile.update_success, 'success');
        } catch (err) {
            notify(t.profile.update_error, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadInvoice = async (order: Order) => {
        try {
            const res = await api.get(`orders/${order.id}`);
            const items = res.data || [];
            
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.text(t.profile.invoice_title, 20, 20);
            
            doc.setFontSize(10);
            doc.text(`${t.admin.orders.order_id}: ${order.id}`, 20, 30);
            doc.text(`${t.global_admin.date_col}: ${formatLongDate(order.created_at)}`, 20, 35);
            doc.text(`${t.profile.customer}: ${user?.email}`, 20, 40);
            
            const tableData = items.map((item: any) => [
                item.product_name,
                item.quantity,
                formatCurrency(item.price_at_time),
                formatCurrency(parseFloat(item.price_at_time) * item.quantity)
            ]);
            
            autoTable(doc, {
                startY: 50,
                head: [[
                    t.admin.inventory.name, 
                    t.profile.qty, 
                    t.admin.inventory.price, 
                    t.shop.total
                ]],
                body: tableData,
                foot: [['', '', t.profile.grand_total, formatCurrency(order.total_amount)]],
                theme: 'striped',
                headStyles: { fillColor: [22, 78, 53] }
            });
            
            doc.save(`invoice_${order.id.slice(0, 8)}.pdf`);
        } catch (err) {
            console.error('Failed to download invoice', err);
        }
    };

    if (!user) return null;

    return (
        <div className="container mx-auto px-8 py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-16">
                <span className="premium-badge-gold mb-4 inline-block">{t.profile.title}</span>
                <h1 className="text-5xl font-serif text-farm-forest mb-4">
                    {fullName || user.email.split('@')[0]}
                </h1>
                <p className="text-farm-forest/40 uppercase tracking-widest text-xs font-bold">{t.profile.member_badge}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <section className="lg:col-span-2 space-y-12">
                    {/* Profile Settings */}
                    <div className="glass-panel p-8 md:p-12 rounded-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-farm-gold/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
                        
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-farm-gold/10 rounded-2xl text-farm-gold"><Settings size={24} /></div>
                            <h2 className="text-3xl font-serif text-farm-forest">{t.profile.settings}</h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="premium-label flex items-center gap-2">
                                        <UserIcon size={14} />
                                        {t.profile.full_name}
                                    </label>
                                    <input 
                                        type="text" 
                                        className="premium-input" 
                                        placeholder={t.profile.name_placeholder}
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3 text-farm-forest/40">
                                    <label className="premium-label flex items-center gap-2">
                                        <Mail size={14} />
                                        {t.auth.email}
                                    </label>
                                    <input type="text" className="premium-input bg-farm-bark/10 cursor-not-allowed" value={user.email} disabled />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="premium-label flex items-center gap-2">
                                    <MapPin size={14} />
                                    {t.profile.street}
                                </label>
                                <input 
                                    type="text"
                                    className="premium-input" 
                                    placeholder={t.profile.street_placeholder}
                                    value={street}
                                    onChange={e => setStreet(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="premium-label">{t.profile.zip_code}</label>
                                    <input 
                                        type="text"
                                        className="premium-input" 
                                        placeholder={t.profile.zip_placeholder}
                                        value={zipCode}
                                        onChange={e => setZipCode(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="premium-label">{t.profile.city}</label>
                                    <input 
                                        type="text"
                                        className="premium-input" 
                                        placeholder={t.profile.city_placeholder}
                                        value={city}
                                        onChange={e => setCity(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={saving}
                                className="premium-btn flex items-center gap-3 px-10"
                            >
                                {saving ? t.common.loading : (
                                    <>
                                        <CheckCircle size={18} />
                                        {t.common.save}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Order History */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-farm-pine/10 rounded-2xl text-farm-pine"><ShoppingBag size={24} /></div>
                            <h2 className="text-3xl font-serif text-farm-forest">{t.profile.history_title}</h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-pine"></div>
                            </div>
                        ) : orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="glass-panel p-8 rounded-3xl hover:border-farm-gold/30 transition-all group">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40 mb-1">{t.admin.orders.order_id}: {order.id.slice(0, 8)}</p>
                                                <p className="text-xl font-serif text-farm-forest">{formatLongDate(order.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase text-farm-forest/40 mb-1">{t.shop.total}</p>
                                                    <p className="text-lg font-bold text-farm-pine">{formatCurrency(order.total_amount)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase text-farm-forest/40 mb-1">{t.admin.orders.status}</p>
                                                    <span className={`text-[10px] px-3 py-1 rounded-full uppercase font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={() => handleDownloadInvoice(order)}
                                                    className="p-3 bg-farm-bark/10 text-farm-forest/40 hover:text-farm-pine hover:bg-farm-pine/10 rounded-2xl transition-all"
                                                    title={t.profile.download_invoice}
                                                >
                                                    <Download size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-panel p-20 rounded-3xl text-center">
                                <p className="text-xl font-serif italic text-farm-forest/30 mb-8">{t.profile.no_orders}</p>
                                <button onClick={() => window.location.href = '/'} className="premium-btn">{t.profile.start_browsing}</button>
                            </div>
                        )}
                    </div>
                </section>

                <aside className="space-y-8">
                    <div className="p-8 rounded-3xl bg-farm-forest text-farm-cream border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-farm-gold/10 rounded-full blur-2xl" />
                        <h3 className="text-2xl font-serif mb-6">{t.profile.loyalty_status}</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-farm-cream/60">{t.profile.tier}</span>
                                <span className="font-bold text-farm-gold uppercase tracking-widest">{loyalty?.tier || t.profile.harvest_elite}</span>
                            </div>
                            {loyalty && parseFloat(loyalty.discount_percent) > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-farm-cream/60">{t.profile.active_discount}</span>
                                    <span className="font-bold text-green-400">{loyalty.discount_percent}%</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-farm-cream/60">{t.profile.total_spent}</span>
                                <span className="font-bold">{formatCurrency(orders.reduce((acc, o) => acc + parseFloat(o.total_amount), 0))}</span>
                            </div>
                            <div className="pt-6 border-t border-farm-cream/10">
                                <p className="text-xs text-farm-cream/60 leading-relaxed italic">
                                    "{t.profile.loyalty_quote}"
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl">
                        <h3 className="text-xl font-serif mb-6 text-farm-forest border-b pb-4 flex items-center gap-2">
                            <Star size={18} className="text-farm-gold" />
                            {t.profile.write_review}
                        </h3>
                        <p className="text-sm text-farm-forest/60 mb-6">
                            {t.profile.review_desc}
                        </p>
                        <button onClick={() => window.location.href = '/#directory'} className="premium-btn-outline w-full !text-xs">{t.profile.browse_products}</button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

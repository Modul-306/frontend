'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Product, Blog, Order, OrderItem } from '@/types';
import { formatLongDate, formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useNotify } from '@/context/NotificationContext';

export default function Admin() {
    const { t, locale } = useLanguage();
    const { notify } = useNotify();
    const [activeTab, setActiveTab] = useState<'storefront' | 'inventory' | 'journal' | 'orders'>('storefront');
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [productName, setProductName] = useState('');
    const [productDesc, setProductDesc] = useState('');
    const [productPrice, setProductPrice] = useState<number | ''>('');
    const [productStock, setProductStock] = useState<number | ''>('');
    const [productImage, setProductImage] = useState<File | null>(null);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);

    const [blogTitle, setBlogTitle] = useState('');
    const [blogContent, setBlogContent] = useState('');
    const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

    const [coverUrl, setCoverUrl] = useState('');
    const [description, setDescription] = useState('');

    // Data States
    const [products, setProducts] = useState<Product[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
    const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'inventory') fetchProducts();
        if (activeTab === 'journal') fetchBlogs();
        if (activeTab === 'orders') fetchOrders();
    }, [activeTab]);

    const fetchProducts = async () => {
        try {
            const res = await api.get('products');
            setProducts(res.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchBlogs = async () => {
        try {
            const res = await api.get('blogs');
            setBlogs(res.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('orders');
            setOrders(res.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchOrderDetails = async (orderId: string) => {
        try {
            const res = await api.get(`orders/${orderId}`);
            setSelectedOrderItems(res.data || []);
            setViewingOrderId(orderId);
        } catch (err) { console.error(err); }
    };

    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            await api.put(`orders/${orderId}/status`, { status });
            notify(t.admin.orders.status_success, 'success');
            fetchOrders();
        } catch (err) { 
            notify(t.admin.orders.status_error, 'error');
        }
    };

    const handleSaveAppearance = async () => {
        setLoading(true);
        try {
            await api.put('tenants/appearance', { cover_url: coverUrl, description });
            notify(t.admin.storefront.save_success, 'success');
        } catch (err) {
            notify(t.admin.storefront.save_error, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = '';
            if (productImage) {
                const formData = new FormData();
                formData.append('file', productImage);
                const uploadRes = await api.post('upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = uploadRes.data.url;
                if (!imageUrl.startsWith('http')) {
                    imageUrl = `${window.location.origin}${imageUrl}`;
                }
            }

            const payload = {
                name: productName,
                description: productDesc,
                price: Number(productPrice),
                stock: Number(productStock),
                image_url: imageUrl || (editingProductId ? products.find(p => p.id === editingProductId)?.image_url?.String : '')
            };

            if (editingProductId) {
                await api.put(`products/${editingProductId}`, payload);
                notify(t.admin.inventory.update_success, 'success');
            } else {
                await api.post('products', payload);
                notify(t.admin.inventory.add_success, 'success');
            }
            
            setProductName('');
            setProductDesc('');
            setProductPrice('');
            setProductStock('');
            setProductImage(null);
            setEditingProductId(null);
            fetchProducts();
        } catch (err) {
            notify(t.admin.inventory.process_error, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm(t.common.are_you_sure)) return;
        try {
            await api.delete(`products/${id}`);
            notify(t.admin.inventory.delete_success, 'success');
            fetchProducts();
        } catch (err) { notify(t.admin.inventory.delete_error, 'error'); }
    };

    const handleCreateOrUpdateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { title: blogTitle, content_md: blogContent };
            if (editingBlogId) {
                await api.put(`blogs/${editingBlogId}`, payload);
                notify(t.admin.journal.update_success, 'success');
            } else {
                await api.post('blogs', payload);
                notify(t.admin.journal.publish_success, 'success');
            }
            setBlogTitle('');
            setBlogContent('');
            setEditingBlogId(null);
            fetchBlogs();
        } catch (err) {
            notify(t.admin.journal.process_error, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlog = async (id: string) => {
        if (!confirm(t.common.are_you_sure)) return;
        try {
            await api.delete(`blogs/${id}`);
            notify(t.admin.journal.delete_success, 'success');
            fetchBlogs();
        } catch (err) { notify(t.admin.journal.delete_error, 'error'); }
    };

    return (
        <div className="container mx-auto px-8 py-12">
            <header className="mb-12 text-center">
                <span className="premium-badge-gold mb-4 inline-block">{t.admin.dashboard_badge}</span>
                <h1 className="text-4xl md:text-5xl mb-4 font-serif text-farm-forest">{t.admin.workbench}</h1>
                
                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                    {(Object.keys(t.admin.tabs) as Array<keyof typeof t.admin.tabs>).map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as any)}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === key ? 'bg-farm-forest text-farm-cream shadow-lg' : 'bg-farm-bark/10 text-farm-forest/60 hover:bg-farm-bark/20'}`}
                        >
                            {t.admin.tabs[key]}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                {activeTab === 'storefront' && (
                    <section className="glass-panel p-10 rounded-3xl animate-in fade-in duration-500">
                        <h2 className="text-2xl font-serif mb-8 text-farm-forest border-b pb-4">{t.admin.storefront.title}</h2>
                        <div className="grid gap-8">
                            <div>
                                <label className="premium-label mb-2 block">{t.admin.storefront.logo}</label>
                                <input type="file" onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setLoading(true);
                                    try {
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        const uploadRes = await api.post('upload', formData, {
                                            headers: { 'Content-Type': 'multipart/form-data' }
                                        });
                                        let imageUrl = uploadRes.data.url;
                                        if (!imageUrl.startsWith('http')) {
                                            imageUrl = `${window.location.origin}${imageUrl}`;
                                        }
                                        await api.put('tenants/icon', { icon_url: imageUrl });
                                        notify(t.admin.storefront.logo_success, 'success');
                                    } catch (err) {
                                        notify(t.admin.storefront.logo_error, 'error');
                                    } finally {
                                        setLoading(false);
                                    }
                                }} />
                            </div>
                            <div>
                                <label className="premium-label mb-2 block">{t.admin.storefront.cover}</label>
                                <input className="premium-input" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..." />
                            </div>
                            <div>
                                <label className="premium-label mb-2 block">{t.admin.storefront.description}</label>
                                <textarea className="premium-input h-24" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <button onClick={handleSaveAppearance} disabled={loading} className="premium-btn max-w-xs">{loading ? t.common.loading : t.common.save}</button>
                        </div>
                    </section>
                )}

                {activeTab === 'inventory' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
                        <section className="glass-panel p-8 rounded-3xl h-fit">
                            <h2 className="text-2xl font-serif mb-6 text-farm-forest">{editingProductId ? t.admin.inventory.edit : t.admin.inventory.add_new}</h2>
                            <form onSubmit={handleAddOrUpdateProduct} className="space-y-6">
                                <input className="premium-input" placeholder={t.admin.inventory.name} value={productName} onChange={e => setProductName(e.target.value)} required />
                                <textarea className="premium-input h-24" placeholder={t.admin.inventory.desc} value={productDesc} onChange={e => setProductDesc(e.target.value)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="premium-input" type="number" placeholder={t.admin.inventory.price} value={productPrice} onChange={e => setProductPrice(Number(e.target.value))} required />
                                    <input className="premium-input" type="number" placeholder={t.admin.inventory.stock} value={productStock} onChange={e => setProductStock(Number(e.target.value))} required />
                                </div>
                                <input type="file" onChange={e => setProductImage(e.target.files?.[0] || null)} />
                                <div className="flex gap-2">
                                    <button disabled={loading} className="premium-btn flex-1">{editingProductId ? t.common.save : t.common.confirm}</button>
                                    {editingProductId && <button type="button" onClick={() => setEditingProductId(null)} className="premium-btn-outline">{t.common.cancel}</button>}
                                </div>
                            </form>
                        </section>
                        
                        <section className="space-y-4">
                            <h2 className="text-2xl font-serif mb-6 text-farm-forest">{t.admin.inventory.current}</h2>
                            {products.map(p => (
                                <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-farm-bark/20 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-farm-bark/10 rounded-lg overflow-hidden">
                                            {p.image_url?.Valid && <img src={p.image_url.String} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{p.name}</h4>
                                            <p className="text-xs text-farm-forest/50">{formatCurrency(p.price)} | {p.stock} {t.admin.inventory.units}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => {
                                            setEditingProductId(p.id);
                                            setProductName(p.name);
                                            setProductDesc(p.description?.String || '');
                                            setProductPrice(Number(p.price));
                                            setProductStock(p.stock);
                                        }} className="text-farm-pine hover:underline text-xs font-bold">{t.common.edit}</button>
                                        <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:underline text-xs font-bold">{t.common.delete}</button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>
                )}

                {activeTab === 'journal' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
                        <section className="glass-panel p-8 rounded-3xl h-fit">
                            <h2 className="text-2xl font-serif mb-6 text-farm-forest">{editingBlogId ? t.admin.journal.edit_entry : t.admin.journal.new_entry}</h2>
                            <form onSubmit={handleCreateOrUpdateBlog} className="space-y-6">
                                <input className="premium-input" placeholder={t.admin.journal.title} value={blogTitle} onChange={e => setBlogTitle(e.target.value)} required />
                                <textarea className="premium-input h-64" placeholder={t.admin.journal.content} value={blogContent} onChange={e => setBlogContent(e.target.value)} required />
                                <div className="flex gap-2">
                                    <button disabled={loading} className="premium-btn flex-1">{editingBlogId ? t.common.save : t.common.confirm}</button>
                                    {editingBlogId && <button type="button" onClick={() => setEditingBlogId(null)} className="premium-btn-outline">{t.common.cancel}</button>}
                                </div>
                            </form>
                        </section>
                        
                        <section className="space-y-4">
                            <h2 className="text-2xl font-serif mb-6 text-farm-forest">{t.admin.journal.past_entries}</h2>
                            {blogs.map(b => (
                                <div key={b.id} className="bg-white p-4 rounded-2xl shadow-sm border border-farm-bark/20 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-sm">{b.title}</h4>
                                        <p className="text-[10px] text-farm-forest/50 uppercase tracking-widest">{formatLongDate(b.published_at)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => {
                                            setEditingBlogId(b.id);
                                            setBlogTitle(b.title);
                                            setBlogContent(b.content_md);
                                        }} className="text-farm-pine hover:underline text-xs font-bold">{t.common.edit}</button>
                                        <button onClick={() => handleDeleteBlog(b.id)} className="text-red-400 hover:underline text-xs font-bold">{t.common.delete}</button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <section className="animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 space-y-4">
                                <h2 className="text-2xl font-serif mb-6 text-farm-forest">{t.admin.orders.title}</h2>
                                {orders.map(o => (
                                    <div key={o.id} onClick={() => fetchOrderDetails(o.id)} className={`cursor-pointer p-6 rounded-3xl border transition-all ${viewingOrderId === o.id ? 'bg-farm-forest text-farm-cream border-farm-forest shadow-xl scale-[1.02]' : 'bg-white border-farm-bark/20 hover:border-farm-pine'}`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${viewingOrderId === o.id ? 'text-farm-gold' : 'text-farm-forest/40'}`}>{t.admin.orders.order_id}: {o.id.slice(0, 8)}</p>
                                                <p className="font-serif text-lg">{formatLongDate(o.created_at)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{formatCurrency(o.total_amount)}</p>
                                                <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${o.status === 'completed' ? 'bg-green-100 text-green-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {o.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="xl:col-span-1">
                                {viewingOrderId ? (
                                    <div className="glass-panel p-8 rounded-3xl sticky top-24">
                                        <h3 className="font-serif text-xl mb-6 border-b pb-4">{t.admin.orders.details}</h3>
                                        <div className="space-y-4 mb-8">
                                            {selectedOrderItems.map(item => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span>{item.quantity}x {item.product_name}</span>
                                                    <span className="font-bold">{formatCurrency(parseFloat(item.price_at_time) * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t pt-6 space-y-4">
                                            <p className="text-xs font-bold uppercase text-farm-forest/40">{t.admin.orders.status}</p>
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => handleUpdateOrderStatus(viewingOrderId, 'completed')} className="premium-btn text-xs py-2 bg-green-600 border-green-600">{t.admin.orders.mark_completed}</button>
                                                <button onClick={() => handleUpdateOrderStatus(viewingOrderId, 'cancelled')} className="premium-btn-outline text-xs py-2 text-red-500 border-red-200">{t.admin.orders.cancel_order}</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass-panel p-12 rounded-3xl text-center text-farm-forest/30 italic">
                                        {t.admin.orders.select_order}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

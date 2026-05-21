'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Product, Blog, Order, OrderItem } from '@/types';
import { formatLongDate, formatCurrency } from '@/lib/utils';

export default function Admin() {
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
            fetchOrders();
        } catch (err) { console.error(err); }
    };

    const handleSaveAppearance = async () => {
        setLoading(true);
        try {
            await api.put('tenants/appearance', { cover_url: coverUrl, description });
            alert('Appearance saved successfully!');
        } catch (err) {
            alert('Error saving appearance.');
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
                alert('Product updated!');
            } else {
                await api.post('products', payload);
                alert('Product added!');
            }
            
            setProductName('');
            setProductDesc('');
            setProductPrice('');
            setProductStock('');
            setProductImage(null);
            setEditingProductId(null);
            fetchProducts();
        } catch (err) {
            alert('Error processing product.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`products/${id}`);
            fetchProducts();
        } catch (err) { alert('Error deleting product.'); }
    };

    const handleCreateOrUpdateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { title: blogTitle, content_md: blogContent };
            if (editingBlogId) {
                await api.put(`blogs/${editingBlogId}`, payload);
                alert('Blog updated!');
            } else {
                await api.post('blogs', payload);
                alert('Blog published!');
            }
            setBlogTitle('');
            setBlogContent('');
            setEditingBlogId(null);
            fetchBlogs();
        } catch (err) {
            alert('Error processing blog.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlog = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`blogs/${id}`);
            fetchBlogs();
        } catch (err) { alert('Error deleting blog.'); }
    };

    return (
        <div className="container mx-auto px-8 py-12">
            <header className="mb-12 text-center">
                <span className="premium-badge-gold mb-4 inline-block">Producer Dashboard</span>
                <h1 className="text-4xl md:text-5xl mb-4 font-serif text-farm-forest">Workbench</h1>
                
                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                    {['storefront', 'inventory', 'journal', 'orders'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-farm-forest text-farm-cream shadow-lg' : 'bg-farm-bark/10 text-farm-forest/60 hover:bg-farm-bark/20'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                {activeTab === 'storefront' && (
                    <section className="glass-panel p-10 rounded-3xl animate-in fade-in duration-500">
                        <h2 className="text-2xl font-serif mb-8 text-farm-forest border-b pb-4">Storefront Appearance</h2>
                        <div className="grid gap-8">
                            <div>
                                <label className="premium-label mb-2 block">Farm Icon (Logo)</label>
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
                                        alert('Logo updated!');
                                    } catch (err) {
                                        alert('Error updating icon.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }} />
                            </div>
                            <div>
                                <label className="premium-label mb-2 block">Hero Cover Image URL</label>
                                <input className="premium-input" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..." />
                            </div>
                            <div>
                                <label className="premium-label mb-2 block">Farm Description</label>
                                <textarea className="premium-input h-24" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <button onClick={handleSaveAppearance} disabled={loading} className="premium-btn max-w-xs">{loading ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </section>
                )}

                {activeTab === 'inventory' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
                        <section className="glass-panel p-8 rounded-3xl h-fit">
                            <h2 className="text-2xl font-serif mb-6 text-farm-forest">{editingProductId ? 'Edit Item' : 'Add New Item'}</h2>
                            <form onSubmit={handleAddOrUpdateProduct} className="space-y-6">
                                <input className="premium-input" placeholder="Name" value={productName} onChange={e => setProductName(e.target.value)} required />
                                <textarea className="premium-input h-24" placeholder="Description" value={productDesc} onChange={e => setProductDesc(e.target.value)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="premium-input" type="number" placeholder="Price" value={productPrice} onChange={e => setProductPrice(Number(e.target.value))} required />
                                    <input className="premium-input" type="number" placeholder="Stock" value={productStock} onChange={e => setProductStock(Number(e.target.value))} required />
                                </div>
                                <input type="file" onChange={e => setProductImage(e.target.files?.[0] || null)} />
                                <div className="flex gap-2">
                                    <button disabled={loading} className="premium-btn flex-1">{editingProductId ? 'Update' : 'Add'}</button>
                                    {editingProductId && <button type="button" onClick={() => setEditingProductId(null)} className="premium-btn-outline">Cancel</button>}
                                </div>
                            </form>
                        </section>
                        
                        <section className="space-y-4">
                            <h2 className="text-2xl font-serif mb-6 text-farm-forest">Current Inventory</h2>
                            {products.map(p => (
                                <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-farm-bark/20 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-farm-bark/10 rounded-lg overflow-hidden">
                                            {p.image_url?.Valid && <img src={p.image_url.String} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{p.name}</h4>
                                            <p className="text-xs text-farm-forest/50">{formatCurrency(p.price)} | {p.stock} units</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => {
                                            setEditingProductId(p.id);
                                            setProductName(p.name);
                                            setProductDesc(p.description?.String || '');
                                            setProductPrice(Number(p.price));
                                            setProductStock(p.stock);
                                        }} className="text-farm-pine hover:underline text-xs font-bold">Edit</button>
                                        <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:underline text-xs font-bold">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>
                )}

                {activeTab === 'journal' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
                        <section className="glass-panel p-8 rounded-3xl h-fit">
                            <h2 className="text-2xl font-serif mb-6 text-farm-forest">{editingBlogId ? 'Edit Entry' : 'New Journal Entry'}</h2>
                            <form onSubmit={handleCreateOrUpdateBlog} className="space-y-6">
                                <input className="premium-input" placeholder="Title" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} required />
                                <textarea className="premium-input h-64" placeholder="Content (Markdown)" value={blogContent} onChange={e => setBlogContent(e.target.value)} required />
                                <div className="flex gap-2">
                                    <button disabled={loading} className="premium-btn flex-1">{editingBlogId ? 'Update' : 'Publish'}</button>
                                    {editingBlogId && <button type="button" onClick={() => setEditingBlogId(null)} className="premium-btn-outline">Cancel</button>}
                                </div>
                            </form>
                        </section>
                        
                        <section className="space-y-4">
                            <h2 className="text-2xl font-serif mb-6 text-farm-forest">Past Entries</h2>
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
                                        }} className="text-farm-pine hover:underline text-xs font-bold">Edit</button>
                                        <button onClick={() => handleDeleteBlog(b.id)} className="text-red-400 hover:underline text-xs font-bold">Delete</button>
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
                                <h2 className="text-2xl font-serif mb-6 text-farm-forest">Customer Orders</h2>
                                {orders.map(o => (
                                    <div key={o.id} onClick={() => fetchOrderDetails(o.id)} className={`cursor-pointer p-6 rounded-3xl border transition-all ${viewingOrderId === o.id ? 'bg-farm-forest text-farm-cream border-farm-forest shadow-xl scale-[1.02]' : 'bg-white border-farm-bark/20 hover:border-farm-pine'}`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${viewingOrderId === o.id ? 'text-farm-gold' : 'text-farm-forest/40'}`}>Order ID: {o.id.slice(0, 8)}</p>
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
                                        <h3 className="font-serif text-xl mb-6 border-b pb-4">Order Details</h3>
                                        <div className="space-y-4 mb-8">
                                            {selectedOrderItems.map(item => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span>{item.quantity}x {item.product_name}</span>
                                                    <span className="font-bold">{formatCurrency(parseFloat(item.price_at_time) * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t pt-6 space-y-4">
                                            <p className="text-xs font-bold uppercase text-farm-forest/40">Change Status</p>
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => handleUpdateOrderStatus(viewingOrderId, 'completed')} className="premium-btn text-xs py-2 bg-green-600 border-green-600">Mark Completed</button>
                                                <button onClick={() => handleUpdateOrderStatus(viewingOrderId, 'cancelled')} className="premium-btn-outline text-xs py-2 text-red-500 border-red-200">Cancel Order</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass-panel p-12 rounded-3xl text-center text-farm-forest/30 italic">
                                        Select an order to view details.
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

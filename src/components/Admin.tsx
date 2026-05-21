'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function Admin() {
    const [productName, setProductName] = useState('');
    const [productDesc, setProductDesc] = useState('');
    const [productPrice, setProductPrice] = useState<number | ''>('');
    const [productStock, setProductStock] = useState<number | ''>('');
    const [productImage, setProductImage] = useState<File | null>(null);
    const [blogTitle, setBlogTitle] = useState('');
    const [blogContent, setBlogContent] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSaveAppearance = async () => {
        setLoading(true);
        try {
            await api.put('tenants/appearance', { cover_url: coverUrl, description });
            alert('Appearance saved successfully!');
        } catch (err) {
            console.error('Failed to save appearance', err);
            alert('Error saving appearance.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
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

            await api.post('products', {
                name: productName,
                description: productDesc,
                price: Number(productPrice),
                stock: Number(productStock),
                image_url: imageUrl
            });
            alert('Product added successfully!');
            setProductName('');
            setProductDesc('');
            setProductPrice('');
            setProductStock('');
            setProductImage(null);
        } catch (err) {
            console.error('Failed to add product', err);
            alert('Error adding product.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('blogs', {
                title: blogTitle,
                content_md: blogContent,
            });
            alert('Blog post created successfully!');
            setBlogTitle('');
            setBlogContent('');
        } catch (err) {
            console.error('Failed to create blog', err);
            alert('Error creating blog. Check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-8 py-24">
            <header className="mb-24 text-center">
                <span className="premium-badge-gold mb-6 inline-block">Producer Dashboard</span>
                <h1 className="text-5xl md:text-6xl mb-6 font-serif">Workbench</h1>
                <div className="h-1 w-24 bg-gradient-to-r from-farm-forest to-farm-gold mx-auto mb-8 rounded-full" />
                <p className="text-farm-forest/50 font-sans text-lg max-w-2xl mx-auto font-light">Manage your seasonal inventory and community records.</p>
            </header>

            <section className="glass-panel p-10 md:p-14 rounded-3xl relative overflow-hidden mb-12 max-w-4xl mx-auto">
                <div className="absolute top-0 left-0 w-64 h-64 bg-farm-gold/5 rounded-full blur-3xl -z-10" />
                
                <div className="mb-8">
                    <h2 className="text-3xl font-serif mb-2 text-farm-forest">Storefront Settings</h2>
                    <p className="text-farm-forest/40 font-sans text-sm">Update your public farm presentation.</p>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Logo upload */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 w-full relative group/file">
                            <label className="premium-label mb-2 block">Farm Icon (Logo)</label>
                            <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 mt-8" type="file" accept="image/*" onChange={async (e) => {
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
                                    alert('Farm icon updated successfully!');
                                } catch (err) {
                                    console.error('Failed to update farm icon', err);
                                    alert('Error updating icon.');
                                } finally {
                                    setLoading(false);
                                }
                            }} />
                            <div className="w-full bg-white/50 border-2 border-dashed border-farm-bark/80 p-8 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group-hover/file:border-farm-pine group-hover/file:bg-farm-pine/5">
                                <svg className="w-6 h-6 mb-3 text-farm-forest/30 group-hover/file:text-farm-pine transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="font-sans font-bold text-xs uppercase tracking-widest text-farm-forest/50 group-hover/file:text-farm-pine transition-colors">
                                    Upload New Logo
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Cover image upload */}
                    <div>
                        <label className="premium-label mb-2 block">Hero Cover Image</label>
                        <div className="relative group/cover">
                            <input
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
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
                                        setCoverUrl(imageUrl);
                                    } catch (err) {
                                        console.error('Failed to upload cover image', err);
                                        alert('Error uploading cover image.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            />
                            <div className="w-full bg-white/50 border-2 border-dashed border-farm-bark/80 p-8 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group-hover/cover:border-farm-pine group-hover/cover:bg-farm-pine/5">
                                <svg className="w-6 h-6 mb-3 text-farm-forest/30 group-hover/cover:text-farm-pine transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="font-sans font-bold text-xs uppercase tracking-widest text-farm-forest/50 group-hover/cover:text-farm-pine transition-colors">
                                    {coverUrl ? '✓ Cover uploaded — click to change' : 'Upload Hero Cover Image'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="premium-label mb-2 block">Farm Description</label>
                        <textarea
                            className="premium-input h-28 resize-none"
                            placeholder="A short tagline shown on your public storefront..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <button
                        disabled={loading}
                        onClick={handleSaveAppearance}
                        className="premium-btn max-w-xs"
                    >
                        {loading ? 'Saving...' : 'Save Appearance'}
                    </button>
                </div>
            </section>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section className="glass-panel p-10 md:p-14 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-farm-gold/5 rounded-full blur-3xl -z-10 group-hover:bg-farm-gold/10 transition-colors duration-700" />
                    
                    <div className="mb-12">
                        <h2 className="text-3xl font-serif mb-2 text-farm-forest">Inventory Control</h2>
                        <p className="text-farm-forest/40 font-sans text-sm">Record new produce and handcrafted items.</p>
                    </div>
                    
                    <form onSubmit={handleAddProduct} className="space-y-8 relative z-10">
                        <div>
                            <label className="premium-label">Item Name</label>
                            <input className="premium-input" placeholder="e.g. Sourdough Loaf" value={productName} onChange={e => setProductName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="premium-label">Provenance & Description</label>
                            <textarea className="premium-input h-32 resize-none" placeholder="Details about growth or preparation..." value={productDesc} onChange={e => setProductDesc(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="premium-label">Price (CHF)</label>
                                <input className="premium-input" type="number" step="0.05" placeholder="0.00" value={productPrice} onChange={e => setProductPrice(Number(e.target.value))} required />
                            </div>
                            <div>
                                <label className="premium-label">Units Available</label>
                                <input className="premium-input" type="number" placeholder="0" value={productStock} onChange={e => setProductStock(Number(e.target.value))} required />
                            </div>
                        </div>
                        <div>
                            <label className="premium-label">Product Portrait</label>
                            <div className="relative group/file">
                                <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" type="file" onChange={e => setProductImage(e.target.files?.[0] || null)} />
                                <div className="w-full bg-white/50 border-2 border-dashed border-farm-bark/80 p-10 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group-hover/file:border-farm-pine group-hover/file:bg-farm-pine/5">
                                    <svg className="w-8 h-8 mb-4 text-farm-forest/30 group-hover/file:text-farm-pine transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span className="font-sans font-bold text-xs uppercase tracking-widest text-farm-forest/50 group-hover/file:text-farm-pine transition-colors">
                                        {productImage ? productImage.name : 'Upload record photo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button disabled={loading} className="premium-btn w-full mt-4">
                            {loading ? 'Recording...' : 'Update Inventory'}
                        </button>
                    </form>
                </section>

                <section className="glass-panel p-10 md:p-14 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-farm-pine/5 rounded-full blur-3xl -z-10 group-hover:bg-farm-pine/10 transition-colors duration-700" />
                    
                    <div className="mb-12">
                        <h2 className="text-3xl font-serif mb-2 text-farm-forest">Farm Journal</h2>
                        <p className="text-farm-forest/40 font-sans text-sm">Share community notes and updates.</p>
                    </div>
                    
                    <form onSubmit={handleCreateBlog} className="space-y-8 relative z-10 h-full flex flex-col">
                        <div>
                            <label className="premium-label">Headline</label>
                            <input className="premium-input font-serif text-lg" placeholder="e.g. News from the Orchard" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} required />
                        </div>
                        <div className="flex-1">
                            <label className="premium-label">Article Text</label>
                            <textarea className="premium-input h-[380px] font-sans leading-relaxed resize-none" placeholder="Write your note to the community..." value={blogContent} onChange={e => setBlogContent(e.target.value)} required />
                        </div>
                        <button disabled={loading} className="premium-btn w-full mt-4">
                            {loading ? 'Publishing...' : 'Publish to Journal'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

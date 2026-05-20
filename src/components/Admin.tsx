'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function Admin() {
    const [productName, setProductName] = useState('');
    const [productDesc, setProductDesc] = useState('');
    const [productPrice, setProductPrice] = useState(0);
    const [productStock, setProductStock] = useState(0);
    const [productImage, setProductImage] = useState<File | null>(null);
    const [blogTitle, setBlogTitle] = useState('');
    const [blogContent, setBlogContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = '';
            if (productImage) {
                const formData = new FormData();
                formData.append('file', productImage);
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = uploadRes.data.url;
                // Add the host for local display if needed, but the backend returns path
                if (!imageUrl.startsWith('http')) {
                    imageUrl = `http://localhost:9000${imageUrl}`;
                }
            }

            await api.post('/products', {
                name: productName,
                description: productDesc,
                price: productPrice,
                stock: productStock,
                image_url: imageUrl
            });
            alert('Product added successfully!');
            setProductName('');
            setProductDesc('');
            setProductPrice(0);
            setProductStock(0);
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
            await api.post('/blogs', {
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
        <div className="container mx-auto px-8 py-24 animate-in slide-in-from-bottom-4 duration-1000">
            <header className="mb-32 text-center">
                <h1 className="text-6xl md:text-7xl mb-6">Farmer's Ledger</h1>
                <div className="h-0.5 w-24 bg-farm-forest mx-auto mb-8" />
                <p className="text-farm-forest/50 font-serif italic text-xl max-w-2xl mx-auto leading-relaxed">Maintaining the seasonal inventory and community records.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <section className="bg-white border border-farm-bark p-12 md:p-16">
                    <div className="flex flex-col items-center text-center mb-16">
                        <h2 className="text-3xl uppercase tracking-[0.2em] mb-4 text-farm-forest">Inventory</h2>
                        <span className="text-farm-gold text-[10px] font-bold uppercase tracking-widest">Record New Produce</span>
                    </div>
                    
                    <form onSubmit={handleAddProduct} className="space-y-10">
                        <div className="space-y-2">
                            <label className="farm-label">Item Name</label>
                            <input className="farm-input font-serif italic" placeholder="e.g. Sourdough Loaf" value={productName} onChange={e => setProductName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="farm-label">Description / Provenance</label>
                            <textarea className="farm-input h-40 font-serif italic" placeholder="Details about growth or preparation..." value={productDesc} onChange={e => setProductDesc(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="farm-label">Price (CHF)</label>
                                <input className="farm-input font-serif" type="number" step="0.05" value={productPrice} onChange={e => setProductPrice(Number(e.target.value))} required />
                            </div>
                            <div className="space-y-2">
                                <label className="farm-label">Units in Stock</label>
                                <input className="farm-input font-serif" type="number" value={productStock} onChange={e => setProductStock(Number(e.target.value))} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="farm-label">Product Portrait</label>
                            <div className="relative group/file">
                                <input className="w-full bg-farm-cream border border-dashed border-farm-bark p-10 rounded-sm focus:border-farm-forest transition-all outline-none text-transparent cursor-pointer file:hidden" type="file" onChange={e => setProductImage(e.target.files?.[0] || null)} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-farm-forest/30 font-bold uppercase text-[10px] tracking-widest group-hover/file:text-farm-forest transition-colors text-center">
                                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {productImage ? productImage.name : 'Upload record photo'}
                                </div>
                            </div>
                        </div>
                        <button disabled={loading} className="farm-btn w-full py-4 text-xs uppercase tracking-[0.2em] mt-6">
                            {loading ? 'Recording...' : 'Update Inventory'}
                        </button>
                    </form>
                </section>

                <section className="bg-white border border-farm-bark p-12 md:p-16">
                    <div className="flex flex-col items-center text-center mb-16">
                        <h2 className="text-3xl uppercase tracking-[0.2em] mb-4 text-farm-forest">Farm Journal</h2>
                        <span className="text-farm-gold text-[10px] font-bold uppercase tracking-widest">Share a Community Note</span>
                    </div>
                    
                    <form onSubmit={handleCreateBlog} className="space-y-10">
                        <div className="space-y-2">
                            <label className="farm-label">Headline</label>
                            <input className="farm-input font-serif italic text-lg" placeholder="e.g. News from the Orchard" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="farm-label">Article Text</label>
                            <textarea className="farm-input h-[420px] font-serif italic leading-relaxed" placeholder="Write your note to the community..." value={blogContent} onChange={e => setBlogContent(e.target.value)} required />
                        </div>
                        <button disabled={loading} className="farm-btn w-full py-4 text-xs uppercase tracking-[0.2em] mt-6">
                            {loading ? 'Posting Note...' : 'Publish to Journal'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

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
        <div className="container mx-auto px-6 py-12 animate-in slide-in-from-bottom-4 duration-700">
            <header className="mb-16">
                <div className="flex items-center space-x-4 mb-2">
                    <span className="h-1 w-12 bg-accent rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Control Center</span>
                </div>
                <h1 className="text-6xl font-black text-gray-900 tracking-tighter">VOYAGERA ADMIN</h1>
                <p className="text-gray-500 font-medium text-lg mt-2">Manage your adventures and stories across South Korea.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <section className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-primary/5 border border-gray-100 transition-all hover:shadow-primary/10">
                    <div className="flex items-center space-x-6 mb-12">
                        <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary rotate-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900">Experience Hub</h2>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Travel Packages</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleAddProduct} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Package Name</label>
                            <input className="w-full bg-gray-50/50 border-2 border-transparent p-5 rounded-3xl focus:bg-white focus:border-primary/20 transition-all outline-none font-bold text-gray-700 shadow-inner" placeholder="e.g. Moonlight Palace Tour" value={productName} onChange={e => setProductName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Itinerary / Description</label>
                            <textarea className="w-full bg-gray-50/50 border-2 border-transparent p-5 rounded-3xl h-32 focus:bg-white focus:border-primary/20 transition-all outline-none font-medium text-gray-600 shadow-inner" placeholder="Detailed daily plan..." value={productDesc} onChange={e => setProductDesc(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Price (USD)</label>
                                <input className="w-full bg-gray-50/50 border-2 border-transparent p-5 rounded-3xl focus:bg-white focus:border-primary/20 transition-all outline-none font-bold text-gray-700 shadow-inner" type="number" step="0.01" value={productPrice} onChange={e => setProductPrice(Number(e.target.value))} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Max Travelers</label>
                                <input className="w-full bg-gray-50/50 border-2 border-transparent p-5 rounded-3xl focus:bg-white focus:border-primary/20 transition-all outline-none font-bold text-gray-700 shadow-inner" type="number" value={productStock} onChange={e => setProductStock(Number(e.target.value))} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Cover Image</label>
                            <div className="relative group/file">
                                <input className="w-full bg-gray-50/50 border-2 border-dashed border-gray-200 p-8 rounded-3xl focus:border-primary/20 transition-all outline-none text-transparent cursor-pointer file:hidden" type="file" onChange={e => setProductImage(e.target.files?.[0] || null)} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 font-bold uppercase text-xs tracking-widest group-hover/file:text-primary transition-colors">
                                    {productImage ? productImage.name : 'Click to upload package image'}
                                </div>
                            </div>
                        </div>
                        <button disabled={loading} className="w-full bg-primary text-white py-5 font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50">
                            {loading ? 'Finalizing...' : 'Create Experience'}
                        </button>
                    </form>
                </section>

                <section className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-secondary/5 border border-gray-100 transition-all hover:shadow-secondary/10">
                    <div className="flex items-center space-x-6 mb-12">
                        <div className="w-16 h-16 bg-secondary/10 rounded-[2rem] flex items-center justify-center text-secondary -rotate-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900">Voyage Logs</h2>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Travel Journal</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleCreateBlog} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">Journal Title</label>
                            <input className="w-full bg-gray-50/50 border-2 border-transparent p-5 rounded-3xl focus:bg-white focus:border-secondary/20 transition-all outline-none font-bold text-gray-700 shadow-inner" placeholder="e.g. My first night in Myeongdong" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">Story (Markdown)</label>
                            <textarea className="w-full bg-gray-50/50 border-2 border-transparent p-5 rounded-3xl h-[380px] focus:bg-white focus:border-secondary/20 transition-all outline-none font-medium text-gray-600 shadow-inner font-mono text-sm leading-relaxed" placeholder="Tell your adventure here..." value={blogContent} onChange={e => setBlogContent(e.target.value)} required />
                        </div>
                        <button disabled={loading} className="w-full bg-secondary text-white py-5 font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] shadow-xl shadow-secondary/20 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50">
                            {loading ? 'Publishing...' : 'Publish to Journal'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

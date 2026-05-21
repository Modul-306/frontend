'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/api';
import { Product, Blog } from '@/types';

export default function Shop() {
    const [products, setProducts] = useState<Product[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, blogsRes] = await Promise.all([
                    api.get('products'),
                    api.get('blogs'),
                ]);
                setProducts(productsRes.data || []);
                setBlogs(blogsRes.data || []);
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-16">
                <div className="absolute inset-0 bg-primary/40 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-primary/20 z-20" />
                <img 
                    src="https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&q=80&w=2000" 
                    className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-10000"
                    alt="Seoul Gyeongbokgung Palace"
                />
                <div className="relative z-30 text-center px-6">
                    <h1 className="text-6xl md:text-9xl font-black text-white drop-shadow-2xl mb-4 tracking-tighter">VOYAGERA KOREA</h1>
                    <p className="text-xl md:text-2xl text-white font-medium drop-shadow-md max-w-2xl mx-auto opacity-95">Discover the hidden gems of the morning calm land.</p>
                </div>
            </section>

            <div className="container mx-auto px-6">
                <section className="mb-24">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <span className="text-accent font-bold tracking-widest uppercase text-sm">Experiences</span>
                            <h2 className="text-5xl font-black text-gray-900">TRAVEL PACKAGES</h2>
                        </div>
                        <div className="h-2 w-32 bg-accent rounded-full mb-2" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400">
                                <div className="text-5xl mb-4">🗺️</div>
                                No travel packages available yet.
                            </div>
                        ) : products.map((product) => (
                            <div key={product.id} className="card group">
                                <div className="relative h-72 overflow-hidden">
                                    <img 
                                        src={product.image_url || `https://images.unsplash.com/photo-1533577116850-9ac6608ff28e?auto=format&fit=crop&q=80&w=400`} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                    <div className="absolute top-4 right-4 bg-accent text-white px-4 py-1.5 rounded-full font-bold shadow-xl">
                                        ${product.price}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors">{product.name}</h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Limited Spots: {product.stock}</span>
                                        <button className="bg-primary text-white py-2 px-6 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">Book Now</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-secondary/5 rounded-[4rem] p-12 md:p-24 mb-24 border border-secondary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full -ml-32 -mb-32 blur-3xl" />
                    
                    <div className="flex flex-col items-center text-center mb-16 relative z-10">
                        <span className="text-primary font-black tracking-widest uppercase text-xs mb-4">Voyage Logs</span>
                        <h2 className="text-6xl font-black text-gray-900 mb-6">TRAVELER'S JOURNAL</h2>
                        <div className="h-2 w-48 bg-primary rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                        {blogs.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-400 italic">
                                No travel stories shared yet. Be the first to explore!
                            </div>
                        ) : blogs.map((blog) => (
                            <article key={blog.id} className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 hover:border-primary/10 group">
                                <div className="flex items-center space-x-3 text-primary font-black text-xs uppercase mb-6 tracking-widest">
                                    <span className="bg-primary/10 px-3 py-1 rounded-full">{new Date(blog.published_at).toLocaleDateString()}</span>
                                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                                    <span>Adventure</span>
                                </div>
                                <h3 className="text-4xl font-black mb-6 leading-tight text-gray-900 group-hover:text-primary transition-colors cursor-pointer">{blog.title}</h3>
                                <div className="prose prose-slate max-w-none text-gray-600 line-clamp-3 mb-8 leading-relaxed">
                                    <ReactMarkdown>{blog.content_md}</ReactMarkdown>
                                </div>
                                <button className="text-primary font-black uppercase tracking-widest text-sm flex items-center group/btn">
                                    Explore More
                                    <span className="ml-3 transform group-hover/btn:translate-x-2 transition-transform">→</span>
                                </button>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

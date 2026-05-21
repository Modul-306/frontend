'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/api';
import { Product, Blog, Tenant } from '@/types';
import { formatLongDate } from '@/lib/utils';

interface ShopProps {
    tenant: Tenant | null;
}

export default function Shop({ tenant }: ShopProps) {
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-pine"></div>
        </div>
    );

    return (
        <div className="pb-32">
                    {/* Storefront Hero Cover */}
            <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
                <img 
                    src={tenant?.cover_url?.Valid && tenant.cover_url.String ? tenant.cover_url.String : "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600"}
                    alt="Farm Cover" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-farm-cream via-farm-cream/60 to-transparent" />
            </div>

            <div className="container mx-auto px-8 relative -mt-32 z-10">
                <header className="text-center mb-24 glass-panel p-12 md:p-16 rounded-3xl shadow-xl max-w-5xl mx-auto border-farm-bark">
                    <span className="premium-badge-gold mb-6 inline-block">Official Local Producer</span>
                    <h1 className="text-6xl md:text-8xl mb-6 font-serif">Market Selection</h1>
                    <div className="h-1 w-32 bg-gradient-to-r from-farm-forest to-farm-gold mx-auto mb-8 rounded-full" />
                    <p className="text-xl md:text-2xl text-farm-forest/70 max-w-2xl mx-auto font-serif italic">
                        {tenant?.description?.Valid && tenant.description.String
                            ? tenant.description.String
                            : 'Freshly harvested and prepared with care for our local community.'}
                    </p>
                </header>

                <section className="mb-40">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-4xl font-serif text-farm-forest">Current Harvest</h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40">Showing {products.length} Items</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.length === 0 ? (
                            <div className="col-span-full py-32 text-center glass-panel rounded-3xl text-farm-forest/40 italic font-serif text-2xl border-dashed">
                                "The pantry awaits its next harvest."
                            </div>
                        ) : products.map((product) => (
                            <div key={product.id} className="premium-card group flex flex-col h-full bg-white relative">
                                <div className="absolute top-4 left-4 z-10">
                                    {product.stock < 10 && product.stock > 0 ? (
                                        <span className="premium-badge bg-farm-gold text-white border-none shadow-md">Low Stock</span>
                                    ) : product.stock === 0 ? (
                                        <span className="premium-badge bg-farm-clay text-white border-none shadow-md">Sold Out</span>
                                    ) : (
                                        <span className="premium-badge bg-white/90 backdrop-blur-sm border-none shadow-sm text-farm-forest">In Season</span>
                                    )}
                                </div>
                                <div className="relative aspect-[4/5] overflow-hidden bg-farm-bark/10">
                                    <img 
                                        src={product.image_url?.Valid ? product.image_url.String : `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600`} 
                                        alt={product.name} 
                                        className="hover-scale-image" 
                                    />
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-farm-forest/80 to-transparent flex justify-between items-end">
                                        <span className="text-farm-cream font-medium text-2xl font-serif tracking-wide drop-shadow-md">CHF {product.price}</span>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl mb-3 font-serif font-medium group-hover:text-farm-pine transition-colors">{product.name}</h3>
                                    <p className="text-farm-forest/60 text-sm leading-relaxed mb-8 line-clamp-3 flex-1 font-sans">
                                        {product.description?.Valid ? product.description.String : 'Grown locally with care and tradition. A staple for any community pantry.'}
                                    </p>
                                    <button disabled={product.stock === 0} className="premium-btn w-full">Add to Basket</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-farm-bark to-transparent mb-40" />

                <section className="max-w-4xl mx-auto mb-32">
                    <div className="text-center mb-24">
                        <span className="premium-badge mb-6 inline-block">Editorial</span>
                        <h2 className="text-5xl md:text-6xl font-serif mb-6">Farm Journal</h2>
                        <p className="text-farm-forest/50 font-sans text-lg max-w-xl mx-auto">Chronicles of our daily labor, community events, and seasonal transitions.</p>
                    </div>

                    <div className="space-y-32">
                        {blogs.length === 0 ? (
                            <div className="text-center text-farm-forest/30 italic font-serif text-xl bg-white p-16 rounded-3xl border border-farm-bark/50">
                                No stories shared just yet.
                            </div>
                        ) : blogs.map((blog) => (
                            <article key={blog.id} className="group cursor-pointer">
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-farm-gold mb-6 border-b border-farm-gold pb-2">{formatLongDate(blog.published_at)}</span>
                                    <h3 className="text-5xl md:text-6xl mb-10 leading-[1.1] max-w-3xl font-serif group-hover:text-farm-pine transition-colors">{blog.title}</h3>
                                    
                                    <div className="w-full max-w-3xl glass-panel p-10 md:p-14 rounded-3xl text-left relative overflow-hidden transition-all duration-500 group-hover:shadow-xl group-hover:border-farm-pine/20">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-farm-gold/80" />
                                        <div className="prose prose-slate prose-lg max-w-none text-farm-forest/80 font-sans leading-relaxed font-light mb-12">
                                            <ReactMarkdown>{blog.content_md}</ReactMarkdown>
                                        </div>
                                        <div className="flex justify-center">
                                            <button className="premium-btn-outline !px-12">Read Full Entry</button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

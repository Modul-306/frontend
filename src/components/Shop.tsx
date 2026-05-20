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
                    api.get('/products'),
                    api.get('/blogs'),
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
        <div className="pb-32">
            {/* Simple Header */}
            <header className="container mx-auto px-8 py-24 text-center">
                <h1 className="text-6xl md:text-8xl mb-6">Market Selection</h1>
                <div className="h-0.5 w-32 bg-farm-forest mx-auto mb-8" />
                <p className="text-xl md:text-2xl text-farm-forest/60 max-w-2xl mx-auto font-serif italic">Freshly harvested and prepared with care for our local community.</p>
            </header>

            <div className="container mx-auto px-8">
                <section className="mb-32">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                        {products.length === 0 ? (
                            <div className="col-span-full py-48 text-center border border-farm-bark text-farm-forest/30 italic font-serif text-2xl">
                                "The pantry awaits its next harvest."
                            </div>
                        ) : products.map((product) => (
                            <div key={product.id} className="farm-card group">
                                <div className="relative aspect-[4/5] bg-farm-bark/10">
                                    <img 
                                        src={product.image_url?.Valid ? product.image_url.String : `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600`} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
                                    />
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-farm-forest/40 to-transparent">
                                        <span className="text-farm-cream font-bold text-lg">CHF {product.price}</span>
                                    </div>
                                </div>
                                <div className="p-8 text-center">
                                    <h3 className="text-2xl mb-4 group-hover:text-farm-gold transition-colors">{product.name}</h3>
                                    <p className="text-farm-forest/60 text-sm leading-relaxed mb-8 line-clamp-2">
                                        {product.description?.Valid ? product.description.String : 'Grown locally with care and tradition.'}
                                    </p>
                                    <button className="farm-btn w-full !text-xs uppercase tracking-[0.2em]">Add to Basket</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="h-px w-full bg-farm-bark mb-32" />

                <section className="max-w-4xl mx-auto mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl uppercase tracking-[0.2em] mb-4">Farm Updates</h2>
                        <p className="text-farm-forest/40 font-serif italic">A timeline of our daily labor and joys.</p>
                    </div>

                    <div className="space-y-24">
                        {blogs.length === 0 ? (
                            <div className="text-center text-farm-forest/30 italic font-serif text-xl">
                                No stories shared just yet.
                            </div>
                        ) : blogs.map((blog) => (
                            <article key={blog.id} className="flex flex-col items-center text-center">
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-farm-gold mb-4">{new Date(blog.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <h3 className="text-5xl mb-8 leading-tight max-w-2xl">{blog.title}</h3>
                                <div className="prose prose-slate max-w-none text-farm-forest/70 font-serif text-xl leading-relaxed italic mb-12">
                                    <ReactMarkdown>{blog.content_md}</ReactMarkdown>
                                </div>
                                <button className="farm-btn-outline !text-xs uppercase tracking-widest !px-12">Read Full Entry</button>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

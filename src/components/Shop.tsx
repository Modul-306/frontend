'use client';

import { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/api';
import { Product, Blog, Tenant, BasketItem } from '@/types';
import { formatLongDate, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotify } from '@/context/NotificationContext';
import UserAuthModal from './UserAuthModal';
import ProductReviews from './ProductReviews';

interface ShopProps {
    tenant: Tenant | null;
}

export default function Shop({ tenant }: ShopProps) {
    const { user } = useAuth();
    const { t, locale } = useLanguage();
    const { notify } = useNotify();
    const [products, setProducts] = useState<Product[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [basket, setBasket] = useState<BasketItem[]>([]);
    const [isBasketOpen, setIsBasketOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [viewingProductId, setViewingProductId] = useState<string | null>(null);
    
    // Search & Filter States
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [userLoyalty, setUserLoyalty] = useState<{tier: string, discount_percent: string} | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, blogsRes, catsRes] = await Promise.all([
                    api.get('products', { params: { search, category } }),
                    api.get('blogs'),
                    api.get('categories')
                ]);
                setProducts(productsRes.data || []);
                setBlogs(blogsRes.data || []);
                setCategories(catsRes.data || []);
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        
        if (user) {
            api.get('loyalty').then(res => setUserLoyalty(res.data)).catch(() => {});
        }

        const savedBasket = localStorage.getItem(`basket_${tenant?.slug}`);
        if (savedBasket) {
            try {
                setBasket(JSON.parse(savedBasket));
            } catch (e) {
                console.error("Failed to parse basket", e);
            }
        }
    }, [tenant?.slug, search, category]);

    useEffect(() => {
        if (tenant?.slug) {
            localStorage.setItem(`basket_${tenant.slug}`, JSON.stringify(basket));
        }
    }, [basket, tenant?.slug]);

    const addToBasket = (product: Product) => {
        setBasket(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.product.id === product.id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        notify(t.shop.added_to_basket.replace('{name}', product.name), 'success');
    };

    const removeFromBasket = (productId: string) => {
        setBasket(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setBasket(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const basketTotal = useMemo(() => {
        return basket.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0).toFixed(2);
    }, [basket]);

    const handleCheckout = async () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        setIsCheckingOut(true);
        try {
            const items = basket.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity
            }));
            await api.post('orders', { items });
            setBasket([]);
            setOrderSuccess(true);
            setIsBasketOpen(false);
            setTimeout(() => setOrderSuccess(false), 5000);
        } catch (err: any) {
            console.error("Checkout failed", err);
            const errMsg = err.response?.data?.error || t.shop.checkout_failed;
            notify(errMsg, 'error');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-pine"></div>
        </div>
    );

    return (
        <div className="pb-32 relative">
            {/* Basket Floating Toggle */}
            <button 
                onClick={() => setIsBasketOpen(true)}
                className="fixed bottom-8 right-8 z-40 bg-farm-forest text-farm-cream p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-3"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {basket.length > 0 && (
                    <span className="bg-farm-gold text-farm-forest px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {basket.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                )}
            </button>

            {/* Basket Drawer */}
            {isBasketOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsBasketOpen(false)} />
                    <div className="relative w-full max-w-md bg-farm-cream h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-8 border-b border-farm-bark/20 flex items-center justify-between">
                            <h2 className="text-3xl font-serif text-farm-forest">{t.shop.basket}</h2>
                            <button onClick={() => setIsBasketOpen(false)} className="text-farm-forest/40 hover:text-farm-forest">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {basket.length === 0 ? (
                                <div className="text-center py-20 text-farm-forest/40 italic font-serif text-xl">
                                    "{t.shop.empty_basket}"
                                </div>
                            ) : (
                                basket.map((item) => (
                                    <div key={item.product.id} className="flex gap-4 items-center">
                                        <div className="w-20 h-20 bg-farm-bark/10 rounded-xl overflow-hidden shrink-0">
                                            <img 
                                                src={item.product.image_url?.Valid ? item.product.image_url.String : `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200`} 
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-serif text-lg text-farm-forest">{item.product.name}</h4>
                                            <p className="text-xs text-farm-forest/60">{formatCurrency(item.product.price)} / {t.common.unit}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 rounded-full border border-farm-bark/30 flex items-center justify-center hover:bg-farm-bark/10 text-xs">-</button>
                                                <span className="text-xs font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 rounded-full border border-farm-bark/30 flex items-center justify-center hover:bg-farm-bark/10 text-xs">+</button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{formatCurrency(parseFloat(item.product.price) * item.quantity)}</p>
                                            <button onClick={() => removeFromBasket(item.product.id)} className="text-[10px] text-red-400 hover:text-red-600 uppercase tracking-widest mt-1">{t.common.delete}</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-8 border-t border-farm-bark/20 bg-white">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-serif text-xl">{t.shop.total}</span>
                                <span className="font-bold text-2xl text-farm-pine">{formatCurrency(basketTotal)}</span>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                disabled={basket.length === 0 || isCheckingOut}
                                className="premium-btn w-full py-4 text-sm"
                            >
                                {isCheckingOut ? t.common.loading : t.shop.checkout}
                            </button>
                            <p className="text-[10px] text-center text-farm-forest/40 uppercase tracking-widest mt-6">{t.shop.secure_payment}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {orderSuccess && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] bg-farm-pine text-farm-cream px-8 py-4 rounded-full shadow-2xl animate-in fade-in slide-in-from-top duration-500 flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-bold uppercase tracking-widest text-xs">{t.shop.order_success}</span>
                </div>
            )}

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
                    <span className="premium-badge-gold mb-6 inline-block">{t.shop.producer_badge}</span>
                    <h1 className="text-6xl md:text-8xl mb-6 font-serif">{t.shop.market_selection}</h1>
                    <div className="h-1 w-32 bg-gradient-to-r from-farm-forest to-farm-gold mx-auto mb-8 rounded-full" />
                    <p className="text-xl md:text-2xl text-farm-forest/70 max-w-2xl mx-auto font-serif italic">
                        {tenant?.description?.Valid && tenant.description.String
                            ? tenant.description.String
                            : t.shop.default_desc}
                    </p>
                    {userLoyalty && parseFloat(userLoyalty.discount_percent) > 0 && (
                        <div className="mt-8 inline-flex items-center gap-2 bg-farm-gold/10 text-farm-gold px-4 py-2 rounded-full border border-farm-gold/20 animate-pulse-soft">
                            <span className="text-xs font-bold uppercase tracking-widest">
                                {t.reviews.loyalty_reward.replace('{tier}', userLoyalty.tier).replace('{percent}', userLoyalty.discount_percent)}
                            </span>
                        </div>
                    )}
                </header>

                <section className="mb-40">
                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-12">
                        <div>
                            <h2 className="text-4xl font-serif text-farm-forest mb-2">{t.shop.harvest_title}</h2>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40">{t.shop.showing} {products.length} {t.shop.items}</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder={t.home.search_placeholder}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="premium-input !py-3 !px-6 !text-xs min-w-[250px]"
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-farm-forest/40 hover:text-farm-forest">×</button>
                                )}
                            </div>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="premium-input !py-3 !px-6 !text-xs min-w-[150px] appearance-none cursor-pointer"
                            >
                                <option value="">{t.common.all_categories}</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.length === 0 ? (
                            <div className="col-span-full py-32 text-center glass-panel rounded-3xl text-farm-forest/40 italic font-serif text-2xl border-dashed">
                                "{t.shop.no_products}"
                            </div>
                        ) : products.map((product) => (
                            <div key={product.id} className="premium-card group flex flex-col h-full bg-white relative">
                                <div className="absolute top-4 left-4 z-10">
                                    {product.stock < 10 && product.stock > 0 ? (
                                        <span className="premium-badge bg-farm-gold text-white border-none shadow-md">{t.shop.low_stock}</span>
                                    ) : product.stock === 0 ? (
                                        <span className="premium-badge bg-farm-clay text-white border-none shadow-md">{t.shop.sold_out}</span>
                                    ) : (
                                        <span className="premium-badge bg-white/90 backdrop-blur-sm border-none shadow-sm text-farm-forest">{t.shop.in_season}</span>
                                    )}
                                </div>
                                <div className="relative aspect-[4/5] overflow-hidden bg-farm-bark/10">
                                    <img 
                                        src={product.image_url?.Valid ? product.image_url.String : `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600`} 
                                        alt={product.name} 
                                        className="hover-scale-image" 
                                    />
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-farm-forest/80 to-transparent flex justify-between items-end">
                                        <span className="text-farm-cream font-medium text-2xl font-serif tracking-wide drop-shadow-md">{formatCurrency(product.price)}</span>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl mb-3 font-serif font-medium group-hover:text-farm-pine transition-colors">{product.name}</h3>
                                    <p className="text-farm-forest/60 text-sm leading-relaxed mb-8 line-clamp-3 flex-1 font-sans">
                                        {product.description?.Valid ? product.description.String : t.shop.default_product_desc}
                                    </p>
                                    <div className="space-y-3">
                                        <button 
                                            disabled={product.stock === 0} 
                                            onClick={() => addToBasket(product)}
                                            className="premium-btn w-full"
                                        >
                                            {t.shop.add_to_basket}
                                        </button>
                                        <button 
                                            onClick={() => setViewingProductId(viewingProductId === product.id ? null : product.id)}
                                            className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40 hover:text-farm-pine w-full text-center transition-colors"
                                        >
                                            {viewingProductId === product.id ? t.reviews.hide : t.reviews.view}
                                        </button>
                                    </div>
                                    {viewingProductId === product.id && (
                                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-y-auto">
                                            <div className="absolute inset-0 bg-farm-cream/95 backdrop-blur-md" onClick={() => setViewingProductId(null)} />
                                            <div className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl p-8 md:p-16 animate-in zoom-in-95 duration-500 overflow-y-auto max-h-full border border-farm-bark/10">
                                                <button 
                                                    onClick={() => setViewingProductId(null)}
                                                    className="absolute top-8 right-8 text-farm-forest/40 hover:text-farm-forest"
                                                >
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <div className="flex flex-col md:flex-row gap-12 items-center mb-16 border-b border-farm-bark/10 pb-16">
                                                    <div className="w-48 h-48 rounded-full overflow-hidden shadow-xl border-4 border-white">
                                                        <img src={product.image_url?.Valid ? product.image_url.String : `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400`} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="text-center md:text-left">
                                                        <h2 className="text-4xl md:text-6xl font-serif text-farm-forest mb-4">{product.name}</h2>
                                                        <p className="text-xl text-farm-forest/60 font-serif italic max-w-xl">{product.description?.Valid ? product.description.String : t.shop.default_product_desc}</p>
                                                    </div>
                                                </div>
                                                <ProductReviews productId={product.id} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-farm-bark to-transparent mb-40" />

                <section className="max-w-4xl mx-auto mb-32">
                    <div className="text-center mb-24">
                        <span className="premium-badge mb-6 inline-block">{t.home.editorial}</span>
                        <h2 className="text-5xl md:text-6xl font-serif mb-6">{t.shop.journal_title}</h2>
                        <p className="text-farm-forest/50 font-sans text-lg max-w-xl mx-auto">{t.shop.journal_subtitle}</p>
                    </div>

                    <div className="space-y-32">
                        {blogs.length === 0 ? (
                            <div className="text-center text-farm-forest/30 italic font-serif text-xl bg-white p-16 rounded-3xl border border-farm-bark/50">
                                {t.shop.no_stories}
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
                                            <button className="premium-btn-outline !px-12">{t.shop.read_more}</button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
            {showAuthModal && (
                <UserAuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />
            )}
        </div>
    );
}

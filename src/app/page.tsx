'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Tenant } from '@/types';
import { getYear } from '@/lib/utils';
import UserAuthModal from '@/components/UserAuthModal';
import LanguageToggle from '@/components/LanguageToggle';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { User as UserIcon, LogOut, LogIn } from 'lucide-react';

export default function RootPage() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const farmImages = [
        'photo-1500382017468-9049fed747ef', // Field
        'photo-1500076656116-558758c991c1', // Barn
        'photo-1595113316349-9fa4046a6178', // Red Barn
        'photo-1495107334309-fcf20504a5ab', // Landscape
        'photo-1523348837708-15d4a09cfac2', // Veggie Garden
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tenantsRes, catsRes] = await Promise.all([
                    api.get('tenants', { params: { search: searchQuery, category } }),
                    api.get('tenants/categories')
                ]);
                setTenants(tenantsRes.data || []);
                setCategories(catsRes.data || []);
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [searchQuery, category]);

    if (loading && tenants.length === 0) return (
        <div className="flex items-center justify-center min-h-screen bg-farm-cream">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-pine"></div>
        </div>
    );

    return (
        <main className="min-h-screen bg-farm-cream relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-farm-parchment to-transparent -z-10 pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-farm-gold/10 rounded-full blur-3xl animate-float pointer-events-none" />
            <div className="absolute top-60 -left-20 w-72 h-72 bg-farm-pine/5 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

            {/* Premium Header Nav */}
            <nav className="absolute top-0 left-0 w-full px-8 py-6 !z-[1000] flex justify-between items-center">
                <div className="text-farm-forest font-serif font-bold text-2xl tracking-tighter flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-farm-forest to-farm-pine text-farm-cream flex items-center justify-center text-sm">{t.common.brand_name.charAt(0)}</span>
                    {t.common.brand_name}
                </div>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link 
                                href="/profile" 
                                className="flex items-center gap-2 p-2 rounded-full hover:bg-farm-forest/5 transition-colors group"
                                title={t.profile.title}
                            >
                                <div className="w-8 h-8 rounded-full bg-farm-forest/10 flex items-center justify-center text-farm-forest group-hover:bg-farm-forest group-hover:text-farm-cream transition-all">
                                    <UserIcon size={18} />
                                </div>
                                <span className="text-xs font-bold text-farm-forest/70 hidden sm:block">{user.email.split('@')[0]}</span>
                            </Link>
                            <button
                                id="logout-btn"
                                onClick={logout}
                                className="text-farm-forest/40 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all duration-300"
                                title={t.common.logout}
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <button
                            id="open-auth-modal-btn"
                            onClick={() => setShowAuthModal(true)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-farm-forest/60 hover:text-farm-forest transition-all duration-300 rounded-full hover:bg-farm-forest/5"
                            title={t.common.login}
                        >
                            <LogIn size={18} />
                            <span className="hidden sm:inline">{t.common.login}</span>
                        </button>
                    )}
                </div>
            </nav>

            {/* Elevated Hero Section */}
            <section className="container mx-auto px-8 pt-48 pb-32 text-center relative z-10">
                <div className="max-w-5xl mx-auto">
                    <span className="premium-badge-gold mb-6 inline-block animate-pulse-soft">
                        {t.home.hero_badge}
                    </span>
                    <h1 className="text-6xl md:text-8xl mb-8 leading-[1.1] font-serif font-medium text-farm-forest">
                        {t.home.hero_title_1} <br />
                        <span className="italic text-farm-pine">{t.home.hero_title_2}</span>
                    </h1>
                    <div className="h-1 w-32 bg-gradient-to-r from-farm-forest to-farm-gold mx-auto rounded-full mb-10" />
                    <p className="text-xl md:text-2xl text-farm-forest/70 max-w-2xl mx-auto leading-relaxed mb-12 font-sans font-light">
                        {t.home.hero_desc}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        <a href="#directory" className="premium-btn group">
                            <span className="flex items-center gap-2">
                                {t.home.browse_btn}
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </a>
                        <Link href="/admin-login" className="premium-btn-outline">{t.home.register_farm}</Link>
                    </div>
                </div>
            </section>

            {/* Dashboard Stats */}
            <div className="container mx-auto px-8 pb-32 relative z-10">
                <div className="glass-panel rounded-3xl p-8 md:p-12 flex flex-col md:flex-row justify-around items-center gap-8 max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="text-4xl font-serif text-farm-pine mb-2">{tenants.length}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/60">{t.home.active_producers}</div>
                    </div>
                    <div className="hidden md:block w-px h-16 bg-farm-bark"></div>
                    <div className="text-center">
                        <div className="text-4xl font-serif text-farm-pine mb-2">100%</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/60">{t.home.locally_sourced}</div>
                    </div>
                    <div className="hidden md:block w-px h-16 bg-farm-bark"></div>
                    <div className="text-center">
                        <div className="text-4xl font-serif text-farm-pine mb-2">24/7</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/60">{t.home.community_access}</div>
                    </div>
                </div>
            </div>

            {/* Farm Directory */}
            <div id="directory" className="container mx-auto px-8 pb-48 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-farm-bark pb-12">
                    <div>
                        <h2 className="section-title !mb-4">{t.home.our_producers}</h2>
                        <p className="text-farm-forest/60 font-sans text-lg">{t.home.producers_subtitle}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group min-w-[300px]">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-farm-forest/40 group-focus-within:text-farm-pine transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                className="premium-input !pl-12 !py-4" 
                                placeholder={t.home.search_placeholder} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="premium-input !py-4 !px-8 cursor-pointer appearance-none bg-white min-w-[180px]"
                        >
                            <option value="">{t.common.all_categories}</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {tenants.length === 0 ? (
                        <div className="col-span-full py-32 text-center glass-panel rounded-3xl border-dashed">
                            <p className="text-xl text-farm-forest/60 font-serif italic mb-4">{t.home.no_producers}</p>
                            <button onClick={() => {setSearchQuery(''); setCategory('');}} className="text-farm-gold font-bold uppercase text-xs hover:underline">{t.home.clear_search}</button>
                        </div>
                    ) : tenants.map((tenant, index) => (
                        <Link href={`/${tenant.slug}`} key={tenant.id} className="premium-card group block flex flex-col h-full">
                            <div className="relative h-72 overflow-hidden bg-farm-bark/20">
                                <img 
                                    src={tenant.cover_url?.Valid && tenant.cover_url.String 
                                        ? tenant.cover_url.String 
                                        : `https://images.unsplash.com/${farmImages[index % farmImages.length]}?auto=format&fit=crop&q=80&w=800`}
                                    className="hover-scale-image"
                                    alt="Farm market stall"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-farm-forest/80 via-farm-forest/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                    <span className="premium-badge bg-white/90 backdrop-blur-sm border-none text-farm-forest">{t.home.featured}</span>
                                    {tenant.category?.Valid && (
                                        <span className="premium-badge-gold bg-farm-gold text-white border-none text-[8px]">{tenant.category.String}</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="p-8 pt-12 flex-1 flex flex-col bg-white relative">
                                {/* Farm Initial Avatar or Icon */}
                                <div className="absolute -top-8 left-8 w-16 h-16 rounded-full border-4 border-white bg-farm-cream flex items-center justify-center shadow-lg z-10 group-hover:-translate-y-2 transition-transform duration-500 overflow-hidden">
                                    {tenant.icon_url?.Valid ? (
                                        <img src={tenant.icon_url.String} alt={`${tenant.name} icon`} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-serif font-bold text-2xl text-farm-pine">{tenant.name.charAt(0)}</span>
                                    )}
                                </div>

                                <h3 className="text-3xl mb-3 font-serif font-medium group-hover:text-farm-pine transition-colors">{tenant.name}</h3>
                                <p className="text-farm-forest/60 text-sm leading-relaxed mb-8 flex-1">
                                    {tenant.description?.Valid && tenant.description.String
                                        ? tenant.description.String
                                        : t.home.default_farm_desc}
                                </p>
                                
                                <div className="flex items-center justify-between pt-6 border-t border-farm-bark/50">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-farm-gold" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40">
                                            {t.home.est} {getYear(tenant.created_at)}
                                        </span>
                                    </div>
                                    <span className="text-farm-pine font-bold uppercase tracking-widest text-xs flex items-center gap-1 group-hover:text-farm-gold transition-colors">
                                        {t.home.visit_store} 
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Premium Footer */}
            <footer className="bg-farm-forest pt-32 pb-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-farm-gold/30 to-transparent" />
                <div className="container mx-auto px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 text-center md:text-left">
                        <div>
                            <h2 className="text-4xl text-farm-cream font-serif mb-4">{t.common.brand_name}</h2>
                            <p className="text-farm-cream/60 max-w-sm font-sans font-light leading-relaxed">
                                {t.home.footer_desc}
                            </p>
                        </div>
                        <div className="flex gap-12">
                            <div className="flex flex-col gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-farm-gold">{t.home.platform}</span>
                                <Link href="/admin-login" className="text-sm text-farm-cream/60 hover:text-farm-cream transition-colors">{t.admin.workbench}</Link>
                                <a href="#" className="text-sm text-farm-cream/60 hover:text-farm-cream transition-colors">{t.home.browse_btn}</a>
                            </div>
                            <div className="flex flex-col gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-farm-gold">{t.home.legal}</span>
                                <a href="#" className="text-sm text-farm-cream/60 hover:text-farm-cream transition-colors">{t.home.privacy_policy}</a>
                                <a href="#" className="text-sm text-farm-cream/60 hover:text-farm-cream transition-colors">{t.home.terms_of_service}</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-farm-cream/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-farm-cream/40 text-xs">© {new Date().getFullYear()} {t.common.platform_name}. {t.home.rights_reserved}</p>
                    </div>
                </div>
            </footer>

            {/* Global Auth Modal */}
            {showAuthModal && (
                <UserAuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => {
                        setShowAuthModal(false);
                    }}
                />
            )}
        </main>
    );
}

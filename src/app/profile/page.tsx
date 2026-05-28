'use client';

import UserProfile from '@/components/UserProfile';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-farm-cream">
            <nav className="nav-premium !z-[1000] relative">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-farm-forest flex items-center justify-center text-farm-cream shadow-md group-hover:scale-105 transition-transform">
                            <ArrowLeft size={20} />
                        </div>
                        <span className="font-serif font-bold text-farm-forest uppercase tracking-widest hidden sm:block">
                            {t.common.back}
                        </span>
                    </Link>

                    <div className="text-farm-forest font-serif font-bold text-2xl tracking-tighter">
                        {t.common.brand_name}
                    </div>

                    <LanguageToggle />
                </div>
            </nav>

            <UserProfile />
        </main>
    );
}

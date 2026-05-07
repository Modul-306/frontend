'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Shop from '@/components/Shop';
import Admin from '@/components/Admin';

export default function TenantPage() {
    const { slug } = useParams();
    const [view, setView] = useState<'shop' | 'admin'>('shop');

    return (
        <main className="min-h-screen bg-background">
            <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
                        <span className="text-2xl font-black text-primary tracking-tight uppercase">{slug}</span>
                    </div>
                    
                    <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200">
                        <button 
                            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${view === 'shop' ? 'bg-white text-primary shadow-sm scale-100' : 'text-gray-500 hover:text-primary'}`} 
                            onClick={() => setView('shop')}
                        >
                            Public Shop
                        </button>
                        <button 
                            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${view === 'admin' ? 'bg-white text-primary shadow-sm scale-100' : 'text-gray-500 hover:text-primary'}`} 
                            onClick={() => setView('admin')}
                        >
                            Farmer Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <div className="transition-all duration-500">
                {view === 'shop' ? <Shop /> : <Admin />}
            </div>
        </main>
    );
}

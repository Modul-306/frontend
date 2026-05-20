'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Shop from '@/components/Shop';
import Admin from '@/components/Admin';

export default function TenantPage() {
    const { slug } = useParams();
    const [view, setView] = useState<'shop' | 'admin'>('shop');

    return (
        <main className="min-h-screen bg-farm-cream">
            <nav className="nav-humble">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-farm-forest flex items-center justify-center text-farm-cream font-serif text-xl font-bold">H</div>
                        <span className="text-3xl font-serif font-bold text-farm-forest uppercase tracking-widest">{slug}</span>
                    </div>
                    
                    <div className="flex bg-farm-bark/20 p-0.5 border border-farm-bark">
                        <button 
                            className={`px-8 py-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 ${view === 'shop' ? 'bg-farm-forest text-farm-cream shadow-sm' : 'text-farm-forest/40 hover:text-farm-forest'}`} 
                            onClick={() => setView('shop')}
                        >
                            The Shop
                        </button>
                        <button 
                            className={`px-8 py-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 ${view === 'admin' ? 'bg-farm-forest text-farm-cream shadow-sm' : 'text-farm-forest/40 hover:text-farm-forest'}`} 
                            onClick={() => setView('admin')}
                        >
                            Workbench
                        </button>
                    </div>
                </div>
            </nav>

            <div className="animate-in fade-in duration-1000">
                {view === 'shop' ? <Shop /> : <Admin />}
            </div>
        </main>
    );
}

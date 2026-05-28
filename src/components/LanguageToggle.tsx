'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
    const { locale, setLocale } = useLanguage();

    return (
        <div className="flex bg-farm-bark/10 p-1 rounded-full border border-farm-bark/20 backdrop-blur-sm">
            <button
                onClick={() => setLocale('en')}
                className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${locale === 'en' ? 'bg-white text-farm-forest shadow-sm' : 'text-farm-forest/40 hover:text-farm-forest'}`}
            >
                EN
            </button>
            <button
                onClick={() => setLocale('de')}
                className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${locale === 'de' ? 'bg-white text-farm-forest shadow-sm' : 'text-farm-forest/40 hover:text-farm-forest'}`}
            >
                DE
            </button>
        </div>
    );
}

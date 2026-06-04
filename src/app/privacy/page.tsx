'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacyPage() {
	const { t } = useLanguage();
	const router = useRouter();

	return (
		<main className="min-h-screen bg-farm-cream pb-24 text-farm-forest">
			<nav className="nav-premium relative">
				<div className="container mx-auto flex items-center justify-between">
					<button onClick={() => router.back()} className="flex items-center gap-3 group">
						<div className="w-10 h-10 rounded-full bg-farm-forest flex items-center justify-center text-farm-cream shadow-md group-hover:scale-105 transition-transform">
							<ArrowLeft size={20} />
						</div>
						<span className="font-serif font-bold text-farm-forest uppercase tracking-widest hidden sm:block">
							{t.common.back}
						</span>
					</button>

					<div className="text-farm-forest font-serif font-bold text-2xl tracking-tighter">
						{t.common.brand_name}
					</div>

					<div className="w-10 h-10"></div>
				</div>
			</nav>

			<div className="container mx-auto px-4 max-w-3xl mt-16 animate-in fade-in duration-500">
				<div className="glass-panel p-12 rounded-3xl border-farm-gold/20 shadow-xl">
					<h1 className="text-4xl font-serif mb-6 text-farm-forest border-b pb-4">Privacy Policy</h1>
					
					{/* Disclaimer Banner */}
					<div className="bg-farm-gold/10 border-2 border-farm-gold/20 rounded-2xl p-6 mb-8 text-farm-forest/90">
						<h3 className="font-serif text-lg font-bold mb-2">School Project Disclaimer</h3>
						<p className="text-sm leading-relaxed">
							This website is a **student school project** created for educational purposes. 
							**No real business operations take place here. No orders are actually processed, no payments are captured, and no products will be delivered.**
						</p>
					</div>

					<div className="space-y-6 text-sm text-farm-forest/80 leading-relaxed">
						<section>
							<h2 className="text-xl font-serif font-bold text-farm-forest mb-3">1. Data Collection</h2>
							<p>
								We do not collect or store any real personal identifying information or credit card numbers. 
								Any information entered during checkout (such as mock names and addresses) is stored solely in a local sandbox database for demonstration and grading purposes.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif font-bold text-farm-forest mb-3">2. Cookies</h2>
							<p>
								This application may use local browser storage (such as localStorage) to maintain your login session token and shopping basket. No tracking or marketing cookies are used.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif font-bold text-farm-forest mb-3">3. Third Party Services</h2>
							<p>
								This project integrates with a Payrexx test gateway instance. All transactions are simulated test payments. No actual financial credentials are sent to or processed by live servers.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif font-bold text-farm-forest mb-3">4. Your Rights</h2>
							<p>
								Since this is a simulated sandbox site, any user accounts created can be deleted or updated at any time in the user settings area.
							</p>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
}

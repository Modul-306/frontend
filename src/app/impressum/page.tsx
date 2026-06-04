'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ImpressumPage() {
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
					<h1 className="text-4xl font-serif mb-6 text-farm-forest border-b pb-4">Impressum (Legal Notice)</h1>
					
					{/* Disclaimer Banner */}
					<div className="bg-farm-gold/10 border-2 border-farm-gold/20 rounded-2xl p-6 mb-8 text-farm-forest/90">
						<h3 className="font-serif text-lg font-bold mb-2">School Project / Schoolwork</h3>
						<p className="text-sm leading-relaxed">
							This application is an educational demo developed as part of a school curriculum. 
							**There is no commercial intent, no actual service offering, and no real delivery of goods.**
						</p>
					</div>

					<div className="space-y-6 text-sm text-farm-forest/80 leading-relaxed">
						<section>
							<h2 className="text-xl font-serif font-bold text-farm-forest mb-3">Project Team</h2>
							<p className="font-bold">Modul 306 - Student Project</p>
							<p>Switzerland</p>
						</section>

						<section>
							<h2 className="text-xl font-serif font-bold text-farm-forest mb-3">Disclaimer of Liability</h2>
							<p>
								We assume no liability for the correctness, accuracy, timeliness, reliability, or completeness of the information on this website. 
								Liability claims against the authors for material or immaterial damage resulting from access to or use/non-use of the published information, 
								misuse of the connection, or technical faults are excluded. All offers are non-binding.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif font-bold text-farm-forest mb-3">Disclaimer for Links</h2>
							<p>
								References and links to third-party websites are outside our area of responsibility. We reject any responsibility for such websites. 
								Access and use of such websites are at the user's own risk.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif font-bold text-farm-forest mb-3">Copyrights</h2>
							<p>
								The copyright and all other rights to content, images, photos, or other files on this website belong exclusively to the authors or specifically named right owners. 
								The reproduction of any elements requires the prior written consent of the copyright holders.
							</p>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
}

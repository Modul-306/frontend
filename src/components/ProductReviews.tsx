'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotify } from '@/context/NotificationContext';
import { Star, MessageSquare, Send } from 'lucide-react';
import { formatLongDate } from '@/lib/utils';

interface Review {
    id: string;
    user_email: string;
    rating: number;
    comment: { String: string; Valid: boolean };
    created_at: string;
}

interface Props {
    productId: string;
}

export default function ProductReviews({ productId }: Props) {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { notify } = useNotify();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ avg_rating: 0, review_count: 0 });

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const [reviewsRes, statsRes] = await Promise.all([
                api.get(`products/${productId}/reviews`).catch(err => {
                    console.error('Failed to fetch reviews list', err);
                    return { data: [] };
                }),
                api.get(`products/${productId}/reviews/stats`).catch(err => {
                    console.error('Failed to fetch reviews stats', err);
                    return { data: { avg_rating: 0, review_count: 0 } };
                })
            ]);
            setReviews(reviewsRes.data || []);
            setStats(statsRes.data || { avg_rating: 0, review_count: 0 });
        } catch (err) {
            console.error('Failed to fetch reviews', err);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            notify(t.reviews.login_required, 'error');
            return;
        }
        setLoading(true);
        try {
            await api.post(`products/${productId}/reviews`, { rating, comment });
            notify(t.reviews.success, 'success');
            setComment('');
            fetchReviews();
        } catch {
            notify(t.reviews.error, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mt-4 pt-4 border-t border-farm-bark/10 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-stretch gap-12 flex-1 min-h-0 overflow-hidden">
                <div className="w-full md:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 max-h-full flex-shrink-0 pb-6">
                    <h2 className="text-2xl font-serif text-farm-forest mb-2">{t.reviews.title}</h2>
                    <div className="glass-panel p-6 rounded-3xl text-center">
                        <p className="text-4xl font-serif text-farm-pine mb-1">{stats.avg_rating.toFixed(1)}</p>
                        <div className="flex justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={16} className={s <= Math.round(stats.avg_rating) ? 'fill-farm-gold text-farm-gold' : 'text-farm-bark/30'} />
                            ))}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40">{t.reviews.based_on.replace('{count}', stats.review_count.toString())}</p>
                    </div>

                    {user && (
                        <div className="glass-panel p-6 rounded-3xl">
                            <h3 className="font-serif text-base mb-4">{t.reviews.share_exp}</h3>
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button 
                                            key={s} 
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star size={20} className={s <= rating ? 'fill-farm-gold text-farm-gold' : 'text-farm-bark/30'} />
                                        </button>
                                    ))}
                                </div>
                                <textarea 
                                    className="premium-input h-24 !text-xs !p-3" 
                                    placeholder={t.reviews.placeholder}
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    required
                                />
                                <button disabled={loading} className="premium-btn w-full flex items-center justify-center gap-2 py-2 text-[10px]">
                                    <Send size={12} />
                                    {t.reviews.submit}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-2/3 space-y-6 overflow-y-auto pr-4 max-h-full pb-6">
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id} className="bg-white/50 p-6 rounded-3xl border border-farm-bark/10 hover:border-farm-gold/20 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-farm-forest text-sm">{review.user_email}</p>
                                        <div className="flex gap-0.5 mt-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={10} className={s <= review.rating ? 'fill-farm-gold text-farm-gold' : 'text-farm-bark/30'} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-farm-forest/40 font-bold uppercase tracking-widest">{formatLongDate(review.created_at)}</p>
                                </div>
                                <p className="text-farm-forest/70 text-xs leading-relaxed italic">
                                    &quot;{review.comment.Valid ? review.comment.String : t.reviews.no_comment}&quot;
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center glass-panel rounded-3xl border-dashed">
                            <MessageSquare className="mx-auto text-farm-bark/20 mb-3" size={36} />
                            <p className="text-lg font-serif italic text-farm-forest/30">{t.reviews.no_reviews}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

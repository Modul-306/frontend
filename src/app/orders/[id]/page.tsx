'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useNotify } from '@/context/NotificationContext';
import { formatCurrency, formatLongDate } from '@/lib/utils';
import { ArrowLeft, CreditCard, DollarSign, Download, CheckCircle, Clock, XCircle, ShoppingBag } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderMetadata {
	id: string;
	tenant_id: string;
	user_id: string;
	status: string;
	total_amount: string;
	created_at: { Time: string; Valid: boolean } | string;
	payment_method: string;
	payment_status: string;
}

interface OrderItemRow {
	id: string;
	product_id: string;
	product_name: string;
	quantity: number;
	price_at_time: string;
}

export default function OrderDetailsPage() {
	const { t } = useLanguage();
	const { notify } = useNotify();
	const router = useRouter();
	const params = useParams();
	const orderId = params.id as string;

	const [order, setOrder] = useState<OrderMetadata | null>(null);
	const [items, setItems] = useState<OrderItemRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [paying, setPaying] = useState(false);

	useEffect(() => {
		if (orderId) {
			fetchOrderDetails();
		}
	}, [orderId]);

	const fetchOrderDetails = async () => {
		setLoading(true);
		try {
			const res = await api.get(`orders/${orderId}`);
			setOrder(res.data.order);
			setItems(res.data.items || []);
		} catch (err) {
			console.error('Failed to fetch order details', err);
			notify(t.common.error || 'Failed to load order details', 'error');
		} finally {
			setLoading(false);
		}
	};

	const handlePayNow = async () => {
		if (!order) return;
		setPaying(true);
		try {
			const res = await api.post(`orders/${orderId}/pay`);
			if (res.data.redirect_url) {
				window.location.href = res.data.redirect_url;
			} else {
				notify('Payment redirect URL not returned by server', 'error');
			}
		} catch (err: any) {
			console.error('Failed to initiate payment', err);
			const errMsg = err.response?.data?.error || 'Payment initialization failed. Please try again.';
			notify(errMsg, 'error');
		} finally {
			setPaying(false);
		}
	};

	const handleDownloadInvoice = () => {
		if (!order) return;
		try {
			const doc = new jsPDF();
			doc.setFontSize(22);
			doc.text(t.profile.invoice_title || 'Invoice', 20, 20);

			doc.setFontSize(10);
			doc.text(`${t.admin.orders.order_id}: ${order.id}`, 20, 30);
			const dateStr = typeof order.created_at === 'object' && order.created_at.Valid 
				? order.created_at.Time 
				: (typeof order.created_at === 'string' ? order.created_at : '');
			doc.text(`${t.global_admin.date_col || 'Date'}: ${formatLongDate(dateStr)}`, 20, 35);
			doc.text(`Payment Method: ${order.payment_method === 'online' ? 'Online (Payrexx)' : 'Cash'}`, 20, 40);
			doc.text(`Payment Status: ${order.payment_status.toUpperCase()}`, 20, 45);

			const tableData = items.map(item => [
				item.product_name,
				item.quantity,
				formatCurrency(item.price_at_time),
				formatCurrency(parseFloat(item.price_at_time) * item.quantity)
			]);

			autoTable(doc, {
				startY: 55,
				head: [[
					t.admin.inventory.name || 'Name',
					t.profile.qty || 'Qty',
					t.admin.inventory.price || 'Price',
					t.shop.total || 'Total'
				]],
				body: tableData,
				foot: [['', '', t.profile.grand_total || 'Total', formatCurrency(order.total_amount)]],
				theme: 'striped',
				headStyles: { fillColor: [22, 78, 53] }
			});

			doc.save(`invoice_${order.id.slice(0, 8)}.pdf`);
		} catch (err) {
			console.error('Failed to download invoice', err);
			notify('Failed to generate PDF invoice', 'error');
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed': return 'bg-green-100 text-green-700 border-green-200';
			case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			case 'pending_payment': return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
			default: return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
			case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
			case 'pending_payment': return <Clock className="w-5 h-5 text-blue-600" />;
			case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
			default: return null;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-farm-cream">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-farm-forest"></div>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="min-h-screen bg-farm-cream flex flex-col items-center justify-center p-8">
				<div className="glass-panel p-12 rounded-3xl max-w-md w-full text-center">
					<h2 className="text-2xl font-serif mb-4 text-farm-forest">Order Not Found</h2>
					<p className="text-farm-forest/60 mb-6">The order details could not be retrieved. Please check the ID or try again.</p>
					<button onClick={() => router.push('/')} className="premium-btn w-full">Go to Storefront</button>
				</div>
			</div>
		);
	}

	const dateVal = typeof order.created_at === 'object' && order.created_at.Valid 
		? order.created_at.Time 
		: (typeof order.created_at === 'string' ? order.created_at : '');

	return (
		<main className="min-h-screen bg-farm-cream pb-24">
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

			<div className="container mx-auto px-4 max-w-4xl mt-12 animate-in fade-in duration-500">
				{/* Top Panel */}
				<div className="glass-panel p-8 rounded-3xl border-farm-gold/20 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
					<div>
						<span className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40">Order Summary</span>
						<h1 className="text-3xl font-serif text-farm-forest mt-1">ID: #{order.id.slice(0, 8)}</h1>
						<p className="text-xs text-farm-forest/60 mt-1">{formatLongDate(dateVal)}</p>
					</div>

					<div className="flex flex-wrap gap-3">
						<button 
							onClick={handleDownloadInvoice}
							className="premium-btn-outline text-xs !py-2 flex items-center gap-2"
						>
							<Download size={14} />
							Invoice PDF
						</button>
						{order.status === 'pending_payment' && order.payment_status !== 'paid' && (
							<button 
								onClick={handlePayNow}
								disabled={paying}
								className="premium-btn text-xs !py-2 flex items-center gap-2 shadow-lg"
							>
								<CreditCard size={14} />
								{paying ? 'Connecting to Payrexx...' : 'Pay Now'}
							</button>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Items list */}
					<div className="md:col-span-2 space-y-6">
						<div className="glass-panel p-8 rounded-3xl">
							<h3 className="text-xl font-serif mb-6 text-farm-forest flex items-center gap-2 border-b pb-4">
								<ShoppingBag className="w-5 h-5" />
								Ordered Items
							</h3>

							<div className="divide-y divide-farm-bark/10 space-y-4">
								{items.map(item => (
									<div key={item.id} className="flex justify-between items-center pt-4 first:pt-0">
										<div>
											<p className="font-serif text-base text-farm-forest font-bold">{item.product_name}</p>
											<p className="text-xs text-farm-forest/60">
												{formatCurrency(item.price_at_time)} each x {item.quantity}
											</p>
										</div>
										<p className="font-bold text-farm-pine text-base">
											{formatCurrency(parseFloat(item.price_at_time) * item.quantity)}
										</p>
									</div>
								))}
							</div>

							<div className="border-t border-farm-bark/10 pt-6 mt-6 flex justify-between items-center">
								<span className="font-serif text-lg text-farm-forest">{t.profile.grand_total || 'Total'}</span>
								<span className="font-bold text-2xl text-farm-pine">{formatCurrency(order.total_amount)}</span>
							</div>
						</div>
					</div>

					{/* Metadata details */}
					<div className="md:col-span-1 space-y-6">
						<div className="glass-panel p-8 rounded-3xl">
							<h3 className="text-xl font-serif mb-6 text-farm-forest border-b pb-4">Fulfillment Details</h3>

							<div className="space-y-6 text-xs">
								{/* Order Status */}
								<div>
									<span className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40 block mb-2">Order Status</span>
									<div className="flex items-center gap-2">
										<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full uppercase border font-bold text-[9px] ${getStatusColor(order.status)}`}>
											{getStatusIcon(order.status)}
											{order.status.replace('_', ' ')}
										</span>
									</div>
								</div>

								{/* Payment Status */}
								<div>
									<span className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40 block mb-2">Payment Status</span>
									<div className="flex items-center gap-2">
										<span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full uppercase border font-bold text-[9px] ${
											order.payment_status === 'paid' 
												? 'bg-green-50 text-green-700 border-green-200' 
												: 'bg-red-50 text-red-700 border-red-200'
										}`}>
											{order.payment_status}
										</span>
									</div>
								</div>

								{/* Payment Method */}
								<div>
									<span className="text-[10px] font-bold uppercase tracking-widest text-farm-forest/40 block mb-1">Payment Method</span>
									<p className="font-medium text-farm-forest">
										{order.payment_method === 'online' ? 'Online (Payrexx)' : 'Cash'}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}

export interface Product {
    id: string;
    tenant_id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    created_at: string;
}

export interface Blog {
    id: string;
    tenant_id: string;
    title: string;
    content_md: string;
    published_at: string;
}

export interface Order {
    id: string;
    tenant_id: string;
    user_id: string;
    status: 'pending' | 'completed' | 'cancelled';
    total_amount: number;
    created_at: string;
}

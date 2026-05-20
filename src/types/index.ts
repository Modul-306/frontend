export interface Tenant {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export interface NullString {
    String: string;
    Valid: boolean;
}

export interface Product {
    id: string;
    tenant_id: string;
    name: string;
    description: NullString;
    price: string; // Price is returned as string from backend
    stock: number;
    image_url: NullString;
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

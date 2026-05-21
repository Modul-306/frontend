export interface NullTime {
    Time: string;
    Valid: boolean;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    icon_url?: NullString;
    cover_url?: NullString;
    description?: NullString;
    created_at: string | NullTime;
    owner_id?: NullUUID;
}

export type NullUUID = string | null;

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
    created_at: string | NullTime;
}

export interface Blog {
    id: string;
    tenant_id: string;
    title: string;
    content_md: string;
    published_at: string | NullTime;
}

export interface Order {
    id: string;
    tenant_id: string;
    user_id: string;
    status: 'pending' | 'completed' | 'cancelled';
    total_amount: string; // From backend it's a string decimal
    created_at: string | NullTime;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price_at_time: string;
}

export interface BasketItem {
    product: Product;
    quantity: number;
}

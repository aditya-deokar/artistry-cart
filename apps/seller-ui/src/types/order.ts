export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'PAID';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        title: string;
        images: { url: string }[];
        slug: string;
    };
}

export interface Order {
    id: string;
    totalAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
    items: OrderItem[];
    user: {
        id: string;
        name: string;
        email: string;
    };
    payment?: {
        status: PaymentStatus;
        method: string;
    };
}

export interface OrderListResponse {
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
}

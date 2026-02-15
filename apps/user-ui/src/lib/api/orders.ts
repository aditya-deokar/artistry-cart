import axiosInstance from '@/utils/axiosinstance';

/**
 * Orders API Service
 * 
 * Centralized API service for all order-related operations.
 * These endpoints are served by the order-service microservice.
 */

// Types
export interface CreateSessionPayload {
    cart: any[];
    selectedAddressId: string;
    coupon?: {
        code: string;
        type: string;
        value: number;
    } | null;
}

export interface OrdersQueryParams {
    page?: number;
    limit?: number;
    status?: string;
}

export interface RefundRequest {
    orderId: string;
    reason: string;
    itemIds?: string[];
}

// API Functions
export const ordersApi = {
    /**
     * Create a payment session from cart
     * Called when user clicks "Proceed to Payment" on cart page
     */
    createSession: (data: CreateSessionPayload) =>
        axiosInstance.post<{ sessionId: string }>('/order/api/create-payment-session', data),

    /**
     * Verify session and create Stripe payment intent
     * Called when checkout page loads
     */
    verifyAndCreateIntent: (sessionId: string) =>
        axiosInstance.get<{ clientSecret: string; session: any }>(
            `/order/api/verify-session-and-create-intent?sessionId=${sessionId}`
        ),

    /**
     * Get payment status after Stripe redirect
     * Called on payment confirmation page
     */
    getPaymentStatus: (paymentIntentId: string) =>
        axiosInstance.get<{ status: string; amount: number; currency: string; order: any }>(
            `/order/api/payment-status?payment_intent=${paymentIntentId}`
        ),

    /**
     * Get user's orders with pagination
     */
    getOrders: (params?: OrdersQueryParams) =>
        axiosInstance.get<{ orders: any[]; total: number; page: number; totalPages: number }>(
            '/order/api/orders',
            { params }
        ),

    /**
     * Get single order details
     */
    getOrderById: (orderId: string) =>
        axiosInstance.get<{ order: any }>(`/order/api/orders/${orderId}`),

    /**
     * Cancel an order (for PENDING or PAID orders only)
     * This will automatically trigger a refund if payment was made
     */
    cancelOrder: (orderId: string, reason?: string) =>
        axiosInstance.post<{ success: boolean; message: string }>(
            `/order/api/orders/${orderId}/cancel`,
            { reason }
        ),

    /**
     * Request a refund (for delivered orders)
     * Can be full or partial refund based on itemIds
     */
    requestRefund: (data: RefundRequest) =>
        axiosInstance.post<{
            success: boolean;
            refundId: string;
            stripeRefundId: string;
            amount: number;
            status: string;
        }>('/order/api/refunds/request', data),
};

export default ordersApi;

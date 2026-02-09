import express, { Router } from 'express';
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';
import { isSeller } from '../../../../packages/middleware/authorizedRoles';
import {
    createPaymentIntent,
    createPaymentSession,
    verifyingPaymentSession,
    verifySessionAndCreateIntent,
    getUserOrders,
    getOrderDetails,
    getPaymentStatus,
    cancelOrder,
    requestRefund,
    getSellerEarnings,
    getSellerPayouts,
    requestSellerPayout
} from '../controllers/order.controller';
import {
    getSellerOrders,
    updateOrderStatus,
    getSellerAnalytics,
    getSellerOrderDetails
} from '../controllers/seller-order.controller';

const router: Router = express.Router();

// ============================================
// CUSTOMER PAYMENT FLOW
// ============================================
router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get("/verify-payment-session", isAuthenticated, verifyingPaymentSession);
router.get("/verify-session-and-create-intent", isAuthenticated, verifySessionAndCreateIntent);
router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
router.get("/payment-status", isAuthenticated, getPaymentStatus);

// ============================================
// ORDER MANAGEMENT (Customer)
// ============================================
router.get("/orders", isAuthenticated, getUserOrders);
router.get("/orders/:orderId", isAuthenticated, getOrderDetails);
router.post("/orders/:orderId/cancel", isAuthenticated, cancelOrder);
router.post("/refunds/request", isAuthenticated, requestRefund);

// ============================================
// SELLER PAYOUT SYSTEM
// ============================================
router.get("/seller/earnings", isAuthenticated, isSeller, getSellerEarnings);
router.get("/seller/payouts", isAuthenticated, isSeller, getSellerPayouts);
router.post("/seller/payouts/request", isAuthenticated, isSeller, requestSellerPayout);

// ============================================
// SELLER ORDER MANAGEMENT
// ============================================
router.get("/seller/orders", isAuthenticated, isSeller, getSellerOrders);
router.get("/seller/orders/:orderId", isAuthenticated, isSeller, getSellerOrderDetails);
router.put("/seller/orders/:orderId/status", isAuthenticated, isSeller, updateOrderStatus);
router.get("/seller/analytics", isAuthenticated, isSeller, getSellerAnalytics);

export default router;
import express, { Router } from "express";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { applyDiscountCode, createDiscountCode, deleteDiscountCode, getDiscountUsageStats, getSellerDiscountCodes, updateDiscountCode, validateDiscountCode } from "../controllers/discountController";
import isAdmin from "../../../../packages/middleware/isAdmin";


const router: Router = express.Router();

// =============================================
// PUBLIC ROUTES
// =============================================

// Discount validation
router.post("/validate", validateDiscountCode);

// =============================================
// SELLER ROUTES (AUTHENTICATED)
// =============================================

// Discount CRUD
router.post("/", isAuthenticated, createDiscountCode);
router.get("/seller", isAuthenticated, getSellerDiscountCodes);
router.put("/:discountId", isAuthenticated, updateDiscountCode);
router.delete("/:discountId", isAuthenticated, deleteDiscountCode);

// Usage tracking
router.get("/:discountId/stats", isAuthenticated, getDiscountUsageStats);
router.post("/apply", isAuthenticated, applyDiscountCode);

// =============================================
// ADMIN ROUTES
// =============================================

// Admin discount management
router.get("/admin/all", isAuthenticated, isAdmin, getSellerDiscountCodes);
router.put("/admin/:discountId/status", isAuthenticated, isAdmin, updateDiscountCode);

export default router;

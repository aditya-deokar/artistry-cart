import express, { Router } from "express";

import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { createDiscountCode, deleteDiscountCode, getSellerDiscountCodes, updateDiscountCode, validateDiscountCode } from "../controllers/discountController";

const router: Router = express.Router();

// Public routes
router.post("/validate", validateDiscountCode);

// Seller routes (protected)
router.post("/create", isAuthenticated, createDiscountCode);
router.get("/seller", isAuthenticated, getSellerDiscountCodes);
router.put("/update/:discountId", isAuthenticated, updateDiscountCode);
router.delete("/delete/:discountId", isAuthenticated, deleteDiscountCode);

export default router;

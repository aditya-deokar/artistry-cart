import express, { Router } from "express";
import { 
  // Product controllers
  createProduct, 
  updateProduct,
  deleteProduct,
  restoreProduct,
  getSellerProducts,
  getAllProducts,
  getAllProductsAdmin,
  getProductBySlug,
  getProductsByIds,
  updateProductStatusAdmin,
  
  // Utility controllers
  getCategories,
  uploadProductImage,
  deleteProductImage,
  validateCoupon
} from "../controllers/product.controller";

import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import isAdmin from "../../../../packages/middleware/isAdmin";
import { getUserOffers } from "../controllers/offers.controller";


const router: Router = express.Router();

// =============================================
// PUBLIC ROUTES
// =============================================

// Categories
router.get("/categories", getCategories);

// Products
router.get("/products", getAllProducts);
router.get("/product/:slug", getProductBySlug);
router.get("/products/by-ids", getProductsByIds);

// Coupon validation
router.post("/coupon/validate", validateCoupon);

// =============================================
// SELLER ROUTES (AUTHENTICATED)
// =============================================

// Image management
router.post("/images/upload", isAuthenticated, uploadProductImage);
router.delete("/images/delete", isAuthenticated, deleteProductImage);

// Product CRUD
router.post("/products", isAuthenticated, createProduct);
router.get("/seller/products", isAuthenticated, getSellerProducts);
router.put("/products/:productId", isAuthenticated, updateProduct);
router.delete("/products/:productId", isAuthenticated, deleteProduct);
router.put("/products/:productId/restore", isAuthenticated, restoreProduct);

// =============================================
// ADMIN ROUTES
// =============================================

// Admin product management
router.get("/admin/products", isAuthenticated, isAdmin, getAllProductsAdmin);
router.put("/admin/products/:productId/status", isAuthenticated, isAdmin, updateProductStatusAdmin);


export default router;

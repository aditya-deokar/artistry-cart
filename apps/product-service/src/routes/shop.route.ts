import express, { Router } from "express";
import {
  getAllShops,
  getShopBySlug,
  getProductsForShop,
  getReviewsForShop,
  createShopReview,
  getShopCategories
} from "../controllers/shop.controller";

import isAuthenticated from "../../../../packages/middleware/isAuthenticated";

const shopRouter: Router = express.Router();

// =============================================
// PUBLIC SHOP ROUTES
// =============================================

// Shop listings and details
shopRouter.get("/", getAllShops);
shopRouter.get("/categories", getShopCategories);
shopRouter.get("/:slug", getShopBySlug);

// Shop products and reviews
shopRouter.get("/:shopId/products", getProductsForShop);
shopRouter.get("/:shopId/reviews", getReviewsForShop);

// =============================================
// AUTHENTICATED ROUTES
// =============================================

// Reviews
shopRouter.post("/reviews", isAuthenticated, createShopReview);


export default shopRouter;

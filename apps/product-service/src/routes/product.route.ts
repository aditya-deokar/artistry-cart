import express, { Router } from "express";
import { CreateDiscountCodes, createProduct, deleteDiscountCode, deleteProductImage, deleteShopProducts, getAllProducts, getCategories, getDiscountCodes, getProductBySlug, getShopProducts, restoreShopProducts, uploadProductImage, validateCoupon } from "../controllers/product.controller";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { createShopReview, getAllShops, getProductsForShop, getReviewsForShop, getShopBySlug } from "../controllers/shop.controller";



const router: Router = express.Router();

router.get("/get-categories", getCategories);

router.post("/create-discount-code", isAuthenticated, CreateDiscountCodes);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode)

router.post("/upload-product-image",isAuthenticated, uploadProductImage);
router.delete("/delete-product-image",isAuthenticated, deleteProductImage);

router.post("/create-product",isAuthenticated, createProduct);
router.get("/get-shop-products",isAuthenticated, getShopProducts);

router.delete("/delete-product/:productId",isAuthenticated, deleteShopProducts);
router.put("/restore-product/:productId",isAuthenticated, restoreShopProducts);

router.get("/get-all-products", getAllProducts);
router.get("/get-product/:slug", getProductBySlug);


router.post("/coupon/validate", validateCoupon);



// shop
router.get('/get-all-shops', getAllShops);
router.get('/get-shop/:slug', getShopBySlug);
router.get('/get-shop-products/:shopId', getProductsForShop);
router.get('/get-shop-reviews/:shopId', getReviewsForShop);

router.post('/create-review', isAuthenticated, createShopReview);






export default router;
import express, { Router } from "express";
import { CreateDiscountCodes, deleteDiscountCode, getCategories, getDiscountCodes } from "../controllers/product.controller";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";



const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, CreateDiscountCodes);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode)

export default router;
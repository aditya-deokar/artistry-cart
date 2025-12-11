import express, { Router } from "express";
import { getRecommendedProducts } from "../controllers/recommendation-controller";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";

const router:Router= express.Router();

router.get("/recommendations/:userId", isAuthenticated, getRecommendedProducts);

export default router;

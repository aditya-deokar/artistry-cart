import express, { Router } from "express";

import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { createEvent, deleteEvent, getAllEvents, getSellerEvents, getSellerProductsForEvent, updateEvent, updateEventProducts } from "../controllers/eventsController";

const router: Router = express.Router();

// Public routes
router.get("/all", getAllEvents);

// Seller routes (protected)
router.post("/create", isAuthenticated, createEvent);
router.get("/seller", isAuthenticated, getSellerEvents);
router.put("/update/:eventId", isAuthenticated, updateEvent);
router.delete("/delete/:eventId", isAuthenticated, deleteEvent);


router.get('/seller-products', isAuthenticated, getSellerProductsForEvent);
router.put('/products/:eventId', isAuthenticated, updateEventProducts);

export default router;

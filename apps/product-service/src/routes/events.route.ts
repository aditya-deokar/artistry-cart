import express, { Router } from "express";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { createEvent, createEventWithProduct, deleteEvent, getAllEvents, getEventById, getSellerEvents, getSellerProductsForEvent, updateEvent, updateEventProducts } from "../controllers/eventsController";
import isAdmin from "../../../../packages/middleware/isAdmin";


const router: Router = express.Router();

// =============================================
// PUBLIC ROUTES
// =============================================

// Event listings
router.get("/", getAllEvents);
router.get("/:eventId", getEventById);

// Filter routes
router.get("/type/:eventType", getAllEvents);
router.get("/shop/:shopId", getAllEvents);

// =============================================
// SELLER ROUTES (AUTHENTICATED)
// =============================================

// Event CRUD
router.post("/", isAuthenticated, createEvent);
router.post("/with-products", isAuthenticated, createEventWithProduct);
router.get("/seller/events", isAuthenticated, getSellerEvents);
router.put("/:eventId", isAuthenticated, updateEvent);
router.delete("/:eventId", isAuthenticated, deleteEvent);

// Product management for events
router.get("/seller/products", isAuthenticated, getSellerProductsForEvent);
router.put("/:eventId/products", isAuthenticated, updateEventProducts);

// =============================================
// ADMIN ROUTES
// =============================================

// Admin event management
router.get("/admin/all", isAuthenticated, isAdmin, getAllEvents);
router.put("/admin/:eventId/status", isAuthenticated, isAdmin, updateEvent);


export default router;

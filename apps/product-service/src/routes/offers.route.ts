import express, { Router } from "express";
import {
  getOffersPageData,
  getUserOffers,
  getDealsByCategory,
  getLimitedTimeOffers,
  getSeasonalOffers,
  getOfferStatistics
} from "../controllers/offers.controller";

import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import isAdmin from "../../../../packages/middleware/isAdmin";


const offersRouter: Router = express.Router();

// =============================================
// PUBLIC OFFER ROUTES
// =============================================

// Main offers page (original implementation)
// offersRouter.get("/", getOffersPageData);
offersRouter.get("/", getUserOffers);

// User-facing offers page (new simplified endpoint)
offersRouter.get("/user", getUserOffers);

// Categorized offers
offersRouter.get("/category/:category", getDealsByCategory);

// Special offer types
offersRouter.get("/limited-time", getLimitedTimeOffers);
offersRouter.get("/seasonal", getSeasonalOffers);

// =============================================
// ADMIN ROUTES
// =============================================

// Offer statistics
offersRouter.get("/admin/stats", isAuthenticated, isAdmin, getOfferStatistics);

export default offersRouter;

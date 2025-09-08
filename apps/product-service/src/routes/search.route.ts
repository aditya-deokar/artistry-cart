import express, { Router } from "express";
import {
  liveSearch,
  fullSearch,
  searchProducts,
  searchEvents,
  searchShops,
  getSearchSuggestions
} from "../controllers/search.controller";

const searchRouter: Router = express.Router();

// =============================================
// SEARCH ROUTES
// =============================================

// Live search (autocomplete)
searchRouter.get("/live", liveSearch);
searchRouter.get("/suggestions", getSearchSuggestions);

// Full search with filters
searchRouter.get("/", fullSearch);

// Specific entity searches
searchRouter.get("/products", searchProducts);
searchRouter.get("/events", searchEvents);
searchRouter.get("/shops", searchShops);


export default searchRouter;

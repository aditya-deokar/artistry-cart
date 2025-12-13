/**
 * OAuth Router
 * 
 * Defines routes for OAuth authentication flows.
 * Supports Google, GitHub, and Facebook OAuth with extensible structure for future providers.
 */

import express, { Router } from "express";
import {
    googleLogin,
    googleCallback,
    githubLogin,
    githubCallback,
    facebookLogin,
    facebookCallback,
    getOAuthStatus
} from "./oauth.controller";

const oauthRouter: Router = express.Router();

/**
 * GET /api/oauth/status
 * Returns the configuration status of OAuth providers
 */
oauthRouter.get("/status", getOAuthStatus);

/**
 * Google OAuth Routes
 * 
 * GET /api/oauth/google - Initiates Google OAuth flow
 * GET /api/oauth/google/callback - Handles Google OAuth callback
 */
oauthRouter.get("/google", googleLogin);
oauthRouter.get("/google/callback", googleCallback);

/**
 * GitHub OAuth Routes
 * 
 * GET /api/oauth/github - Initiates GitHub OAuth flow
 * GET /api/oauth/github/callback - Handles GitHub OAuth callback
 */
oauthRouter.get("/github", githubLogin);
oauthRouter.get("/github/callback", githubCallback);

/**
 * Facebook OAuth Routes
 * 
 * GET /api/oauth/facebook - Initiates Facebook OAuth flow
 * GET /api/oauth/facebook/callback - Handles Facebook OAuth callback
 */
oauthRouter.get("/facebook", facebookLogin);
oauthRouter.get("/facebook/callback", facebookCallback);

/**
 * Future OAuth Provider Routes
 * 
 * Uncomment and implement as needed:
 * 
 * // Microsoft OAuth
 * oauthRouter.get("/microsoft", microsoftLogin);
 * oauthRouter.get("/microsoft/callback", microsoftCallback);
 */

export default oauthRouter;

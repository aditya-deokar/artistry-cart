/**
 * OAuth Controller
 * 
 * Handles OAuth authentication flows for all configured providers.
 * Uses Arctic library for secure OAuth 2.0 implementation.
 * 
 * Security features:
 * - CSRF protection via state parameter stored in HTTPOnly cookie
 * - Secure token exchange using Arctic
 * - JWT token generation for authenticated users
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getGoogleProvider, getGitHubProvider, getFacebookProvider, generateState, generateCodeVerifier } from "./providers";
import prisma from "../../../../packages/libs/prisma";
import { setCookie } from "../utils/cookies/setCookie";

// Use undici fetch for Node.js (bundled with Node 18+)
import { fetch } from "undici";

// Constants
const STATE_COOKIE_NAME = "oauth_state";
const CODE_VERIFIER_COOKIE_NAME = "oauth_code_verifier";
const STATE_EXPIRY_SECONDS = 600; // 10 minutes
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Interface for Google user info response
 */
interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
}

/**
 * Interface for GitHub user info response
 */
interface GitHubUserInfo {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
}

/**
 * Interface for GitHub email response
 */
interface GitHubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string | null;
}

/**
 * Validate OAuth state from callback (using cookies only)
 * The state is stored in an HTTPOnly cookie and compared with the callback state
 */
function validateState(state: string, cookieState: string): boolean {
    if (!state || !cookieState || state !== cookieState) {
        return false;
    }
    return true;
}

/**
 * Generate JWT tokens for a user
 */
function generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
        { id: userId, role: "user" },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: userId, role: "user" },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
}

// ============================================================================
// GOOGLE OAUTH
// ============================================================================

/**
 * Google OAuth Login - Initiates the OAuth flow
 * 
 * Generates authorization URL with:
 * - State parameter for CSRF protection
 * - Code verifier for PKCE (if supported)
 * - Required scopes (email, profile)
 */
export const googleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get provider using async function (handles ESM dynamic import)
        const google = await getGoogleProvider();

        // Generate state for CSRF protection (stored in cookie, validated on callback)
        const state = await generateState();
        const codeVerifier = await generateCodeVerifier();

        // Generate authorization URL with scopes
        const authorizationUrl = google.createAuthorizationURL(state, codeVerifier, [
            "openid",
            "email",
            "profile"
        ]);

        // Store state and code verifier in cookies
        res.cookie(STATE_COOKIE_NAME, state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: STATE_EXPIRY_SECONDS * 1000,
            path: "/"
        });

        res.cookie(CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: STATE_EXPIRY_SECONDS * 1000,
            path: "/"
        });

        // Redirect to Google authorization page
        res.redirect(authorizationUrl.toString());
    } catch (error) {
        console.error("Google OAuth login error:", error);
        // Redirect with error instead of throwing
        const errorMessage = error instanceof Error ? error.message : "OAuth configuration error";
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent(errorMessage)}`);
    }
};

/**
 * Google OAuth Callback - Handles the OAuth callback
 * 
 * 1. Validates state parameter (CSRF protection)
 * 2. Exchanges authorization code for tokens
 * 3. Fetches user info from Google
 * 4. Creates or updates user in database
 * 5. Generates JWT tokens
 * 6. Redirects to frontend with auth cookies
 */
export const googleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { code, state, error: oauthError } = req.query;

        // Handle OAuth errors (e.g., user denied consent)
        if (oauthError) {
            console.error("Google OAuth error:", oauthError);
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_denied&message=${encodeURIComponent("Google login was cancelled or denied")}`);
        }

        if (!code || typeof code !== "string") {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent("Invalid authorization code")}`);
        }

        if (!state || typeof state !== "string") {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent("Invalid state parameter")}`);
        }

        // Validate state (CSRF protection) - compare cookie state with callback state
        const cookieState = req.cookies[STATE_COOKIE_NAME];
        const isValidState = validateState(state, cookieState);

        if (!isValidState) {
            console.error("OAuth state validation failed");
            return res.redirect(`${FRONTEND_URL}/login?error=csrf_error&message=${encodeURIComponent("Security validation failed. Please try again.")}`);
        }

        // Get code verifier from cookie
        const codeVerifier = req.cookies[CODE_VERIFIER_COOKIE_NAME];
        if (!codeVerifier) {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent("Session expired. Please try again.")}`);
        }

        // Get provider using async function (handles ESM dynamic import)
        const google = await getGoogleProvider();

        // Exchange authorization code for tokens
        const tokens = await google.validateAuthorizationCode(code, codeVerifier);

        // Fetch user info from Google using undici fetch
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken()}`
            }
        });

        if (userInfoResponse.status !== 200) {
            throw new Error("Failed to fetch user info from Google");
        }

        const googleUser = await userInfoResponse.json() as GoogleUserInfo;

        if (!googleUser.email) {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent("Could not retrieve email from Google account")}`);
        }

        // Find or create user in database
        let user = await prisma.users.findUnique({
            where: { email: googleUser.email }
        });

        if (user) {
            // Update existing user with OAuth info if not already set
            if (!user.oauthProvider) {
                user = await prisma.users.update({
                    where: { id: user.id },
                    data: {
                        oauthProvider: "google",
                        oauthId: googleUser.id,
                        // Update avatar if user doesn't have one
                        avatar: user.avatar || (googleUser.picture ? { url: googleUser.picture, file_id: null } : null)
                    }
                });
            }
        } else {
            // Create new user
            user = await prisma.users.create({
                data: {
                    name: googleUser.name,
                    email: googleUser.email,
                    oauthProvider: "google",
                    oauthId: googleUser.id,
                    avatar: googleUser.picture ? { url: googleUser.picture, file_id: null } : null,
                    // Password is null for OAuth users
                    password: null
                }
            });
        }

        // Clear OAuth cookies
        res.clearCookie(STATE_COOKIE_NAME);
        res.clearCookie(CODE_VERIFIER_COOKIE_NAME);

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(user.id);

        // Set auth cookies
        setCookie(res, "access_token", accessToken);
        setCookie(res, "refresh_token", refreshToken);

        // Redirect to frontend
        res.redirect(`${FRONTEND_URL}?login=success`);
    } catch (error) {
        console.error("Google OAuth callback error:", error);

        // Clear OAuth cookies on error
        res.clearCookie(STATE_COOKIE_NAME);
        res.clearCookie(CODE_VERIFIER_COOKIE_NAME);

        // Redirect with error message
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent(errorMessage)}`);
    }
};

// ============================================================================
// GITHUB OAUTH
// ============================================================================

/**
 * GitHub OAuth Login - Initiates the OAuth flow
 * 
 * Generates authorization URL with:
 * - State parameter for CSRF protection
 * - Required scopes (user:email for email access)
 * 
 * Note: GitHub doesn't support PKCE
 */
export const githubLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get provider using async function (handles ESM dynamic import)
        const github = await getGitHubProvider();

        // Generate state for CSRF protection
        const state = await generateState();

        // Generate authorization URL with scopes
        // user:email scope is needed to get user's email even if it's private
        const authorizationUrl = github.createAuthorizationURL(state, [
            "user:email",
            "read:user"
        ]);

        // Store state in cookie
        res.cookie(STATE_COOKIE_NAME, state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: STATE_EXPIRY_SECONDS * 1000,
            path: "/"
        });

        // Redirect to GitHub authorization page
        res.redirect(authorizationUrl.toString());
    } catch (error) {
        console.error("GitHub OAuth login error:", error);
        const errorMessage = error instanceof Error ? error.message : "OAuth configuration error";
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent(errorMessage)}`);
    }
};

/**
 * GitHub OAuth Callback - Handles the OAuth callback
 * 
 * 1. Validates state parameter (CSRF protection)
 * 2. Exchanges authorization code for access token
 * 3. Fetches user info from GitHub
 * 4. Fetches user emails from GitHub (for private emails)
 * 5. Creates or updates user in database
 * 6. Generates JWT tokens
 * 7. Redirects to frontend with auth cookies
 */
export const githubCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { code, state, error: oauthError } = req.query;

        // Handle OAuth errors
        if (oauthError) {
            console.error("GitHub OAuth error:", oauthError);
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_denied&message=${encodeURIComponent("GitHub login was cancelled or denied")}`);
        }

        if (!code || typeof code !== "string") {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent("Invalid authorization code")}`);
        }

        if (!state || typeof state !== "string") {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent("Invalid state parameter")}`);
        }

        // Validate state (CSRF protection)
        const cookieState = req.cookies[STATE_COOKIE_NAME];
        const isValidState = validateState(state, cookieState);

        if (!isValidState) {
            console.error("OAuth state validation failed");
            return res.redirect(`${FRONTEND_URL}/login?error=csrf_error&message=${encodeURIComponent("Security validation failed. Please try again.")}`);
        }

        // Get provider
        const github = await getGitHubProvider();

        // Exchange authorization code for access token
        const tokens = await github.validateAuthorizationCode(code);
        const accessToken = tokens.accessToken();

        // Fetch user info from GitHub
        const userInfoResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "User-Agent": "Artistry-Cart-App"
            }
        });

        if (userInfoResponse.status !== 200) {
            throw new Error("Failed to fetch user info from GitHub");
        }

        const githubUser = await userInfoResponse.json() as GitHubUserInfo;

        // GitHub may not return email in user info if it's private
        // Fetch emails separately if needed
        let userEmail = githubUser.email;

        if (!userEmail) {
            const emailsResponse = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "User-Agent": "Artistry-Cart-App"
                }
            });

            if (emailsResponse.status === 200) {
                const emails = await emailsResponse.json() as GitHubEmail[];
                // Get the primary verified email
                const primaryEmail = emails.find(e => e.primary && e.verified);
                userEmail = primaryEmail?.email || emails.find(e => e.verified)?.email || null;
            }
        }

        if (!userEmail) {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent("Could not retrieve email from GitHub account. Please make sure you have a verified email.")}`);
        }

        // Determine display name
        const displayName = githubUser.name || githubUser.login;

        // Find or create user in database
        let user = await prisma.users.findUnique({
            where: { email: userEmail }
        });

        if (user) {
            // Update existing user with OAuth info if not already set
            if (!user.oauthProvider) {
                user = await prisma.users.update({
                    where: { id: user.id },
                    data: {
                        oauthProvider: "github",
                        oauthId: String(githubUser.id),
                        avatar: user.avatar || (githubUser.avatar_url ? { url: githubUser.avatar_url, file_id: null } : null)
                    }
                });
            }
        } else {
            // Create new user
            user = await prisma.users.create({
                data: {
                    name: displayName,
                    email: userEmail,
                    oauthProvider: "github",
                    oauthId: String(githubUser.id),
                    avatar: githubUser.avatar_url ? { url: githubUser.avatar_url, file_id: null } : null,
                    password: null
                }
            });
        }

        // Clear OAuth cookies
        res.clearCookie(STATE_COOKIE_NAME);

        // Generate JWT tokens
        const { accessToken: jwtAccessToken, refreshToken } = generateTokens(user.id);

        // Set auth cookies
        setCookie(res, "access_token", jwtAccessToken);
        setCookie(res, "refresh_token", refreshToken);

        // Redirect to frontend
        res.redirect(`${FRONTEND_URL}?login=success`);
    } catch (error) {
        console.error("GitHub OAuth callback error:", error);

        // Clear OAuth cookies on error
        res.clearCookie(STATE_COOKIE_NAME);

        // Redirect with error message
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent(errorMessage)}`);
    }
};

// ============================================================================
// FACEBOOK OAUTH
// ============================================================================

/**
 * Interface for Facebook user info response
 */
interface FacebookUserInfo {
    id: string;
    name: string;
    email?: string;
    picture?: {
        data: {
            url: string;
            is_silhouette: boolean;
        };
    };
}

/**
 * Facebook OAuth Login - Initiates the OAuth flow
 * 
 * Generates authorization URL with:
 * - State parameter for CSRF protection
 * - Required scopes (email, public_profile)
 */
export const facebookLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get provider using async function (handles ESM dynamic import)
        const facebook = await getFacebookProvider();

        // Generate state for CSRF protection
        const state = await generateState();

        // Generate authorization URL with scopes
        const authorizationUrl = facebook.createAuthorizationURL(state, [
            "email",
            "public_profile"
        ]);

        // Store state in cookie
        res.cookie(STATE_COOKIE_NAME, state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: STATE_EXPIRY_SECONDS * 1000,
            path: "/"
        });

        // Redirect to Facebook authorization page
        res.redirect(authorizationUrl.toString());
    } catch (error) {
        console.error("Facebook OAuth login error:", error);
        const errorMessage = error instanceof Error ? error.message : "OAuth configuration error";
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent(errorMessage)}`);
    }
};

/**
 * Facebook OAuth Callback - Handles the OAuth callback
 * 
 * 1. Validates state parameter (CSRF protection)
 * 2. Exchanges authorization code for access token
 * 3. Fetches user info from Facebook Graph API
 * 4. Creates or updates user in database
 * 5. Generates JWT tokens
 * 6. Redirects to frontend with auth cookies
 */
export const facebookCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { code, state, error: oauthError } = req.query;

        // Handle OAuth errors
        if (oauthError) {
            console.error("Facebook OAuth error:", oauthError);
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_denied&message=${encodeURIComponent("Facebook login was cancelled or denied")}`);
        }

        if (!code || typeof code !== "string") {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent("Invalid authorization code")}`);
        }

        if (!state || typeof state !== "string") {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent("Invalid state parameter")}`);
        }

        // Validate state (CSRF protection)
        const cookieState = req.cookies[STATE_COOKIE_NAME];
        const isValidState = validateState(state, cookieState);

        if (!isValidState) {
            console.error("OAuth state validation failed");
            return res.redirect(`${FRONTEND_URL}/login?error=csrf_error&message=${encodeURIComponent("Security validation failed. Please try again.")}`);
        }

        // Get provider
        const facebook = await getFacebookProvider();

        // Exchange authorization code for access token
        const tokens = await facebook.validateAuthorizationCode(code);
        const accessToken = tokens.accessToken();

        // Fetch user info from Facebook Graph API
        // Request email and profile picture
        const userInfoResponse = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
        );

        if (userInfoResponse.status !== 200) {
            throw new Error("Failed to fetch user info from Facebook");
        }

        const facebookUser = await userInfoResponse.json() as FacebookUserInfo;

        if (!facebookUser.email) {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent("Could not retrieve email from Facebook account. Please ensure email access is granted.")}`);
        }

        // Get profile picture URL (avoid silhouette/default picture)
        const profilePicture = facebookUser.picture?.data?.is_silhouette
            ? null
            : facebookUser.picture?.data?.url;

        // Find or create user in database
        let user = await prisma.users.findUnique({
            where: { email: facebookUser.email }
        });

        if (user) {
            // Update existing user with OAuth info if not already set
            if (!user.oauthProvider) {
                user = await prisma.users.update({
                    where: { id: user.id },
                    data: {
                        oauthProvider: "facebook",
                        oauthId: facebookUser.id,
                        avatar: user.avatar || (profilePicture ? { url: profilePicture, file_id: null } : null)
                    }
                });
            }
        } else {
            // Create new user
            user = await prisma.users.create({
                data: {
                    name: facebookUser.name,
                    email: facebookUser.email,
                    oauthProvider: "facebook",
                    oauthId: facebookUser.id,
                    avatar: profilePicture ? { url: profilePicture, file_id: null } : null,
                    password: null
                }
            });
        }

        // Clear OAuth cookies
        res.clearCookie(STATE_COOKIE_NAME);

        // Generate JWT tokens
        const { accessToken: jwtAccessToken, refreshToken } = generateTokens(user.id);

        // Set auth cookies
        setCookie(res, "access_token", jwtAccessToken);
        setCookie(res, "refresh_token", refreshToken);

        // Redirect to frontend
        res.redirect(`${FRONTEND_URL}?login=success`);
    } catch (error) {
        console.error("Facebook OAuth callback error:", error);

        // Clear OAuth cookies on error
        res.clearCookie(STATE_COOKIE_NAME);

        // Redirect with error message
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        res.redirect(`${FRONTEND_URL}/login?error=oauth_error&message=${encodeURIComponent(errorMessage)}`);
    }
};

// ============================================================================
// STATUS ENDPOINT
// ============================================================================

/**
 * Check OAuth provider status
 * Returns which OAuth providers are configured
 */
export const getOAuthStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const googleConfigured = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
        const githubConfigured = !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET;
        const facebookConfigured = !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET;

        res.json({
            providers: {
                google: googleConfigured,
                github: githubConfigured,
                facebook: facebookConfigured,
                microsoft: false // Future implementation
            }
        });
    } catch (error) {
        next(error);
    }
};

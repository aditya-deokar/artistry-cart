/**
 * OAuth Provider Configuration using Arctic
 * 
 * This module configures OAuth providers using the Arctic library.
 * Arctic provides a simple, secure abstraction for OAuth 2.0 flows.
 * 
 * NOTE: Arctic is an ESM-only package, so we use dynamic imports.
 * 
 * @see https://arcticjs.dev
 */

// Types for Arctic providers (we define them here to avoid import issues)
type GoogleProvider = {
    createAuthorizationURL(state: string, codeVerifier: string, scopes: string[]): URL;
    validateAuthorizationCode(code: string, codeVerifier: string): Promise<{
        accessToken(): string;
        refreshToken?(): string | undefined;
    }>;
};

type GitHubProvider = {
    createAuthorizationURL(state: string, scopes: string[]): URL;
    validateAuthorizationCode(code: string): Promise<{
        accessToken(): string;
    }>;
};

type FacebookProvider = {
    createAuthorizationURL(state: string, scopes: string[]): URL;
    validateAuthorizationCode(code: string): Promise<{
        accessToken(): string;
    }>;
};

// Environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
const OAUTH_REDIRECT_BASE_URL = process.env.OAUTH_REDIRECT_BASE_URL || "http://localhost:6001";

// Cached provider instances
let googleProviderInstance: GoogleProvider | null = null;
let githubProviderInstance: GitHubProvider | null = null;
let facebookProviderInstance: FacebookProvider | null = null;
let arcticModule: typeof import("arctic") | null = null;

/**
 * Load Arctic module dynamically (ESM)
 */
async function loadArctic(): Promise<typeof import("arctic")> {
    if (!arcticModule) {
        arcticModule = await import("arctic");
    }
    return arcticModule;
}

/**
 * Get or create the Google OAuth provider
 * Uses lazy initialization with dynamic import
 */
export async function getGoogleProvider(): Promise<GoogleProvider> {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error(
            "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
        );
    }

    if (!googleProviderInstance) {
        const arctic = await loadArctic();
        googleProviderInstance = new arctic.Google(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            `${OAUTH_REDIRECT_BASE_URL}/api/oauth/google/callback`
        );
    }

    return googleProviderInstance;
}

/**
 * Get or create the GitHub OAuth provider
 * Uses lazy initialization with dynamic import
 */
export async function getGitHubProvider(): Promise<GitHubProvider> {
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        throw new Error(
            "GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables."
        );
    }

    if (!githubProviderInstance) {
        const arctic = await loadArctic();
        githubProviderInstance = new arctic.GitHub(
            GITHUB_CLIENT_ID,
            GITHUB_CLIENT_SECRET,
            `${OAUTH_REDIRECT_BASE_URL}/api/oauth/github/callback`
        );
    }

    return githubProviderInstance;
}

/**
 * Get or create the Facebook OAuth provider
 * Uses lazy initialization with dynamic import
 */
export async function getFacebookProvider(): Promise<FacebookProvider> {
    if (!FACEBOOK_CLIENT_ID || !FACEBOOK_CLIENT_SECRET) {
        throw new Error(
            "Facebook OAuth is not configured. Please set FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET environment variables."
        );
    }

    if (!facebookProviderInstance) {
        const arctic = await loadArctic();
        facebookProviderInstance = new arctic.Facebook(
            FACEBOOK_CLIENT_ID,
            FACEBOOK_CLIENT_SECRET,
            `${OAUTH_REDIRECT_BASE_URL}/api/oauth/facebook/callback`
        );
    }

    return facebookProviderInstance;
}

/**
 * Generate a secure state parameter for CSRF protection
 */
export async function generateState(): Promise<string> {
    const arctic = await loadArctic();
    return arctic.generateState();
}

/**
 * Generate a code verifier for PKCE
 */
export async function generateCodeVerifier(): Promise<string> {
    const arctic = await loadArctic();
    return arctic.generateCodeVerifier();
}

/**
 * OAuth Provider Types
 * Extend this as more providers are added
 */
export type OAuthProvider = "google" | "github" | "facebook" | "microsoft";

/**
 * Check if a specific OAuth provider is configured
 */
export function isProviderConfigured(provider: OAuthProvider): boolean {
    switch (provider) {
        case "google":
            return !!GOOGLE_CLIENT_ID && !!GOOGLE_CLIENT_SECRET;
        case "github":
            return !!GITHUB_CLIENT_ID && !!GITHUB_CLIENT_SECRET;
        case "facebook":
            return !!FACEBOOK_CLIENT_ID && !!FACEBOOK_CLIENT_SECRET;
        case "microsoft":
            // Future provider - return false until implemented
            return false;
        default:
            return false;
    }
}

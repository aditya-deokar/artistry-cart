// ============================================
// AI VISION SESSION MANAGEMENT
// ============================================

import { useState, useEffect, useCallback } from 'react';

const SESSION_KEY = 'ai_vision_session_token';
const SESSION_EXPIRY_KEY = 'ai_vision_session_expiry';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Session Manager for AI Vision
 * Handles token persistence and expiry
 */
export const aiVisionSession = {
    /**
     * Save session token
     */
    saveToken(token: string): void {
        if (typeof window === 'undefined') return;

        const expiry = Date.now() + SESSION_DURATION;

        try {
            localStorage.setItem(SESSION_KEY, token);
            localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
        } catch (error) {
            console.warn('Failed to save session token:', error);
        }
    },

    /**
     * Get session token if valid
     */
    getToken(): string | null {
        if (typeof window === 'undefined') return null;

        try {
            const token = localStorage.getItem(SESSION_KEY);
            const expiryStr = localStorage.getItem(SESSION_EXPIRY_KEY);

            if (!token || !expiryStr) return null;

            const expiry = parseInt(expiryStr, 10);

            if (Date.now() > expiry) {
                // Session expired, clear it
                this.clearToken();
                return null;
            }

            return token;
        } catch (error) {
            console.warn('Failed to get session token:', error);
            return null;
        }
    },

    /**
     * Clear session token
     */
    clearToken(): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(SESSION_EXPIRY_KEY);
        } catch (error) {
            console.warn('Failed to clear session token:', error);
        }
    },

    /**
     * Check if session is valid
     */
    isValid(): boolean {
        return this.getToken() !== null;
    },

    /**
     * Extend session (refresh expiry)
     */
    extend(): void {
        const token = this.getToken();
        if (token) {
            this.saveToken(token);
        }
    },

    /**
     * Get time until expiry (ms)
     */
    getTimeUntilExpiry(): number | null {
        if (typeof window === 'undefined') return null;

        try {
            const expiryStr = localStorage.getItem(SESSION_EXPIRY_KEY);
            if (!expiryStr) return null;

            const expiry = parseInt(expiryStr, 10);
            const remaining = expiry - Date.now();

            return remaining > 0 ? remaining : null;
        } catch {
            return null;
        }
    },
};

/**
 * Hook for session status (use in React components)
 */
export function useAIVisionSession() {
    const [isValid, setIsValid] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const currentToken = aiVisionSession.getToken();
        setToken(currentToken);
        setIsValid(currentToken !== null);

        // Check periodically
        const interval = setInterval(() => {
            const validNow = aiVisionSession.isValid();
            setIsValid(validNow);
            if (!validNow) {
                setToken(null);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    const saveSession = useCallback((newToken: string) => {
        aiVisionSession.saveToken(newToken);
        setToken(newToken);
        setIsValid(true);
    }, []);

    const clearSession = useCallback(() => {
        aiVisionSession.clearToken();
        setToken(null);
        setIsValid(false);
    }, []);

    const extendSession = useCallback(() => {
        aiVisionSession.extend();
    }, []);

    return {
        isValid,
        token,
        saveSession,
        clearSession,
        extendSession,
        timeUntilExpiry: aiVisionSession.getTimeUntilExpiry(),
    };
}

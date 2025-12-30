// ============================================
// AI VISION RETRY AND ERROR HANDLING UTILITIES
// ============================================

/**
 * Retry configuration
 */
interface RetryConfig {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
    retryableStatusCodes?: number[];
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown, statusCodes: number[]): boolean {
    if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network errors
        return true;
    }

    if (error && typeof error === 'object' && 'status' in error) {
        return statusCodes.includes((error as { status: number }).status);
    }

    return false;
}

/**
 * Retry wrapper for async functions with exponential backoff
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    config: RetryConfig = {}
): Promise<T> {
    const { maxRetries, initialDelayMs, maxDelayMs, backoffMultiplier, retryableStatusCodes } = {
        ...DEFAULT_RETRY_CONFIG,
        ...config,
    };

    let lastError: unknown;
    let delay = initialDelayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt >= maxRetries || !isRetryableError(error, retryableStatusCodes)) {
                throw error;
            }

            console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, error);
            await sleep(delay);

            // Exponential backoff
            delay = Math.min(delay * backoffMultiplier, maxDelayMs);
        }
    }

    throw lastError;
}

/**
 * Parse API error response
 */
export interface ParsedError {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    isNetworkError: boolean;
    isAuthError: boolean;
    isRateLimited: boolean;
    isServerError: boolean;
    isValidationError: boolean;
    statusCode?: number;
}

export function parseApiError(error: unknown): ParsedError {
    const parsed: ParsedError = {
        message: 'An unexpected error occurred',
        isNetworkError: false,
        isAuthError: false,
        isRateLimited: false,
        isServerError: false,
        isValidationError: false,
    };

    // Network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
        parsed.message = 'Network error. Please check your internet connection.';
        parsed.isNetworkError = true;
        return parsed;
    }

    // Standard error object
    if (error && typeof error === 'object') {
        const err = error as Record<string, unknown>;

        if (typeof err.message === 'string') {
            parsed.message = err.message;
        }

        if (typeof err.code === 'string') {
            parsed.code = err.code;
        }

        if (typeof err.status === 'number') {
            parsed.statusCode = err.status;

            if (err.status === 401 || err.status === 403) {
                parsed.isAuthError = true;
                parsed.message = 'Please log in to continue.';
            } else if (err.status === 429) {
                parsed.isRateLimited = true;
                parsed.message = 'Too many requests. Please wait a moment.';
            } else if (err.status >= 500) {
                parsed.isServerError = true;
                parsed.message = 'Server error. Please try again later.';
            } else if (err.status === 400 || err.status === 422) {
                parsed.isValidationError = true;
            }
        }

        if (err.details && typeof err.details === 'object') {
            parsed.details = err.details as Record<string, unknown>;
        }
    }

    return parsed;
}

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
    NETWORK: 'Unable to connect. Please check your internet connection and try again.',
    AUTH_REQUIRED: 'Please log in to use this feature.',
    RATE_LIMITED: 'You\'re doing that too quickly. Please wait a moment and try again.',
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    GENERATION_FAILED: 'Failed to generate concepts. Please try with a different prompt.',
    SAVE_FAILED: 'Failed to save concept. Please try again.',
    SEARCH_FAILED: 'Search failed. Please try again.',
    UPLOAD_FAILED: 'Failed to upload image. Please check the file and try again.',
    MATCHES_FAILED: 'Failed to find artisan matches. Please try again.',
    SEND_FAILED: 'Failed to send request to artisans. Please try again.',
    UNKNOWN: 'An unexpected error occurred. Please refresh and try again.',
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
    const parsed = parseApiError(error);

    if (parsed.isNetworkError) return ERROR_MESSAGES.NETWORK;
    if (parsed.isAuthError) return ERROR_MESSAGES.AUTH_REQUIRED;
    if (parsed.isRateLimited) return ERROR_MESSAGES.RATE_LIMITED;
    if (parsed.isServerError) return ERROR_MESSAGES.SERVER_ERROR;

    return parsed.message || ERROR_MESSAGES.UNKNOWN;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
    func: T,
    waitMs: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, waitMs);
    };
}

/**
 * Throttle function for scroll handlers
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
    func: T,
    limitMs: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limitMs);
        }
    };
}

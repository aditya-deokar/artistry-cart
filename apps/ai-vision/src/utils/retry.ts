import { logger } from './logger';

export interface RetryOptions {
    maxRetries: number;
    delayMs: number;
    backoffMultiplier: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
    maxRetries: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
};

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
): Promise<T> {
    const { maxRetries, delayMs, backoffMultiplier } = { ...DEFAULT_OPTIONS, ...options };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) {
                logger.error(`Max retries (${maxRetries}) reached`, { error: lastError.message });
                throw lastError;
            }

            const delay = delayMs * Math.pow(backoffMultiplier, attempt);
            logger.warn(`Retry ${attempt + 1}/${maxRetries} in ${delay}ms`, {
                error: lastError.message
            });

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

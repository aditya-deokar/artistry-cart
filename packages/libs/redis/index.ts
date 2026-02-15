import Redis from "ioredis";

// Check if Redis should be enabled
// Set REDIS_ENABLED=false in .env to disable Redis entirely
const REDIS_ENABLED = process.env.REDIS_ENABLED !== "false";
const redisUrl = process.env.REDIS_URL;

let redisClient: Redis | null = null;
let connectionFailed = false;
let initialized = false;

/**
 * Initialize Redis client with error handling
 * Only creates client if Redis is enabled and URL is provided
 */
function initializeRedis(): void {
    if (initialized) return;
    initialized = true;

    // Skip if Redis is disabled or no URL
    if (!REDIS_ENABLED || !redisUrl) {
        console.log("ℹ️ Redis is disabled or not configured. OTP features will be unavailable.");
        connectionFailed = true;
        return;
    }

    try {
        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            retryStrategy: (times) => {
                if (times > 1) {
                    console.warn("⚠️ Redis connection failed. OTP features will be unavailable.");
                    connectionFailed = true;
                    return null; // Stop retrying
                }
                return 500; // 500ms delay before first retry
            },
            connectTimeout: 5000, // 5 second timeout
            lazyConnect: true,
            enableOfflineQueue: false, // Don't queue commands when disconnected
        });

        // Handle connection errors gracefully
        redisClient.on("error", (err) => {
            if (!connectionFailed) {
                console.warn("⚠️ Redis error:", err.message);
                connectionFailed = true;
            }
        });

        redisClient.on("connect", () => {
            console.log("✅ Redis connected successfully");
            connectionFailed = false;
        });

    } catch (error) {
        console.warn("⚠️ Failed to create Redis client:", error);
        connectionFailed = true;
    }
}

/**
 * Get Redis client (lazy initialization)
 */
function getClient(): Redis | null {
    if (!initialized) {
        initializeRedis();
    }
    return connectionFailed ? null : redisClient;
}

// Redis wrapper with fallback to null/0 when unavailable
const redis = {
    async get(key: string): Promise<string | null> {
        const client = getClient();
        if (!client) return null;

        try {
            if (client.status !== "ready" && client.status !== "connect") {
                await client.connect();
            }
            return await client.get(key);
        } catch (err) {
            connectionFailed = true;
            return null;
        }
    },

    async set(key: string, value: string | number, ...args: (string | number)[]): Promise<string | null> {
        const client = getClient();
        if (!client) return null;

        try {
            if (client.status !== "ready" && client.status !== "connect") {
                await client.connect();
            }
            // @ts-expect-error - ioredis typing issue with variadic args
            return await client.set(key, String(value), ...args);
        } catch (err) {
            connectionFailed = true;
            return null;
        }
    },

    async del(...keys: string[]): Promise<number> {
        const client = getClient();
        if (!client) return 0;

        try {
            if (client.status !== "ready" && client.status !== "connect") {
                await client.connect();
            }
            return await client.del(...keys);
        } catch (err) {
            connectionFailed = true;
            return 0;
        }
    },

    async keys(pattern: string): Promise<string[]> {
        const client = getClient();
        if (!client) return [];

        try {
            if (client.status !== "ready" && client.status !== "connect") {
                await client.connect();
            }
            return await client.keys(pattern);
        } catch (err) {
            connectionFailed = true;
            return [];
        }
    },

    async setex(key: string, seconds: number, value: string): Promise<string | null> {
        const client = getClient();
        if (!client) return null;

        try {
            if (client.status !== "ready" && client.status !== "connect") {
                await client.connect();
            }
            return await client.setex(key, seconds, value);
        } catch (err) {
            connectionFailed = true;
            return null;
        }
    },

    isAvailable(): boolean {
        return !connectionFailed && redisClient !== null;
    }
};

export default redis;
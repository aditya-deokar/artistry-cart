/**
 * Simple script to test database connectivity
 * Usage: npx tsx apps/ai-vision/src/test-db.ts
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'apps/ai-vision/.env') });

console.log('🔍 Database Connectivity Test');
console.log('---------------------------');
console.log('Current working directory:', process.cwd());

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('❌ DATABASE_URL is undefined!');
    console.error('Check your .env file in project root or apps/ai-vision/.env');
    process.exit(1);
}

// Mask the password for logging
const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');
console.log(`📡 Connecting to: ${maskedUrl}`);

async function testConnection() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: dbUrl
            }
        },
        log: ['info', 'error', 'warn']
    });

    try {
        console.log('⏳ Attempting to connect...');
        await prisma.$connect();
        console.log('✅ Connected successfully!');

        console.log('⏳ Running query: SELECT 1 (mongo equivalent)...');
        // For MongoDB, we can just count a collection or verify connection via runCommand
        // Prisma doesn't support raw SQL 'SELECT 1' for Mongo, so we'll just check if we can query

        try {
            // Just try to connect and run a simple command if possible, or just trust connect()
            await prisma.$runCommandRaw({ ping: 1 });
            console.log('✅ Ping successful!');
        } catch (e) {
            console.warn('⚠️ Ping failed (might be permissions), but connection opened.');
            console.warn(e);
        }

    } catch (error: any) {
        console.error('❌ Connection failed!');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();

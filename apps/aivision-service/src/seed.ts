/**
 * Seed script for AI Vision service
 * Creates sample sessions, concepts, and generated products for testing
 */
import { PrismaClient, VisionMode, SessionStatus, ConceptStatus, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAIVision() {
    console.log('🌱 Seeding AI Vision data...');

    // Create a test user session
    const session = await prisma.visionSession.create({
        data: {
            sessionToken: 'test-session-' + Date.now(),
            mode: VisionMode.TEXT_TO_IMAGE,
            status: SessionStatus.ACTIVE,
            prompt: 'Traditional Indian brass lamp with peacock design',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
    });
    console.log('✅ Created session:', session.id);

    // Create sample concepts
    const concepts = await Promise.all([
        prisma.concept.create({
            data: {
                sessionId: session.id,
                generationPrompt: 'Handcrafted brass peacock oil lamp with intricate detailing',
                enhancedPrompt: 'Professional product photography of a traditional Indian brass peacock oil lamp, intricate hand-carved feather details, antique patina finish, warm golden tones, studio lighting with soft shadows, white marble background, 4K resolution, artisan craftmanship',
                primaryImageUrl: 'https://ik.imagekit.io/artistrycart/concepts/peacock_lamp_1.jpg',
                thumbnailUrl: 'https://ik.imagekit.io/artistrycart/concepts/peacock_lamp_1_thumb.jpg',
                analyzedFeatures: {
                    category: 'Home Decor',
                    subcategory: 'Lamps',
                    styleKeywords: ['traditional', 'Indian', 'brass', 'peacock'],
                    materials: ['brass', 'metal'],
                    colors: ['gold', 'bronze', 'antique'],
                },
                estimatedPrice: { min: 1500, max: 3500 },
                status: ConceptStatus.SAVED,
                isSaved: true,
                viewCount: 42,
            },
        }),
        prisma.concept.create({
            data: {
                sessionId: session.id,
                generationPrompt: 'Block printed cotton saree with lotus motifs',
                enhancedPrompt: 'Elegant block-printed cotton saree with hand-stamped lotus flower motifs, indigo and white color palette, traditional Rajasthani craftsmanship, draped on mannequin, studio lighting',
                primaryImageUrl: 'https://ik.imagekit.io/artistrycart/concepts/lotus_saree_1.jpg',
                thumbnailUrl: 'https://ik.imagekit.io/artistrycart/concepts/lotus_saree_1_thumb.jpg',
                analyzedFeatures: {
                    category: 'Clothing',
                    subcategory: 'Sarees',
                    styleKeywords: ['block print', 'traditional', 'ethnic'],
                    materials: ['cotton', 'natural dye'],
                    colors: ['indigo', 'white', 'off-white'],
                },
                estimatedPrice: { min: 2000, max: 4500 },
                status: ConceptStatus.GENERATED,
                isSaved: true,
                viewCount: 28,
            },
        }),
        prisma.concept.create({
            data: {
                sessionId: session.id,
                generationPrompt: 'Terracotta jewelry set with tribal patterns',
                enhancedPrompt: 'Handcrafted terracotta jewelry set featuring earrings and necklace with geometric tribal patterns, earth-toned colors, traditional pottery techniques, displayed on wooden surface',
                primaryImageUrl: 'https://ik.imagekit.io/artistrycart/concepts/terracotta_jewelry_1.jpg',
                thumbnailUrl: 'https://ik.imagekit.io/artistrycart/concepts/terracotta_jewelry_1_thumb.jpg',
                analyzedFeatures: {
                    category: 'Jewelry',
                    subcategory: 'Sets',
                    styleKeywords: ['tribal', 'ethnic', 'handmade'],
                    materials: ['terracotta', 'clay'],
                    colors: ['terracotta', 'red', 'brown'],
                },
                estimatedPrice: { min: 800, max: 1800 },
                status: ConceptStatus.SAVED,
                isSaved: true,
                viewCount: 15,
            },
        }),
    ]);
    console.log('✅ Created', concepts.length, 'concepts');

    // Create generated products for concepts
    for (const concept of concepts) {
        await prisma.aIGeneratedProduct.create({
            data: {
                conceptId: concept.id,
                title: concept.generationPrompt.substring(0, 50),
                description: `Beautiful ${concept.generationPrompt}, handcrafted by skilled Indian artisans.`,
                detailedDescription: `This exquisite piece represents the finest traditions of Indian craftsmanship. ${concept.generationPrompt}. Each piece is carefully handmade using traditional techniques passed down through generations. Perfect for those who appreciate authentic handcrafted items with cultural significance.`,
                category: (concept.analyzedFeatures as any)?.category || 'Handcraft',
                subCategory: (concept.analyzedFeatures as any)?.subcategory || 'General',
                tags: (concept.analyzedFeatures as any)?.styleKeywords || ['handmade', 'artisan'],
                colors: (concept.analyzedFeatures as any)?.colors || ['natural'],
                sizes: [],
                materials: (concept.analyzedFeatures as any)?.materials || ['natural materials'],
                customSpecifications: {},
                estimatedPriceMin: (concept.estimatedPrice as any)?.min || 1000,
                estimatedPriceMax: (concept.estimatedPrice as any)?.max || 3000,
                priceConfidence: 0.85,
                pricingRationale: 'Based on similar handcrafted items in the marketplace',
                requiredSkills: ['handcrafting', 'traditional techniques'],
                estimatedDuration: '3-5 days',
                complexityLevel: 'moderate',
                styleKeywords: (concept.analyzedFeatures as any)?.styleKeywords || [],
                designNotes: 'Authentic handcrafted design',
                feasibilityScore: 85,
                feasibilityNotes: 'Can be produced by skilled artisans',
                llmModel: 'gemini-2.5-pro',
                promptUsed: concept.enhancedPrompt || concept.generationPrompt,
                generationVersion: 1,
                isValidated: true,
                validationErrors: [],
            },
        });
    }
    console.log('✅ Created generated products for concepts');

    // Create concept images
    for (const concept of concepts) {
        await prisma.conceptImage.create({
            data: {
                conceptId: concept.id,
                originalUrl: concept.primaryImageUrl,
                thumbnailUrl: concept.thumbnailUrl,
                fileId: `file_${concept.id}_1`,
                filePath: `/concepts/${concept.id}/image_1.jpg`,
                fileSize: 256000,
                mimeType: 'image/jpeg',
                dimensions: { width: 1024, height: 1024 },
                embedding: [],
                dominantColors: ['#C9A227', '#8B4513', '#FFFFFF'],
                detectedObjects: ['product', 'handcraft'],
                styleKeywords: (concept.analyzedFeatures as any)?.styleKeywords || [],
                position: 0,
                isPrimary: true,
            },
        });
    }
    console.log('✅ Created concept images');

    // Create rate limit entry (for testing)
    await prisma.rateLimitEntry.create({
        data: {
            key: 'test:user:concepts',
            count: 5,
            windowStart: new Date(),
        },
    });
    console.log('✅ Created rate limit entry');

    // Create API usage log
    await prisma.aPIUsageLog.create({
        data: {
            sessionToken: session.sessionToken,
            endpoint: '/generate/text-to-image',
            service: 'gemini',
            imagesGenerated: 4,
            success: true,
            durationMs: 8500,
        },
    });
    console.log('✅ Created API usage log');

    console.log('\n🎉 AI Vision seed data created successfully!');
    console.log('\nTest endpoints:');
    console.log('  GET http://localhost:8080/api/v1/ai/gallery');
    console.log('  GET http://localhost:8080/api/v1/ai/concepts');
    console.log('  GET http://localhost:8080/api/v1/ai/schema/categories');
}

async function main() {
    try {
        await seedAIVision();
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

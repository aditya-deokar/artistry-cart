'use server';

/**
 * Server Actions for Artisan Data
 * 
 * These actions handle fetching artisan data from the backend.
 * In a real implementation, these would call the product-service API.
 */

import type { Artisan } from '@/components/artisans/ArtisanCard';

// Mock data - Replace with actual API calls
const mockArtisans: Artisan[] = [
    {
        id: '1',
        name: 'Maria Santos',
        title: 'Master Ceramicist',
        craft: 'Ceramics & Pottery',
        location: 'Lisbon, Portugal',
        country: 'Portugal',
        image: 'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?w=600&h=800&fit=crop',
        rating: 4.9,
        reviewCount: 127,
        productCount: 45,
        isVerified: true,
        isTopSeller: true,
        featuredProducts: [
            { id: 'p1', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=100&h=100&fit=crop', name: 'Ceramic Vase' },
            { id: 'p2', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=100&h=100&fit=crop', name: 'Bowl Set' },
            { id: 'p3', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=100&h=100&fit=crop', name: 'Planter' },
        ],
    },
    {
        id: '2',
        name: 'Kenji Tanaka',
        title: 'Wood Artisan',
        craft: 'Woodworking',
        location: 'Kyoto, Japan',
        country: 'Japan',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop',
        rating: 4.8,
        reviewCount: 89,
        productCount: 32,
        isVerified: true,
        featuredProducts: [
            { id: 'p4', image: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=100&h=100&fit=crop', name: 'Cutting Board' },
            { id: 'p5', image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=100&h=100&fit=crop', name: 'Wooden Bowl' },
        ],
    },
    {
        id: '3',
        name: 'Amara Okonkwo',
        title: 'Textile Weaver',
        craft: 'Textiles & Weaving',
        location: 'Lagos, Nigeria',
        country: 'Nigeria',
        image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=800&fit=crop',
        rating: 4.7,
        reviewCount: 64,
        productCount: 28,
        isVerified: true,
        isNew: true,
    },
    {
        id: '4',
        name: 'Isabella Romano',
        title: 'Jewelry Designer',
        craft: 'Jewelry & Metalwork',
        location: 'Florence, Italy',
        country: 'Italy',
        image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&h=800&fit=crop',
        rating: 4.9,
        reviewCount: 156,
        productCount: 67,
        isVerified: true,
        isTopSeller: true,
        featuredProducts: [
            { id: 'p6', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop', name: 'Gold Ring' },
            { id: 'p7', image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=100&h=100&fit=crop', name: 'Necklace' },
            { id: 'p8', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop', name: 'Bracelet' },
            { id: 'p9', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&h=100&fit=crop', name: 'Earrings' },
        ],
    },
    {
        id: '5',
        name: 'Henrik Olsen',
        title: 'Glass Artist',
        craft: 'Glass & Crystal',
        location: 'Copenhagen, Denmark',
        country: 'Denmark',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop',
        rating: 4.6,
        reviewCount: 42,
        productCount: 19,
        isVerified: true,
    },
    {
        id: '6',
        name: 'Sofia Martinez',
        title: 'Leather Craftsman',
        craft: 'Leather Goods',
        location: 'Barcelona, Spain',
        country: 'Spain',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop',
        rating: 4.8,
        reviewCount: 78,
        productCount: 34,
        isVerified: true,
    },
    {
        id: '7',
        name: 'Raj Patel',
        title: 'Fine Art Painter',
        craft: 'Painting & Fine Art',
        location: 'Mumbai, India',
        country: 'India',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop',
        rating: 4.7,
        reviewCount: 53,
        productCount: 41,
        isVerified: true,
        isNew: true,
        featuredProducts: [
            { id: 'p10', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=100&h=100&fit=crop', name: 'Abstract Art' },
            { id: 'p11', image: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?w=100&h=100&fit=crop', name: 'Portrait' },
        ],
    },
    {
        id: '8',
        name: 'Chen Wei',
        title: 'Calligraphy Master',
        craft: 'Paper & Calligraphy',
        location: 'Beijing, China',
        country: 'China',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop',
        rating: 4.9,
        reviewCount: 98,
        productCount: 23,
        isVerified: true,
    },
    {
        id: '9',
        name: 'Elena Petrov',
        title: 'Sculptress',
        craft: 'Sculpture',
        location: 'Moscow, Russia',
        country: 'Russia',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop',
        rating: 4.8,
        reviewCount: 67,
        productCount: 15,
        isVerified: true,
        isTopSeller: true,
    },
    {
        id: '10',
        name: 'Yuki Nakamura',
        title: 'Pottery Artist',
        craft: 'Ceramics & Pottery',
        location: 'Tokyo, Japan',
        country: 'Japan',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop',
        rating: 4.7,
        reviewCount: 45,
        productCount: 29,
        isVerified: true,
    },
    {
        id: '11',
        name: 'Marcus Johnson',
        title: 'Metal Smith',
        craft: 'Jewelry & Metalwork',
        location: 'Austin, Texas',
        country: 'USA',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop',
        rating: 4.6,
        reviewCount: 34,
        productCount: 22,
        isVerified: true,
        isNew: true,
    },
    {
        id: '12',
        name: 'Fatima Al-Hassan',
        title: 'Textile Artist',
        craft: 'Textiles & Weaving',
        location: 'Marrakech, Morocco',
        country: 'Morocco',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop',
        rating: 4.9,
        reviewCount: 112,
        productCount: 56,
        isVerified: true,
        isTopSeller: true,
    },
];

// Category mapping for region-based filtering
const regionMapping: Record<string, string[]> = {
    europe: ['Portugal', 'Italy', 'Denmark', 'Spain', 'Russia'],
    asia: ['Japan', 'India', 'China'],
    africa: ['Nigeria', 'Morocco'],
    'north-america': ['USA', 'Canada'],
    'south-america': ['Brazil', 'Argentina'],
    oceania: ['Australia', 'New Zealand'],
};

// Craft category mapping
const craftMapping: Record<string, string> = {
    ceramics: 'Ceramics & Pottery',
    jewelry: 'Jewelry & Metalwork',
    textiles: 'Textiles & Weaving',
    woodwork: 'Woodworking',
    painting: 'Painting & Fine Art',
    sculpture: 'Sculpture',
    glass: 'Glass & Crystal',
    leather: 'Leather Goods',
    paper: 'Paper & Calligraphy',
};

export interface ArtisanFilters {
    search?: string;
    category?: string;
    location?: string;
    rating?: string;
    sort?: string;
    page?: number;
    limit?: number;
}

export interface ArtisansResponse {
    artisans: Artisan[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}

export interface CategoryCount {
    value: string;
    label: string;
    count: number;
}

/**
 * Fetch artisans with filtering, sorting, and pagination
 */
export async function getArtisans(filters: ArtisanFilters = {}): Promise<ArtisansResponse> {
    const {
        search = '',
        category = 'all',
        location = 'all',
        rating = 'all',
        sort = 'featured',
        page = 1,
        limit = 12,
    } = filters;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredArtisans = [...mockArtisans];

    // Search filter
    if (search) {
        const searchLower = search.toLowerCase();
        filteredArtisans = filteredArtisans.filter(
            (a) =>
                a.name.toLowerCase().includes(searchLower) ||
                a.title.toLowerCase().includes(searchLower) ||
                a.craft.toLowerCase().includes(searchLower) ||
                a.location.toLowerCase().includes(searchLower)
        );
    }

    // Category filter
    if (category !== 'all' && craftMapping[category]) {
        filteredArtisans = filteredArtisans.filter(
            (a) => a.craft === craftMapping[category]
        );
    }

    // Location/Region filter
    if (location !== 'all' && regionMapping[location]) {
        filteredArtisans = filteredArtisans.filter((a) =>
            regionMapping[location].includes(a.country)
        );
    }

    // Rating filter
    if (rating !== 'all') {
        if (rating === 'new') {
            filteredArtisans = filteredArtisans.filter((a) => a.isNew);
        } else {
            const minRating = parseFloat(rating);
            filteredArtisans = filteredArtisans.filter((a) => a.rating >= minRating);
        }
    }

    // Sorting
    switch (sort) {
        case 'newest':
            // Sort by isNew first, then by id (simulating newest)
            filteredArtisans.sort((a, b) => {
                if (a.isNew && !b.isNew) return -1;
                if (!a.isNew && b.isNew) return 1;
                return parseInt(b.id) - parseInt(a.id);
            });
            break;
        case 'rating':
            filteredArtisans.sort((a, b) => b.rating - a.rating);
            break;
        case 'products':
            filteredArtisans.sort((a, b) => b.productCount - a.productCount);
            break;
        case 'name':
            filteredArtisans.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'featured':
        default:
            // Top sellers first, then by rating
            filteredArtisans.sort((a, b) => {
                if (a.isTopSeller && !b.isTopSeller) return -1;
                if (!a.isTopSeller && b.isTopSeller) return 1;
                return b.rating - a.rating;
            });
            break;
    }

    // Pagination
    const total = filteredArtisans.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedArtisans = filteredArtisans.slice(startIndex, startIndex + limit);

    return {
        artisans: paginatedArtisans,
        total,
        page,
        totalPages,
        hasMore: page < totalPages,
    };
}

/**
 * Get featured artisans for the carousel
 */
export async function getFeaturedArtisans(limit = 6): Promise<Artisan[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return mockArtisans
        .filter((a) => a.isTopSeller || a.rating >= 4.8)
        .slice(0, limit);
}

/**
 * Get artisan categories with counts
 */
export async function getArtisanCategories(): Promise<CategoryCount[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const categoryCounts = mockArtisans.reduce((acc, artisan) => {
        // Find the category key for this craft
        const categoryKey = Object.entries(craftMapping).find(
            ([, label]) => label === artisan.craft
        )?.[0];

        if (categoryKey) {
            acc[categoryKey] = (acc[categoryKey] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(craftMapping).map(([value, label]) => ({
        value,
        label,
        count: categoryCounts[value] || 0,
    }));
}

/**
 * Get artisan by ID
 */
export async function getArtisanById(id: string): Promise<Artisan | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return mockArtisans.find((a) => a.id === id) || null;
}

/**
 * Search artisans with suggestions (for autocomplete)
 */
export async function searchArtisanSuggestions(
    query: string,
    limit = 5
): Promise<{ type: 'artisan' | 'craft' | 'location'; value: string; label: string }[]> {
    if (!query || query.length < 2) return [];

    await new Promise((resolve) => setTimeout(resolve, 150));

    const queryLower = query.toLowerCase();
    const suggestions: { type: 'artisan' | 'craft' | 'location'; value: string; label: string }[] = [];

    // Search artisan names
    const matchingArtisans = mockArtisans
        .filter((a) => a.name.toLowerCase().includes(queryLower))
        .slice(0, 3);

    matchingArtisans.forEach((a) => {
        suggestions.push({
            type: 'artisan',
            value: a.id,
            label: `${a.name} - ${a.title}`,
        });
    });

    // Search crafts
    Object.entries(craftMapping).forEach(([key, label]) => {
        if (label.toLowerCase().includes(queryLower)) {
            suggestions.push({
                type: 'craft',
                value: key,
                label,
            });
        }
    });

    // Search locations
    const locations = [...new Set(mockArtisans.map((a) => a.location))];
    locations
        .filter((l) => l.toLowerCase().includes(queryLower))
        .slice(0, 2)
        .forEach((l) => {
            suggestions.push({
                type: 'location',
                value: l,
                label: l,
            });
        });

    return suggestions.slice(0, limit);
}

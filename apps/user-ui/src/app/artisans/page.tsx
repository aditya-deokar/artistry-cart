/**
 * Artistry Cart - Artisans Discovery Page
 * 
 * Browse and discover artisan makers worldwide.
 * 
 * @see docs/brand/ARTISANS_PAGE_BLUEPRINT.md for design specifications
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/landing';
import { ArtisansPageClient } from './ArtisansPageClient';

export const metadata: Metadata = {
    title: 'Discover Artisans | Artistry Cart',
    description:
        'Explore 5,000+ verified artisans from 120+ countries. Find master craftspeople in ceramics, jewelry, textiles, woodworking, and more. Connect with the hands behind the art.',
    openGraph: {
        title: 'Meet the Artisans | Artistry Cart',
        description: 'Discover extraordinary makers from around the world',
        images: ['/images/og-artisans.jpg'],
    },
    keywords: [
        'artisans',
        'handmade',
        'craftspeople',
        'ceramics',
        'jewelry makers',
        'woodworkers',
        'textile artists',
        'custom commissions',
    ],
};

export default function ArtisansPage() {
    return (
        <>
            <Navigation />

            <main>
                <Suspense fallback={<ArtisansPageSkeleton />}>
                    <ArtisansPageClient />
                </Suspense>
            </main>

            <Footer />
        </>
    );
}

function ArtisansPageSkeleton() {
    return (
        <div className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
            {/* Hero Skeleton */}
            <div className="min-h-[90vh] flex items-center pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 animate-pulse">
                            <div className="h-4 w-24 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                            <div className="space-y-3">
                                <div className="h-12 w-3/4 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                                <div className="h-12 w-1/2 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                            </div>
                            <div className="h-24 w-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                            <div className="h-14 w-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                        </div>
                        <div className="aspect-[4/5] bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}

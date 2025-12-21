import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ArtisanDetailClient } from './ArtisanDetailClient';
import { getArtisanById } from '@/actions/artisan.actions';

interface ArtisanPageProps {
    params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArtisanPageProps): Promise<Metadata> {
    const { id } = await params;
    const artisan = await getArtisanById(id);

    if (!artisan) {
        return {
            title: 'Artisan Not Found | Artistry Cart',
        };
    }

    return {
        title: `${artisan.name} - ${artisan.title} | Artistry Cart`,
        description: `Discover the handcrafted creations of ${artisan.name}, a master ${artisan.craft.toLowerCase()} artisan from ${artisan.location}. Browse ${artisan.productCount} unique pieces.`,
        openGraph: {
            title: `${artisan.name} - ${artisan.title}`,
            description: `Discover handcrafted ${artisan.craft.toLowerCase()} from ${artisan.location}`,
            images: [artisan.image],
        },
    };
}

// Loading skeleton
function ArtisanDetailSkeleton() {
    return (
        <div className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
            {/* Hero Skeleton */}
            <div className="relative h-[60vh] min-h-[500px] bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] animate-pulse" />

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-8 w-64 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                        <div className="space-y-3">
                            <div className="h-4 w-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                            <div className="h-4 w-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                            <div className="h-4 w-3/4 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-32 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                        <div className="h-12 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default async function ArtisanPage({ params }: ArtisanPageProps) {
    const { id } = await params;
    const artisan = await getArtisanById(id);

    if (!artisan) {
        notFound();
    }

    return (
        <Suspense fallback={<ArtisanDetailSkeleton />}>
            <ArtisanDetailClient artisan={artisan} />
        </Suspense>
    );
}

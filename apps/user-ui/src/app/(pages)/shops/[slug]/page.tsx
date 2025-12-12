'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, notFound } from 'next/navigation';
import axiosInstance from '@/utils/axiosinstance';

// --- Import your new components ---
import { ShopHeader } from '@/components/shops/single-shop/ShopHeader';
import { ShopInfoSidebar } from '@/components/shops/single-shop/ShopInfoSidebar';
import { ShopProductList } from '@/components/shops/single-shop/ShopProductList';
import { ShopReviews } from '@/components/shops/single-shop/ShopReviews';

// --- Import shared components ---
import { Bounded } from '@/components/common/Bounded';

// --- Type Definitions for this Page ---
interface ShopData {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    category: string;
    avatar: { url: string; file_id: string } | null;
    coverBanner: string | null;
    address: string;
    website: string | null;
    socialLinks: { platform: string; url: string }[];
    ratings: number;
    opening_hours: string
    _count: {
        products: number;
        reviews: number;
    };
}


// ... imports
import { useQueryState, parseAsString } from 'nuqs';

const TabbedContent: React.FC<{ shop: ShopData }> = ({ shop }) => {
    // nuqs: URL state for tabs
    const [activeTab, setActiveTab] = useQueryState('tab', parseAsString.withDefault('products').withOptions({
        shallow: true,
        history: 'push' // Bookmark-able tabs
    }));

    return (
        <div>
            <div className="border-b border-neutral-800 mb-8">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-3 font-semibold ${activeTab === 'products' ? 'text-primary/50 border-b-2 border-accent' : 'text-primary/90'}`}
                >
                    Products
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 font-semibold ${activeTab === 'reviews' ? 'text-primary/50 border-b-2 border-accent' : 'text-primary/90'}`}
                >
                    Reviews
                </button>
            </div>
            <div>
                {activeTab === 'products' && <ShopProductList shopId={shop.id} totalProducts={shop._count.products} />}
                {activeTab === 'reviews' && <ShopReviews shopId={shop.id} totalReviews={shop._count.reviews} />}
            </div>
        </div>
    )
}

export default function SingleShopPage() {
    const params = useParams();
    const slug = typeof params.slug === 'string' ? params.slug : '';

    // Main query to get the shop's core details
    const { data: shop, isLoading, isError } = useQuery<ShopData>({
        queryKey: ['shop', slug],
        queryFn: async () => {
            const res = await axiosInstance.get(`/product/api/shops/${slug}`);
            return res.data.data.shop; // Access shop from the nested data property in the new API response
        },
        enabled: !!slug,
    });

    // The initial loading is handled by loading.tsx, so we can return null here
    if (isLoading) return null;

    if (isError || !shop) {
        return notFound();
    }

    console.log(shop)

    return (
        <>
            {/* ---  ShopHeader (Full-width) --- */}
            <ShopHeader shop={shop} />

            <Bounded>
                <main className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">

                    {/* --- ShopInfoSidebar --- */}
                    <aside className="lg:col-span-1">
                        <ShopInfoSidebar shop={shop} />
                    </aside>

                    {/* --- Products and Reviews --- */}
                    <section className="lg:col-span-3">
                        {/* Using a Tab component is the best UX pattern here */}
                        <TabbedContent shop={shop} />
                    </section>

                </main>
            </Bounded>
        </>
    );
}
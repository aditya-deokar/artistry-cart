'use client';

import React from 'react';
import { useStore } from '@/store';
import { AnimatePresence } from 'framer-motion';
import { type ArtProduct } from '@/types/products';

// --- UI & Helper Components ---
import { Bounded } from '@/components/common/Bounded';

import { EmptyWishlist } from '@/components/wishlist/EmptyWishlist';
import { WishlistItem } from '@/components/wishlist/WishlistItem';
import useAnalytics from '@/hooks/useAnalytics';

const WishlistPage = () => {


    // Select state slices
    const wishlistItems = useStore((state) => state.wishlist);
    const { trackEvent } = useAnalytics();

    // Select actions from the nested 'actions' object
    const { addToCart, removeFromWishlist } = useStore((state) => state.actions);

    const handleRemoveFromWishlist = (productId: string) => {
        const existingItem = wishlistItems.find((item) => item.id === productId);
        if (!existingItem) {
            return;
        }

        removeFromWishlist(productId);
        void trackEvent({
            action: 'remove_from_wishlist',
            productId: existingItem.id,
            shopId: existingItem.Shop?.id,
            quantity: existingItem.quantity,
            source: 'user-ui.wishlist-page',
        });
    };

    const handleMoveToCart = (product: ArtProduct) => {
        const quantity = (product as { quantity?: number }).quantity ?? 1;

        addToCart({ ...product, quantity } as any);
        removeFromWishlist(product.id);
        void trackEvent({
            action: 'add_to_cart',
            productId: product.id,
            shopId: product.Shop?.id,
            quantity,
            source: 'user-ui.wishlist-page',
        });
        void trackEvent({
            action: 'remove_from_wishlist',
            productId: product.id,
            shopId: product.Shop?.id,
            quantity,
            source: 'user-ui.wishlist-page',
        });
    };

    return (
        <Bounded className="py-16 md:py-24">
            <div className="max-w-4xl mx-auto">
               
                <div className="text-center mb-12">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                        My Art Wishlist
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                        The pieces you love, all in one place. Ready to make them yours?
                    </p>
                </div>

                {/* --- Wishlist Content --- */}
                {wishlistItems && wishlistItems.length > 0 ? (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {wishlistItems.map((product: any) => (
                                <WishlistItem
                                    key={product.id}
                                    product={product}
                                    onRemove={handleRemoveFromWishlist}
                                    onMoveToCart={handleMoveToCart}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <EmptyWishlist />
                )}
            </div>
        </Bounded>
    );
};

export default WishlistPage;

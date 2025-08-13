'use client';

import React from 'react';
import { useStore } from '@/store'; 
import { AnimatePresence } from 'framer-motion';

// --- UI & Helper Components ---
import { Bounded } from '@/components/common/Bounded';

import { EmptyWishlist } from '@/components/wishlist/EmptyWishlist';
import { WishlistItem } from '@/components/wishlist/WishlistItem';

const WishlistPage = () => {


    // Select state slices
    const wishlistItems = useStore((state) => state.wishlist);

    // Select actions from the nested 'actions' object
    const { addToCart, removeFromWishlist } = useStore((state) => state.actions);

    
    

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
                                    // The component now passes the store actions directly as props.
                                    // The complex handler logic has been removed from the page.
                                    onRemove={removeFromWishlist}
                                    onMoveToCart={addToCart}
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
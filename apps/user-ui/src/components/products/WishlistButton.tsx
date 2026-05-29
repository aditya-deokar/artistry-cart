'use client'
import React from 'react'
import { Button } from '../ui/button'
import { Heart } from 'lucide-react'
import { useStore } from '@/store'
import useAnalytics from '@/hooks/useAnalytics'
import { ArtProduct } from '@/types/products'

const WishlistButton = ({productId, product}: { productId:string, product:ArtProduct }) => {
    const { trackEvent } = useAnalytics();

    const wishlistItems = useStore((state) => state.wishlist); 
    const { removeFromWishlist,addToWishlist } = useStore((state) => state.actions);
    const isWishlisted = wishlistItems.some((item:any)=> item.id == productId );
    const handleClick = () => {
        if (isWishlisted) {
            removeFromWishlist(productId);
            void trackEvent({
                action: 'remove_from_wishlist',
                productId,
                shopId: product?.Shop?.id,
                source: 'user-ui.wishlist-button',
            });
            return;
        }

        addToWishlist({ ...product, quantity: 1 } as any);
        void trackEvent({
            action: 'add_to_wishlist',
            productId,
            shopId: product?.Shop?.id,
            quantity: 1,
            source: 'user-ui.wishlist-button',
        });
    };

  return (
    <Button
                          onClick={handleClick}
                          variant="outline" size="icon" className="bg-background rounded-full shadow-md hover:bg-background">
                              <Heart
                              fill={ isWishlisted ? "red" : "transparent"} 
                              stroke={isWishlisted ? "red" : "#4B5563"}
                              size={18} />
    </Button>
  )
}

export default WishlistButton

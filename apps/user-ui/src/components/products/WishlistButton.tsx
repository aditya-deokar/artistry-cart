'use client'
import React from 'react'
import { Button } from '../ui/button'
import { Heart } from 'lucide-react'
import { useStore } from '@/store'
import useUser from '@/hooks/useUser'
import useLocationTracking from '@/hooks/useLocationTracking'
import useDeviceTracking from '@/hooks/useDeviceTracking'
import { ArtProduct } from '@/types/products'

const WishlistButton = ({productId, product}: { productId:string, product:ArtProduct }) => {
    const { user }=useUser();
    const  location= useLocationTracking();
    const deviceInfo = useDeviceTracking();

    const wishlistItems = useStore((state) => state.wishlist); 
    const { removeFromWishlist,addToWishlist } = useStore((state) => state.actions);
    const isWishlisted = wishlistItems.some((item:any)=> item.id == productId );

  return (
    <Button
                          onClick={()=> isWishlisted ? removeFromWishlist(productId, user, location, deviceInfo) :  addToWishlist({...product, quantity:1}, user, location, deviceInfo)}
                          variant="outline" size="icon" className="bg-background rounded-full shadow-md hover:bg-background">
                              <Heart
                              fill={ isWishlisted ? "red" : "transparent"} 
                              stroke={isWishlisted ? "red" : "#4B5563"}
                              size={18} />
    </Button>
  )
}

export default WishlistButton
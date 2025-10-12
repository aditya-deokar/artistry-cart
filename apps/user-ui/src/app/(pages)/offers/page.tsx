'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { ArtProduct } from '@/types/products';

// --- Other components ---
import { Bounded } from '@/components/common/Bounded';
import Loading from './loading'; // Import the skeleton
import { TicketPercent } from 'lucide-react';
import { OfferBanner } from '@/components/offers/OfferBanner';
import { CouponCard } from '@/components/offers/CouponCard';
import { CountdownTimer } from '@/components/offers/CountdownTimer';
import { ProductCard } from '@/components/shop/ProductCard';

// Types for the API response
interface Event {
  id: string;
  title: string;
  event_type: string;
  discount_percent: number;
  starting_date: string;
  ending_date: string;
  is_active: boolean;
  products: ArtProduct[];
}

interface Coupon {
  id: string;
  discountCode: string;
  publicName: string;
  discountType: string;
  discountValue: number;
}

interface Banner {
  imageUrl: string;
  title: string;
  description?: string;
  linkUrl: string;
}


export default function OffersPage() {
    // Updated API endpoint for offers page data
    const { data, isLoading, isError } = useQuery({
        queryKey: ['offersPageData'],
        queryFn: async () => {
            const res = await axiosInstance.get('/product/api/offers/user');
            return res.data.data; // Access data from the nested data property in the new API response
        },
        staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    });

    if (isLoading) return <Loading />;
    if (isError) return <div className="text-center py-40">Failed to load offers. Please try again later.</div>;

    // Destructure from the response data
    const { banners, coupons, events } = data as { 
        banners: Banner[]; 
        coupons: Coupon[]; 
        events: Event[] 
    };
    
    // Extract products from events based on their type
    const flashSaleEvent = events?.find((event: Event) => event.event_type === 'FLASH_SALE');
    const weeklyDealEvent = events?.find((event: Event) => event.event_type === 'WEEKLY_DEAL');
    
    const flashSaleItems = flashSaleEvent?.products || [];
    const weeklyDeals = weeklyDealEvent?.products || [];

    const hasContent = [banners, coupons, events].some(arr => arr && arr.length > 0);

    // console.log(data)
    return (
        <div>
            {banners && banners.length > 0 && (
                <div className="mb-12 md:mb-16">
                    
                    <OfferBanner banner={banners[0]} />
                </div>
            )}
            
            <Bounded>
                
                {!hasContent ? (
                    <div className="text-center py-20">
                        <TicketPercent className="mx-auto w-16 h-16 text-neutral-600" />
                        <h2 className="mt-6 font-display text-4xl">No Special Offers Available</h2>
                        <p className="mt-4 text-lg text-primary/70">Please check back later for new deals and promotions.</p>
                    </div>
                ) : (
                    <div className="space-y-16 py-12">
                        {flashSaleItems && flashSaleItems.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-display text-3xl md:text-4xl">Flash Sale - Ending Soon!</h2>
                                    <div className="px-4 py-2 bg-accent/10 rounded-full text-accent flex items-center">
                                        <CountdownTimer 
                                            endDate={flashSaleEvent?.ending_date || ''} 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {flashSaleItems.map((product: ArtProduct) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </section>
                        )}
                        
                        {weeklyDeals && weeklyDeals.length > 0 && (
                            <section>
                                <h2 className="font-display text-3xl md:text-4xl mb-8">Our Best Deals</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {weeklyDeals.map((product: ArtProduct) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {coupons && coupons.length > 0 && (
                            <section>
                                <h2 className="font-display text-3xl md:text-4xl mb-8">Site-Wide Coupons</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {coupons.map((coupon: Coupon) => <CouponCard key={coupon.id} coupon={coupon} />)}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </Bounded>
        </div>
    );
}
'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';



// --- Other components ---
import { Bounded } from '@/components/common/Bounded';
import Loading from './loading'; // Import the skeleton
import { TicketPercent } from 'lucide-react';
import { OfferBanner } from '@/components/offers/OfferBanner';
import { ProductCarousel } from '@/components/offers/ProductCarousel';
import { CouponCard } from '@/components/offers/CouponCard';
import { CountdownTimer } from '@/components/offers/CountdownTimer';


export default function OffersPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['offersPageData'],
        queryFn: async () => {
            const res = await axiosInstance.get('/product/api/offers/get-page-data');
            return res.data.data;
        },
        staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    });

    if (isLoading) return <Loading />;
    if (isError) return <div className="text-center py-40">Failed to load offers. Please try again later.</div>;

    const { banners, coupons, weeklyDeals, flashSaleItems } = data;

    const hasContent = [banners, coupons, weeklyDeals, flashSaleItems].some(arr => arr && arr.length > 0);

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
                                {/* <CountdownTimer endDate={flashSaleItems[0]?.ending_date} /> */}
                                <ProductCarousel title="Flash Sale - Ending Soon!" products={flashSaleItems} />
                            </section>
                        )}
                        
                        {weeklyDeals && weeklyDeals.length > 0 && (
                            <section>
                                <ProductCarousel title="Our Best Deals" products={weeklyDeals} />
                            </section>
                        )}

                        {coupons && coupons.length > 0 && (
                            <section>
                                <h2 className="font-display text-3xl md:text-4xl mb-8">Site-Wide Coupons</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {coupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} />)}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </Bounded>
        </div>
    );
}
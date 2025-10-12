// components/dashboard/offers/LimitedTimeOffers.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Zap, Eye, Edit, MoreVertical, Timer, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import FlashSaleTimer from './FlashSaleTimer';
import Link from 'next/link';

interface LimitedTimeOffer {
  id: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  originalPrice?: number;
  salePrice?: number;
  startTime: string;
  endTime: string;
  currentStock: number;
  totalStock: number;
  soldCount: number;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDING_SOON' | 'ENDED';
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  bannerImage?: string;
  category: string;
  priority: number;
}

const sampleOffers: LimitedTimeOffer[] = [
  {
    id: '1',
    title: '24-Hour Flash Sale - Electronics',
    description: 'Massive discounts on all electronic items',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    startTime: '2025-09-08T00:00:00',
    endTime: '2025-09-09T23:59:59',
    currentStock: 45,
    totalStock: 100,
    soldCount: 55,
    status: 'ACTIVE',
    urgencyLevel: 'HIGH',
    category: 'Electronics',
    priority: 1
  },
  {
    id: '2',
    title: 'Weekend Fashion Blitz',
    description: 'Limited stock fashion items at unbeatable prices',
    discountType: 'FIXED_AMOUNT',
    discountValue: 25,
    originalPrice: 99.99,
    salePrice: 74.99,
    startTime: '2025-09-07T18:00:00',
    endTime: '2025-09-08T20:00:00',
    currentStock: 12,
    totalStock: 150,
    soldCount: 138,
    status: 'ENDING_SOON',
    urgencyLevel: 'CRITICAL',
    category: 'Fashion',
    priority: 2
  },
  {
    id: '3',
    title: 'Midnight Home & Garden Deal',
    description: 'Special pricing on home and garden essentials',
    discountType: 'PERCENTAGE',
    discountValue: 30,
    startTime: '2025-09-09T00:00:00',
    endTime: '2025-09-11T06:00:00',
    currentStock: 200,
    totalStock: 200,
    soldCount: 0,
    status: 'UPCOMING',
    urgencyLevel: 'MEDIUM',
    category: 'Home & Garden',
    priority: 3
  }
];

export default function LimitedTimeOffers() {
  const [offers, setOffers] = useState<LimitedTimeOffer[]>(sampleOffers);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Update offer statuses based on current time
      setOffers(prevOffers => 
        prevOffers.map(offer => ({
          ...offer,
          status: getOfferStatus(offer, new Date())
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getOfferStatus = (offer: LimitedTimeOffer, now: Date): LimitedTimeOffer['status'] => {
    const start = new Date(offer.startTime);
    const end = new Date(offer.endTime);
    const timeUntilEnd = end.getTime() - now.getTime();
    
    if (now < start) return 'UPCOMING';
    if (now > end) return 'ENDED';
    if (timeUntilEnd < 2 * 60 * 60 * 1000) return 'ENDING_SOON'; // Less than 2 hours
    return 'ACTIVE';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-500 text-white animate-pulse';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ENDING_SOON': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'UPCOMING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ENDED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const calculateStockPercentage = (current: number, total: number) => {
    return Math.round((current / total) * 100);
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;

    if (difference <= 0) return 'Ended';

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const activeOffers = offers.filter(offer => offer.status === 'ACTIVE' || offer.status === 'ENDING_SOON');
  const upcomingOffers = offers.filter(offer => offer.status === 'UPCOMING');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Timer className="h-6 w-6" />
            Limited Time Offers
          </h2>
          <p className="text-muted-foreground">
            Time-sensitive deals with countdown timers and stock limits
          </p>
        </div>
        <Button>
          <Clock className="h-4 w-4 mr-2" />
          Create Limited Offer
        </Button>
      </div>

      {/* Active Offers */}
      {activeOffers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Active Limited Time Offers</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeOffers.map((offer) => {
              const stockPercentage = calculateStockPercentage(offer.currentStock, offer.totalStock);
              const timeRemaining = getTimeRemaining(offer.endTime);
              
              return (
                <Card key={offer.id} className="relative overflow-hidden">
                  {/* Urgency Indicator */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${getUrgencyColor(offer.urgencyLevel)}`}></div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{offer.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {offer.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getStatusColor(offer.status)}>
                          {offer.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getUrgencyColor(offer.urgencyLevel)}>
                          {offer.urgencyLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Discount Display */}
                    <div className="text-center p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg">
                      <div className="text-3xl font-bold">
                        {offer.discountType === 'PERCENTAGE' 
                          ? `${offer.discountValue}% OFF` 
                          : `$${offer.discountValue} OFF`
                        }
                      </div>
                      {offer.originalPrice && offer.salePrice && (
                        <div className="text-sm mt-2">
                          <span className="line-through opacity-75">
                            ${offer.originalPrice}
                          </span>
                          <span className="ml-2 font-bold">
                            ${offer.salePrice}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Countdown Timer */}
                    <FlashSaleTimer
                      endTime={offer.endTime}
                      title="Ends In"
                      size="sm"
                      theme="fire"
                    />

                    {/* Stock Information */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stock Remaining</span>
                        <span className="font-medium">
                          {offer.currentStock} / {offer.totalStock}
                        </span>
                      </div>
                      <Progress 
                        value={stockPercentage} 
                        className={`h-3 ${stockPercentage < 20 ? 'bg-red-100' : 'bg-green-100'}`}
                      />
                      {stockPercentage < 20 && (
                        <div className="flex items-center gap-1 text-red-600 text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Low Stock Alert!</span>
                        </div>
                      )}
                    </div>

                    {/* Sales Information */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {offer.soldCount}
                        </div>
                        <div className="text-sm text-muted-foreground">Sold</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round((offer.soldCount / (offer.soldCount + offer.currentStock)) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Conversion</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/seller/offers/${offer.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/seller/offers/${offer.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Offers */}
      {upcomingOffers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Upcoming Limited Time Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingOffers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{offer.title}</CardTitle>
                    <Badge className={getStatusColor(offer.status)}>
                      Upcoming
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">
                      {offer.discountType === 'PERCENTAGE' 
                        ? `${offer.discountValue}% OFF` 
                        : `$${offer.discountValue} OFF`
                      }
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground text-center">
                    Starts: {formatDate(offer.startTime)}
                  </div>

                  <div className="text-center">
                    <Badge variant="outline">
                      {offer.totalStock} items available
                    </Badge>
                  </div>

                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/seller/offers/${offer.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Offers State */}
      {offers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Timer className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Limited Time Offers</h3>
            <p className="text-muted-foreground mb-6">
              Create urgency with time-limited offers and stock constraints
            </p>
            <Button>
              <Clock className="h-4 w-4 mr-2" />
              Create Your First Limited Offer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

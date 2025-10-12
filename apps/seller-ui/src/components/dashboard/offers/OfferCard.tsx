// components/dashboard/offers/OfferCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, MoreVertical, Trash2, Copy, Calendar, Users, TrendingUp, Clock, Zap, Gift, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils';

interface Offer {
  id: string;
  title: string;
  description?: string;
  type: 'SEASONAL' | 'FLASH_SALE' | 'PRICING' | 'PROMOTIONAL' | 'LIMITED_TIME';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  status: 'ACTIVE' | 'SCHEDULED' | 'ENDED' | 'DRAFT';
  startDate: string;
  endDate?: string;
  currentUsage: number;
  targetUsage?: number;
  revenue: number;
  customersReached: number;
  conversionRate: number;
  bannerImage?: {
    url: string;
    alt: string;
  };
  categories?: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface OfferCardProps {
  offer: Offer;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export default function OfferCard({ 
  offer, 
  onEdit, 
  onDelete, 
  onView,
  selectable = false,
  selected = false,
  onSelect
}: OfferCardProps) {
  const [imageError, setImageError] = useState(false);

  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'SEASONAL': return Calendar;
      case 'FLASH_SALE': return Zap;
      case 'PRICING': return DollarSign;
      case 'PROMOTIONAL': return Gift;
      case 'LIMITED_TIME': return Clock;
      default: return Gift;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ENDED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'border-red-200 bg-red-50 text-red-700';
      case 'MEDIUM': return 'border-yellow-200 bg-yellow-50 text-yellow-700';
      case 'LOW': return 'border-green-200 bg-green-50 text-green-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  // Calculate progress for offers with targets
  const progressPercentage = offer.targetUsage 
    ? Math.round((offer.currentUsage / offer.targetUsage) * 100)
    : 0;

  // Check if offer is ending soon (within 24 hours)
  const isEndingSoon = offer.endDate && 
    new Date(offer.endDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

  const OfferIcon = getOfferIcon(offer.type);

  return (
    <Card 
      className={cn(
        "group hover:shadow-lg transition-all duration-200",
        selected && "ring-2 ring-primary",
        offer.priority === 'HIGH' && "border-red-200",
        selectable && "cursor-pointer"
      )}
      onClick={() => selectable && onSelect?.(offer.id, !selected)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted">
              <OfferIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold line-clamp-1 text-lg">{offer.title}</h3>
              {offer.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {offer.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <Badge className={cn('text-xs', getStatusColor(offer.status))}>
              {offer.status}
            </Badge>
            {offer.priority === 'HIGH' && (
              <Badge variant="destructive" className="text-xs">
                HIGH PRIORITY
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Banner Image */}
        {offer.bannerImage && !imageError && (
          <div className="relative aspect-video mb-4 rounded-lg overflow-hidden bg-muted">
            <img
              src={offer.bannerImage.url}
              alt={offer.bannerImage.alt}
              className="object-cover w-full h-full"
              onError={() => setImageError(true)}
            />
            {isEndingSoon && offer.status === 'ACTIVE' && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="text-xs animate-pulse">
                  <Clock className="h-3 w-3 mr-1" />
                  Ending Soon
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Discount Display */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-primary">
            {offer.discountType === 'PERCENTAGE' 
              ? `${offer.discountValue}% OFF` 
              : offer.discountType === 'FIXED_AMOUNT'
              ? `${formatCurrency(offer.discountValue)} OFF`
              : 'FREE SHIPPING'
            }
          </div>
          <p className="text-sm text-muted-foreground">
            {offer.discountType === 'PERCENTAGE' ? 'Percentage Discount' : 
             offer.discountType === 'FIXED_AMOUNT' ? 'Fixed Amount Off' : 
             'Free Shipping Offer'}
          </p>
        </div>

        {/* Date Range */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(offer.startDate)}</span>
          </div>
          {offer.endDate && (
            <span>to {formatDate(offer.endDate)}</span>
          )}
        </div>

        {/* Progress Bar */}
        {offer.targetUsage && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{offer.currentUsage} / {offer.targetUsage}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {progressPercentage}% complete
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="font-bold text-sm">{formatCurrency(offer.revenue)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-3 w-3 text-blue-600" />
              <span className="font-bold text-sm">{formatNumber(offer.customersReached)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Customers</p>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-purple-600" />
              <span className="font-bold text-sm">{offer.conversionRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Conversion</p>
          </div>
        </div>

        {/* Categories */}
        {offer.categories && offer.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {offer.categories.slice(0, 3).map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
            {offer.categories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{offer.categories.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(offer.id);
            }}
            asChild
          >
            <Link href={`/seller/offers/${offer.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(offer.id);
            }}
            asChild
          >
            <Link href={`/seller/offers/${offer.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/seller/offers/${offer.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/seller/offers/${offer.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Offer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Offer
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/seller/offers/${offer.id}/analytics`}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(offer.id);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}

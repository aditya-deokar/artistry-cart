// components/dashboard/discounts/DiscountCard.tsx
'use client';

import { DiscountCode } from '@/types/discount';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, MoreVertical, Trash2, Copy, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { useDiscountStore } from '@/store/discounts/discountStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

interface DiscountCardProps {
  discount: DiscountCode;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  selectable?: boolean;
}

export default function DiscountCard({ 
  discount, 
  onEdit, 
  onDelete, 
  onView,
  selectable = false 
}: DiscountCardProps) {
  const { selectedDiscounts, toggleDiscountSelection } = useDiscountStore();
  const isSelected = selectedDiscounts.includes(discount.id);

  const getDiscountTypeColor = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'FIXED_AMOUNT': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'FREE_SHIPPING': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (isActive: boolean, validUntil?: string) => {
    if (!isActive) return 'bg-gray-500';
    if (validUntil && new Date(validUntil) < new Date()) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = (isActive: boolean, validUntil?: string) => {
    if (!isActive) return 'Inactive';
    if (validUntil && new Date(validUntil) < new Date()) return 'Expired';
    return 'Active';
  };

  // Calculate usage percentage
  const usagePercentage = discount.usageLimit 
    ? Math.round((discount.currentUsageCount / discount.usageLimit) * 100)
    : 0;

  const copyDiscountCode = async () => {
    await navigator.clipboard.writeText(discount.discountCode);
    // You could add a toast notification here
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      {selectable && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleDiscountSelection(discount.id)}
            className="bg-white border-2"
          />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary cursor-pointer">
                <Link href={`/seller/discounts/${discount.id}`}>
                  {discount.publicName}
                </Link>
              </h3>
              {discount.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {discount.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Badge className={getDiscountTypeColor(discount.discountType)}>
                {discount.discountType === 'PERCENTAGE' ? (
                  <Percent className="h-3 w-3 mr-1" />
                ) : (
                  <DollarSign className="h-3 w-3 mr-1" />
                )}
                {discount.discountType.replace('_', ' ')}
              </Badge>
              <Badge 
                className={`${getStatusColor(discount.isActive, discount.validUntil)} text-white text-xs ml-1`}
              >
                {getStatusText(discount.isActive, discount.validUntil)}
              </Badge>
            </div>
          </div>

          {/* Discount Code */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <code className="flex-1 font-mono font-bold text-lg">
              {discount.discountCode}
            </code>
            <Button variant="ghost" size="sm" onClick={copyDiscountCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Discount Value */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {discount.discountType === 'PERCENTAGE' 
                ? `${discount.discountValue}%` 
                : discount.discountType === 'FIXED_AMOUNT'
                ? formatCurrency(discount.discountValue)
                : 'FREE'
              }
            </div>
            <p className="text-sm text-muted-foreground">
              {discount.discountType === 'PERCENTAGE' ? 'Percentage Off' : 
               discount.discountType === 'FIXED_AMOUNT' ? 'Amount Off' : 
               'Free Shipping'}
            </p>
          </div>

          {/* Usage Stats */}
          {discount.usageLimit && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usage</span>
                <span>{discount.currentUsageCount} / {discount.usageLimit}</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
          )}

          {/* Validity */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Valid from {formatDate(discount.validFrom)}</span>
            </div>
            {discount.validUntil && (
              <span>Until {formatDate(discount.validUntil)}</span>
            )}
          </div>

          {/* Conditions */}
          <div className="flex flex-wrap gap-2">
            {discount.minimumOrderAmount && (
              <Badge variant="outline" className="text-xs">
                Min: {formatCurrency(discount.minimumOrderAmount)}
              </Badge>
            )}
            {discount.maximumDiscountAmount && (
              <Badge variant="outline" className="text-xs">
                Max: {formatCurrency(discount.maximumDiscountAmount)}
              </Badge>
            )}
            {!discount.applicableToAll && (
              <Badge variant="outline" className="text-xs">
                Specific Products
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(discount.id)}
            asChild
          >
            <Link href={`/seller/discounts/${discount.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit?.(discount.id)}
            asChild
          >
            <Link href={`/seller/discounts/${discount.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/seller/discounts/${discount.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/seller/discounts/${discount.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Discount
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/seller/discounts/${discount.id}/usage`}>
                  <Users className="h-4 w-4 mr-2" />
                  Usage Stats
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyDiscountCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete?.(discount.id)}
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

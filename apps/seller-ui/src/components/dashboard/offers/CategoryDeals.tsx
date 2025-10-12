// components/dashboard/offers/CategoryDeals.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, TrendingUp, Users, DollarSign, Plus, Edit, Eye, MoreVertical } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';
import Link from 'next/link';

interface CategoryDeal {
  id: string;
  categoryName: string;
  categoryImage?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'TIERED';
  discountValue: number;
  tieredDiscounts?: Array<{
    minQuantity: number;
    discount: number;
  }>;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  status: 'ACTIVE' | 'SCHEDULED' | 'ENDED' | 'DRAFT';
  startDate: string;
  endDate?: string;
  totalProducts: number;
  eligibleProducts: number;
  customersReached: number;
  totalOrders: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
}

const sampleCategoryDeals: CategoryDeal[] = [
  {
    id: '1',
    categoryName: 'Electronics',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    status: 'ACTIVE',
    startDate: '2025-09-01',
    endDate: '2025-09-30',
    totalProducts: 450,
    eligibleProducts: 420,
    customersReached: 2840,
    totalOrders: 156,
    revenue: 18750,
    averageOrderValue: 120.19,
    conversionRate: 5.5,
    priority: 'HIGH',
    description: 'Back to school electronics sale'
  },
  {
    id: '2',
    categoryName: 'Fashion & Apparel',
    discountType: 'TIERED',
    discountValue: 0,
    tieredDiscounts: [
      { minQuantity: 2, discount: 10 },
      { minQuantity: 4, discount: 20 },
      { minQuantity: 6, discount: 30 }
    ],
    status: 'ACTIVE',
    startDate: '2025-08-15',
    endDate: '2025-09-15',
    totalProducts: 890,
    eligibleProducts: 845,
    customersReached: 4250,
    totalOrders: 298,
    revenue: 32890,
    averageOrderValue: 110.37,
    conversionRate: 7.0,
    priority: 'HIGH',
    description: 'Multi-buy fashion discounts'
  },
  {
    id: '3',
    categoryName: 'Home & Garden',
    discountType: 'FIXED_AMOUNT',
    discountValue: 15,
    minOrderValue: 75,
    status: 'SCHEDULED',
    startDate: '2025-09-15',
    endDate: '2025-10-15',
    totalProducts: 320,
    eligibleProducts: 280,
    customersReached: 0,
    totalOrders: 0,
    revenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    priority: 'MEDIUM',
    description: 'Fall home improvement deals'
  },
  {
    id: '4',
    categoryName: 'Sports & Outdoors',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxDiscountAmount: 50,
    status: 'ACTIVE',
    startDate: '2025-09-05',
    endDate: '2025-09-20',
    totalProducts: 180,
    eligibleProducts: 165,
    customersReached: 980,
    totalOrders: 67,
    revenue: 5420,
    averageOrderValue: 80.90,
    conversionRate: 6.8,
    priority: 'MEDIUM',
    description: 'End of summer outdoor gear sale'
  }
];

export default function CategoryDeals() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deals, setDeals] = useState<CategoryDeal[]>(sampleCategoryDeals);

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
      case 'HIGH': return 'border-l-red-500 bg-red-50';
      case 'MEDIUM': return 'border-l-yellow-500 bg-yellow-50';
      case 'LOW': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getDiscountDisplay = (deal: CategoryDeal) => {
    if (deal.discountType === 'TIERED' && deal.tieredDiscounts) {
      const maxDiscount = Math.max(...deal.tieredDiscounts.map(t => t.discount));
      return `Up to ${maxDiscount}% OFF`;
    }
    if (deal.discountType === 'PERCENTAGE') {
      return `${deal.discountValue}% OFF`;
    }
    return `$${deal.discountValue} OFF`;
  };

  const filteredDeals = selectedCategory === 'all' 
    ? deals 
    : deals.filter(deal => deal.categoryName.toLowerCase() === selectedCategory.toLowerCase());

  const activeDeals = deals.filter(deal => deal.status === 'ACTIVE');
  const totalRevenue = activeDeals.reduce((sum, deal) => sum + deal.revenue, 0);
  const totalCustomers = activeDeals.reduce((sum, deal) => sum + deal.customersReached, 0);
  const averageConversion = activeDeals.reduce((sum, deal) => sum + deal.conversionRate, 0) / activeDeals.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Category Deals
          </h2>
          <p className="text-muted-foreground">
            Manage category-wide promotional offers and bulk discounts
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Category Deal
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold">{activeDeals.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customers Reached</p>
                <p className="text-2xl font-bold">{formatNumber(totalCustomers)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Conversion</p>
                <p className="text-2xl font-bold">{averageConversion.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by Category:</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="fashion & apparel">Fashion & Apparel</SelectItem>
            <SelectItem value="home & garden">Home & Garden</SelectItem>
            <SelectItem value="sports & outdoors">Sports & Outdoors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Deals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDeals.map((deal) => (
          <Card key={deal.id} className={`border-l-4 ${getPriorityColor(deal.priority)}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{deal.categoryName}</CardTitle>
                  {deal.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {deal.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusColor(deal.status)}>
                    {deal.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {deal.priority} Priority
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Discount Display */}
              <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg">
                <div className="text-2xl font-bold">
                  {getDiscountDisplay(deal)}
                </div>
                <div className="text-sm mt-1 opacity-90">
                  Category-wide discount
                </div>
                {deal.minOrderValue && (
                  <div className="text-xs mt-2 opacity-75">
                    Min order: {formatCurrency(deal.minOrderValue)}
                  </div>
                )}
              </div>

              {/* Tiered Discounts Display */}
              {deal.discountType === 'TIERED' && deal.tieredDiscounts && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tiered Discounts:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {deal.tieredDiscounts.map((tier, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                        <span>Buy {tier.minQuantity}+ items</span>
                        <Badge variant="secondary">{tier.discount}% OFF</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Coverage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Product Coverage</span>
                  <span>{deal.eligibleProducts} / {deal.totalProducts} products</span>
                </div>
                <Progress 
                  value={(deal.eligibleProducts / deal.totalProducts) * 100} 
                  className="h-2" 
                />
              </div>

              {/* Performance Metrics */}
              {deal.status === 'ACTIVE' && deal.revenue > 0 && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(deal.revenue)}
                    </div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatNumber(deal.customersReached)}
                    </div>
                    <div className="text-xs text-muted-foreground">Customers</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {deal.conversionRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Conversion</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/seller/offers/category/${deal.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/seller/offers/category/${deal.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Deals State */}
      {filteredDeals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Category Deals Found</h3>
            <p className="text-muted-foreground mb-6">
              {selectedCategory === 'all' 
                ? 'Create your first category-wide promotional offer'
                : `No deals found for ${selectedCategory} category`
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Category Deal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

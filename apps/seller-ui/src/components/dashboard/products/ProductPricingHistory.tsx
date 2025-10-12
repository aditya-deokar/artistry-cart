// components/dashboard/products/ProductPricingHistory.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, History, Download } from 'lucide-react';
import { getProductPricingHistory } from '@/lib/api/products';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';
import { EmptyState } from '@/components/dashboard/shared/EmptyState';

interface ProductPricingHistoryProps {
  productId: string;
}

export default function ProductPricingHistory({ productId }: ProductPricingHistoryProps) {
  const { data: pricingHistory, isLoading, error } = useQuery({
    queryKey: ['product-pricing-history', productId],
    queryFn: () => getProductPricingHistory(productId),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <div>Error loading pricing history</div>;
  if (!pricingHistory?.length) return <EmptyState entity="pricing history" />;

  // Prepare chart data
  const chartData = pricingHistory.map(item => ({
    date: formatDate(item.validFrom, 'MMM dd'),
    basePrice: item.basePrice,
    discountedPrice: item.discountedPrice || item.basePrice,
    discountPercent: item.discountPercent || 0,
  }));

  const getDiscountSourceColor = (source: string) => {
    switch (source) {
      case 'EVENT': return 'bg-purple-100 text-purple-800';
      case 'PRODUCT_SALE': return 'bg-green-100 text-green-800';
      case 'CATEGORY': return 'bg-blue-100 text-blue-800';
      case 'MANUAL': return 'bg-orange-100 text-orange-800';
      case 'BULK': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentPrice = pricingHistory[0]?.discountedPrice || pricingHistory[0]?.basePrice;
  const previousPrice = pricingHistory[1]?.discountedPrice || pricingHistory[1]?.basePrice;
  const priceChange = currentPrice && previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(currentPrice || 0)}
                </p>
              </div>
              <div className={`flex items-center gap-1 ${
                priceChange > 0 ? 'text-green-600' : priceChange < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {priceChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {Math.abs(priceChange).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Changes</p>
              <p className="text-2xl font-bold">{pricingHistory.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Discounts</p>
              <p className="text-2xl font-bold">
                {pricingHistory.filter(item => item.isActive && item.discountedPrice).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Price Trend
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    formatCurrency(value),
                    name === 'basePrice' ? 'Base Price' : 'Sale Price'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="basePrice" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Base Price"
                />
                <Line 
                  type="monotone" 
                  dataKey="discountedPrice" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Sale Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pricing History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Pricing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {formatDate(item.validFrom)}
                      </div>
                      {item.validUntil && (
                        <div className="text-sm text-muted-foreground">
                          Until {formatDate(item.validUntil)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(item.basePrice)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    {item.discountedPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-green-600">
                          {formatCurrency(item.discountedPrice)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {formatCurrency(item.discountAmount || 0)} off
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No discount</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {item.discountPercent ? (
                      <Badge variant="outline">
                        {item.discountPercent.toFixed(1)}% OFF
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      className={getDiscountSourceColor(item.discountSource || 'MANUAL')}
                    >
                      {item.discountSource || 'Manual'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="max-w-32">
                      <p className="text-sm truncate" title={item.reason || 'No reason provided'}>
                        {item.reason || 'No reason provided'}
                      </p>
                      {item.sourceName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.sourceName}
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

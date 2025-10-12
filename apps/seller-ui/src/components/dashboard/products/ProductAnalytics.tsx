// components/dashboard/products/ProductAnalytics.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Eye, ShoppingCart, Heart, Users, DollarSign, Calendar } from 'lucide-react';
import { getProductAnalytics } from '@/lib/api/products';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';

interface ProductAnalyticsProps {
  productId: string;
}

// Sample data - replace with actual API data
const performanceData = [
  { date: 'Jan 1', views: 120, cartAdds: 45, purchases: 12 },
  { date: 'Jan 2', views: 150, cartAdds: 52, purchases: 18 },
  { date: 'Jan 3', views: 180, cartAdds: 48, purchases: 15 },
  { date: 'Jan 4', views: 200, cartAdds: 65, purchases: 22 },
  { date: 'Jan 5', views: 175, cartAdds: 58, purchases: 19 },
  { date: 'Jan 6', views: 220, cartAdds: 72, purchases: 28 },
  { date: 'Jan 7', views: 190, cartAdds: 61, purchases: 25 },
];

const conversionData = [
  { name: 'Views', value: 2847, color: '#8884d8' },
  { name: 'Cart Adds', value: 892, color: '#82ca9d' },
  { name: 'Purchases', value: 234, color: '#ffc658' },
];

const revenueData = [
  { month: 'Jan', revenue: 2400, profit: 1200 },
  { month: 'Feb', revenue: 3200, profit: 1800 },
  { month: 'Mar', revenue: 2800, profit: 1400 },
  { month: 'Apr', revenue: 3800, profit: 2100 },
  { month: 'May', revenue: 4200, profit: 2400 },
  { month: 'Jun', revenue: 3600, profit: 2000 },
];

export default function ProductAnalytics({ productId }: ProductAnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['product-analytics', productId],
    queryFn: () => getProductAnalytics(productId),
  });

  if (isLoading) return <LoadingState />;

  // Calculate conversion rates
  const viewToCartRate = ((conversionData[1].value / conversionData[0].value) * 100).toFixed(1);
  const cartToPurchaseRate = ((conversionData[2].value / conversionData[1].value) * 100).toFixed(1);
  const overallConversionRate = ((conversionData[2].value / conversionData[0].value) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{formatNumber(analytics?.views || 2847)}</p>
                <p className="text-sm text-green-600">+12.5% from last week</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cart Additions</p>
                <p className="text-2xl font-bold">{formatNumber(analytics?.cartAdds || 892)}</p>
                <p className="text-sm text-green-600">+8.2% from last week</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Purchases</p>
                <p className="text-2xl font-bold">{formatNumber(analytics?.purchases || 234)}</p>
                <p className="text-sm text-green-600">+15.3% from last week</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wishlist Adds</p>
                <p className="text-2xl font-bold">{formatNumber(analytics?.wishlistAdds || 156)}</p>
                <p className="text-sm text-green-600">+5.7% from last week</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="cartAdds" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="purchases" stroke="#ffc658" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">View to Cart</span>
                    <span className="text-sm text-muted-foreground">{viewToCartRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${viewToCartRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Cart to Purchase</span>
                    <span className="text-sm text-muted-foreground">{cartToPurchaseRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${cartToPurchaseRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Conversion</span>
                    <span className="text-sm text-muted-foreground">{overallConversionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${overallConversionRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Organic Search', value: 45, fill: '#8884d8' },
                          { name: 'Direct', value: 30, fill: '#82ca9d' },
                          { name: 'Social Media', value: 15, fill: '#ffc658' },
                          { name: 'Referral', value: 10, fill: '#ff7300' },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Organic Search', value: 45, fill: '#8884d8' },
                          { name: 'Direct', value: 30, fill: '#82ca9d' },
                          { name: 'Social Media', value: 15, fill: '#ffc658' },
                          { name: 'Referral', value: 10, fill: '#ff7300' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue & Profit Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#82ca9d" 
                      fillOpacity={1} 
                      fill="url(#colorProfit)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Strong Performance</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your product views increased by 25% this week, indicating growing interest.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Seasonal Trend</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Sales typically peak on weekends. Consider running promotions on Friday-Sunday.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Audience Insight</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Most of your customers discover this product through organic search.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Optimize Product Images</p>
                      <p className="text-xs text-muted-foreground">
                        Products with 5+ high-quality images convert 30% better
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Update Product Description</p>
                      <p className="text-xs text-muted-foreground">
                        Include more keywords to improve search visibility
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Consider Price Optimization</p>
                      <p className="text-xs text-muted-foreground">
                        Your price is 15% higher than similar products
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Promote on Social Media</p>
                      <p className="text-xs text-muted-foreground">
                        Social traffic converts 40% better for this category
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

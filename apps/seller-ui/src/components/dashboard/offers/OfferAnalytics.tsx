// components/dashboard/offers/OfferAnalytics.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Target, Eye, ShoppingCart, Percent } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';
import { Badge } from '@/components/ui/badge';

interface OfferAnalyticsProps {
  offerId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

// Sample analytics data
const performanceData = [
  { date: '2025-09-01', views: 1250, clicks: 340, conversions: 45, revenue: 2250 },
  { date: '2025-09-02', views: 1420, clicks: 380, conversions: 52, revenue: 2600 },
  { date: '2025-09-03', views: 1180, clicks: 295, conversions: 38, revenue: 1900 },
  { date: '2025-09-04', views: 1650, clicks: 445, conversions: 68, revenue: 3400 },
  { date: '2025-09-05', views: 1850, clicks: 520, conversions: 78, revenue: 3900 },
  { date: '2025-09-06', views: 1520, clicks: 410, conversions: 55, revenue: 2750 },
  { date: '2025-09-07', views: 1890, clicks: 560, conversions: 82, revenue: 4100 },
];

const conversionFunnelData = [
  { stage: 'Offer Views', count: 10800, percentage: 100, color: '#8884d8' },
  { stage: 'Clicks', count: 3200, percentage: 29.6, color: '#82ca9d' },
  { stage: 'Product Views', count: 2400, percentage: 22.2, color: '#ffc658' },
  { stage: 'Add to Cart', count: 960, percentage: 8.9, color: '#ff7300' },
  { stage: 'Checkout', count: 480, percentage: 4.4, color: '#00c49f' },
  { stage: 'Purchase', count: 384, percentage: 3.6, color: '#0088fe' },
];

const customerSegmentData = [
  { segment: 'New Customers', value: 45, color: '#0088FE' },
  { segment: 'Returning Customers', value: 35, color: '#00C49F' },
  { segment: 'VIP Customers', value: 20, color: '#FFBB28' },
];

const topPerformingOffers = [
  { name: 'Summer Clearance', type: 'SEASONAL', conversion: 8.5, revenue: 15420 },
  { name: 'Flash Weekend', type: 'FLASH_SALE', conversion: 12.3, revenue: 8960 },
  { name: 'New Customer', type: 'PROMOTIONAL', conversion: 6.8, revenue: 5240 },
  { name: 'Category Deal', type: 'CATEGORY', conversion: 9.2, revenue: 7850 },
];

export default function OfferAnalytics({ offerId, timeRange = '30d' }: OfferAnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['offer-analytics', offerId, timeRange],
    queryFn: () => {
      // Mock API call
      return Promise.resolve({
        totalViews: 10800,
        totalClicks: 3200,
        totalConversions: 384,
        totalRevenue: 19200,
        conversionRate: 3.6,
        averageOrderValue: 50,
        customerAcquisitionCost: 12.5,
        returnOnAdSpend: 4.2
      });
    },
  });

  if (isLoading) return <LoadingState />;

  const calculateMetrics = () => {
    const totalViews = performanceData.reduce((sum, day) => sum + day.views, 0);
    const totalClicks = performanceData.reduce((sum, day) => sum + day.clicks, 0);
    const totalConversions = performanceData.reduce((sum, day) => sum + day.conversions, 0);
    const totalRevenue = performanceData.reduce((sum, day) => sum + day.revenue, 0);
    
    return {
      clickThroughRate: ((totalClicks / totalViews) * 100).toFixed(2),
      conversionRate: ((totalConversions / totalClicks) * 100).toFixed(2),
      averageOrderValue: (totalRevenue / totalConversions).toFixed(2),
      revenuePerView: (totalRevenue / totalViews).toFixed(2)
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{formatNumber(10800)}</p>
                <Badge variant="default" className="text-xs mt-1">+15.3%</Badge>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{metrics.clickThroughRate}%</p>
                <Badge variant="default" className="text-xs mt-1">+2.1%</Badge>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{formatNumber(384)}</p>
                <Badge variant="default" className="text-xs mt-1">+8.7%</Badge>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(19200)}</p>
                <Badge variant="default" className="text-xs mt-1">+23.4%</Badge>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="comparison">Offer Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
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
                      <Line type="monotone" dataKey="clicks" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="conversions" stroke="#ffc658" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#82ca9d" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{metrics.clickThroughRate}%</div>
                  <p className="text-sm text-muted-foreground">Click-Through Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{metrics.conversionRate}%</div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{formatCurrency(Number(metrics.averageOrderValue))}</div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{formatCurrency(Number(metrics.revenuePerView))}</div>
                  <p className="text-sm text-muted-foreground">Revenue per View</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Conversion Funnel Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnelData.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(stage.count)} ({stage.percentage}%)
                        </span>
                        {index > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {((stage.count / conversionFunnelData[index - 1].count) * 100).toFixed(1)}% conversion
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full bg-muted rounded-full h-6 flex items-center">
                        <div
                          className="h-6 rounded-full flex items-center justify-center text-white font-medium text-sm transition-all duration-500"
                          style={{ 
                            width: `${stage.percentage}%`,
                            backgroundColor: stage.color
                          }}
                        >
                          {stage.percentage > 15 && formatNumber(stage.count)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerSegmentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ segment, value }) => `${segment}: ${value}%`}
                      >
                        {customerSegmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customerSegmentData.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="font-medium">{segment.segment}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{segment.value}%</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round((segment.value / 100) * 384)} customers
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Key Insights</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 45% of customers are first-time buyers</li>
                    <li>• VIP customers have 3x higher conversion rate</li>
                    <li>• Returning customers spend 40% more on average</li>
                    <li>• Mobile users account for 65% of offer views</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingOffers.map((offer, index) => (
                  <div key={offer.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{offer.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {offer.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {formatCurrency(offer.revenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {offer.conversion}% conversion
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

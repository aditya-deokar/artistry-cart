// components/dashboard/events/EventAnalytics.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Eye, Users, DollarSign, ShoppingCart, Clock, Target, Zap } from 'lucide-react';
import { getEventAnalytics } from '@/lib/api/events';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface EventAnalyticsProps {
  eventId: string;
}

// Sample data - replace with actual API data
const performanceData = [
  { hour: '00:00', views: 45, clicks: 12, conversions: 3 },
  { hour: '01:00', views: 32, clicks: 8, conversions: 2 },
  { hour: '02:00', views: 28, clicks: 6, conversions: 1 },
  { hour: '03:00', views: 35, clicks: 9, conversions: 2 },
  { hour: '04:00', views: 52, clicks: 15, conversions: 4 },
  { hour: '05:00', views: 78, clicks: 25, conversions: 7 },
  { hour: '06:00', views: 125, clicks: 42, conversions: 12 },
  { hour: '07:00', views: 185, clicks: 68, conversions: 18 },
];

const conversionFunnelData = [
  { stage: 'Event Views', count: 2847, percentage: 100 },
  { stage: 'Product Clicks', count: 892, percentage: 31.3 },
  { stage: 'Add to Cart', count: 456, percentage: 16.0 },
  { stage: 'Checkout Started', count: 234, percentage: 8.2 },
  { stage: 'Purchase Completed', count: 189, percentage: 6.6 },
];

const topProductsData = [
  { name: 'Premium Headphones', sales: 45, revenue: 4500 },
  { name: 'Smart Watch', sales: 38, revenue: 7600 },
  { name: 'Wireless Speaker', sales: 32, revenue: 3200 },
  { name: 'Phone Case', sales: 28, revenue: 840 },
  { name: 'Charging Cable', sales: 25, revenue: 500 },
];

const trafficSourceData = [
  { source: 'Direct', sessions: 1245, color: '#8884d8' },
  { source: 'Social Media', sessions: 892, color: '#82ca9d' },
  { source: 'Email Campaign', sessions: 654, color: '#ffc658' },
  { source: 'Search', sessions: 456, color: '#ff7300' },
  { source: 'Referrals', sessions: 234, color: '#00c49f' },
];

export default function EventAnalytics({ eventId }: EventAnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['event-analytics', eventId],
    queryFn: () => getEventAnalytics(eventId),
  });

  if (isLoading) return <LoadingState />;

  // Calculate conversion rates
  const viewToClickRate = ((conversionFunnelData[1].count / conversionFunnelData[0].count) * 100).toFixed(1);
  const clickToCartRate = ((conversionFunnelData[2].count / conversionFunnelData[1].count) * 100).toFixed(1);
  const overallConversionRate = ((conversionFunnelData[4].count / conversionFunnelData[0].count) * 100).toFixed(1);

  // Sample event data
  const eventData = {
    status: 'active',
    progress: 65, // 65% through the event
    timeRemaining: '2d 8h 23m',
    totalViews: 2847,
    totalClicks: 892,
    totalConversions: 189,
    totalRevenue: 18750,
    averageOrderValue: 99.21,
    conversionRate: 6.6,
  };

  return (
    <div className="space-y-6">
      {/* Event Status & Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Event Status</h3>
              <p className="text-sm text-muted-foreground">
                Currently running • {eventData.timeRemaining} remaining
              </p>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {eventData.status === 'active' ? 'Live' : 'Scheduled'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Event Progress</span>
              <span>{eventData.progress}%</span>
            </div>
            <Progress value={eventData.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{formatNumber(eventData.totalViews)}</p>
                <p className="text-sm text-green-600">+23.5% vs last event</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Product Clicks</p>
                <p className="text-2xl font-bold">{formatNumber(eventData.totalClicks)}</p>
                <p className="text-sm text-green-600">+18.2% vs last event</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{formatNumber(eventData.totalConversions)}</p>
                <p className="text-sm text-green-600">+31.8% vs last event</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(eventData.totalRevenue)}</p>
                <p className="text-sm text-green-600">+42.1% vs last event</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Hourly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
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
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Click Rate</p>
                    <p className="text-2xl font-bold">{viewToClickRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{overallConversionRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Order Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(eventData.averageOrderValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue/View</p>
                    <p className="text-2xl font-bold">{formatCurrency(eventData.totalRevenue / eventData.totalViews)}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Views to Clicks</span>
                      <span>{viewToClickRate}%</span>
                    </div>
                    <Progress value={Number(viewToClickRate)} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Clicks to Cart</span>
                      <span>{clickToCartRate}%</span>
                    </div>
                    <Progress value={Number(clickToCartRate)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Funnel Tab */}
        <TabsContent value="conversion">
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
                      <div className="w-full bg-muted rounded-full h-8 flex items-center">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                          style={{ width: `${stage.percentage}%` }}
                        >
                          {stage.count > 100 && formatNumber(stage.count)}
                        </div>
                      </div>
                    </div>
                    
                    {index < conversionFunnelData.length - 1 && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-muted-foreground/30"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Top Performing Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProductsData.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} sales
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(product.revenue / product.sales)}/item
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Sources Tab */}
        <TabsContent value="traffic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSourceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="sessions"
                        label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                      >
                        {trafficSourceData.map((entry, index) => (
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
                <CardTitle>Source Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trafficSourceData.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: source.color }}
                        ></div>
                        <span className="font-medium">{source.source}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatNumber(source.sessions)}</p>
                        <p className="text-sm text-muted-foreground">
                          {((source.sessions / trafficSourceData.reduce((sum, s) => sum + s.sessions, 0)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

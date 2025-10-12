// components/dashboard/discounts/DiscountAnalytics.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Percent, Target, Calendar } from 'lucide-react';
import { getDiscountAnalytics } from '@/lib/api/discounts';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';
import { Badge } from '@/components/ui/badge';

interface DiscountAnalyticsProps {
  discountId: string;
}

// Sample data - replace with actual API data
const usageTrendData = [
  { date: '2025-09-01', usage: 12, revenue: 240, customers: 12 },
  { date: '2025-09-02', usage: 18, revenue: 360, customers: 16 },
  { date: '2025-09-03', usage: 25, revenue: 500, customers: 23 },
  { date: '2025-09-04', usage: 31, revenue: 620, customers: 28 },
  { date: '2025-09-05', usage: 22, revenue: 440, customers: 20 },
  { date: '2025-09-06', usage: 35, revenue: 700, customers: 32 },
  { date: '2025-09-07', usage: 41, revenue: 820, customers: 38 },
];

const customerSegmentData = [
  { segment: 'New Customers', count: 156, percentage: 62, color: '#8884d8' },
  { segment: 'Returning Customers', count: 95, percentage: 38, color: '#82ca9d' },
];

const discountEffectivenessData = [
  { metric: 'Conversion Rate', value: 8.5, benchmark: 6.2, unit: '%' },
  { metric: 'Average Order Value', value: 127.50, benchmark: 95.00, unit: '$' },
  { metric: 'Customer Acquisition', value: 156, benchmark: 120, unit: 'customers' },
  { metric: 'Revenue Impact', value: 3680, benchmark: 2800, unit: '$' },
];

const hourlyUsageData = [
  { hour: '00:00', usage: 2 }, { hour: '01:00', usage: 1 }, { hour: '02:00', usage: 0 },
  { hour: '03:00', usage: 1 }, { hour: '04:00', usage: 3 }, { hour: '05:00', usage: 5 },
  { hour: '06:00', usage: 12 }, { hour: '07:00', usage: 18 }, { hour: '08:00', usage: 25 },
  { hour: '09:00', usage: 32 }, { hour: '10:00', usage: 28 }, { hour: '11:00', usage: 22 },
  { hour: '12:00', usage: 35 }, { hour: '13:00', usage: 30 }, { hour: '14:00', usage: 26 },
  { hour: '15:00', usage: 29 }, { hour: '16:00', usage: 33 }, { hour: '17:00', usage: 31 },
  { hour: '18:00', usage: 27 }, { hour: '19:00', usage: 24 }, { hour: '20:00', usage: 20 },
  { hour: '21:00', usage: 15 }, { hour: '22:00', usage: 8 }, { hour: '23:00', usage: 4 },
];

export default function DiscountAnalytics({ discountId }: DiscountAnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['discount-analytics', discountId],
    queryFn: () => getDiscountAnalytics(discountId),
  });

  if (isLoading) return <LoadingState />;

  // Calculate key metrics
  const totalUsage = usageTrendData.reduce((sum, item) => sum + item.usage, 0);
  const totalRevenue = usageTrendData.reduce((sum, item) => sum + item.revenue, 0);
  const uniqueCustomers = customerSegmentData.reduce((sum, item) => sum + item.count, 0);
  const averageOrderValue = totalRevenue / totalUsage;
  const conversionRate = 8.5; // Sample conversion rate

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Uses</p>
                <p className="text-2xl font-bold">{formatNumber(totalUsage)}</p>
                <p className="text-sm text-green-600">+18.2% vs last week</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Generated</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-green-600">+23.5% vs last week</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Customers</p>
                <p className="text-2xl font-bold">{formatNumber(uniqueCustomers)}</p>
                <p className="text-sm text-green-600">+15.7% vs last week</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
                <p className="text-sm text-green-600">+2.1% vs last week</p>
              </div>
              <Percent className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Usage Trends</TabsTrigger>
          <TabsTrigger value="customers">Customer Analysis</TabsTrigger>
          <TabsTrigger value="effectiveness">Effectiveness</TabsTrigger>
          <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
        </TabsList>

        {/* Usage Trends Tab */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Usage Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={usageTrendData}>
                      <defs>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="usage" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#colorUsage)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#82ca9d" 
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Analysis Tab */}
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
                        dataKey="count"
                        label={({ segment, percentage }) => `${segment}: ${percentage}%`}
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
                <CardTitle>Customer Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customerSegmentData.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                      <div>
                        <p className="font-medium">{segment.segment}</p>
                        <p className="text-sm text-muted-foreground">
                          {segment.count} customers
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{segment.percentage}%</Badge>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Key Insights</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 62% of users are new customers, indicating strong acquisition</li>
                    <li>• Average order value is 34% higher for discount users</li>
                    <li>• 78% of customers who used this discount made repeat purchases</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Effectiveness Tab */}
        <TabsContent value="effectiveness">
          <Card>
            <CardHeader>
              <CardTitle>Discount Effectiveness vs Benchmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {discountEffectivenessData.map((metric, index) => {
                  const performance = ((metric.value - metric.benchmark) / metric.benchmark) * 100;
                  const isPositive = performance > 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{metric.metric}</p>
                        <p className="text-sm text-muted-foreground">
                          Current vs Industry Benchmark
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {metric.unit === '$' ? formatCurrency(metric.value) : `${metric.value}${metric.unit}`}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            vs {metric.unit === '$' ? formatCurrency(metric.benchmark) : `${metric.benchmark}${metric.unit}`}
                          </span>
                          <Badge variant={isPositive ? 'default' : 'destructive'} className="text-xs">
                            {isPositive ? '+' : ''}{performance.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Patterns Tab */}
        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Hourly Usage Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Usage Insights</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Peak usage occurs between 9 AM - 5 PM</li>
                  <li>• Lunch hour (12 PM) shows highest activity</li>
                  <li>• Minimal usage during early morning hours (12 AM - 6 AM)</li>
                  <li>• Evening usage (6 PM - 9 PM) remains steady</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

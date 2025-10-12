// components/dashboard/offers/PricingManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Target, Zap, AlertTriangle, Settings, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';
import { toast } from 'sonner';

interface PricingStrategy {
  id: string;
  name: string;
  type: 'COST_PLUS' | 'COMPETITIVE' | 'VALUE_BASED' | 'DYNAMIC' | 'PSYCHOLOGICAL';
  markup: number;
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
  performance: {
    conversionRate: number;
    revenue: number;
    competitorComparison: number;
  };
}

interface PricingRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  value: number;
  isActive: boolean;
  priority: number;
  triggeredCount: number;
}

interface CompetitorPrice {
  competitor: string;
  price: number;
  lastUpdated: string;
  priceChange: number;
}

interface PriceOptimization {
  productId: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  expectedLift: number;
  confidence: number;
  reason: string;
}

const sampleStrategies: PricingStrategy[] = [
  {
    id: '1',
    name: 'Premium Value Strategy',
    type: 'VALUE_BASED',
    markup: 45,
    minPrice: 50,
    maxPrice: 500,
    isActive: true,
    performance: {
      conversionRate: 8.5,
      revenue: 125000,
      competitorComparison: 15
    }
  },
  {
    id: '2',
    name: 'Competitive Pricing',
    type: 'COMPETITIVE',
    markup: 25,
    minPrice: 20,
    maxPrice: 300,
    isActive: true,
    performance: {
      conversionRate: 12.3,
      revenue: 98000,
      competitorComparison: -5
    }
  },
  {
    id: '3',
    name: 'Dynamic Demand-Based',
    type: 'DYNAMIC',
    markup: 35,
    minPrice: 30,
    maxPrice: 400,
    isActive: false,
    performance: {
      conversionRate: 10.1,
      revenue: 85000,
      competitorComparison: 8
    }
  }
];

const sampleRules: PricingRule[] = [
  {
    id: '1',
    name: 'High Inventory Discount',
    condition: 'inventory > 100 units',
    action: 'Reduce price by',
    value: 10,
    isActive: true,
    priority: 1,
    triggeredCount: 23
  },
  {
    id: '2',
    name: 'Competitor Price Match',
    condition: 'competitor_price < our_price',
    action: 'Match competitor price minus',
    value: 1,
    isActive: true,
    priority: 2,
    triggeredCount: 45
  },
  {
    id: '3',
    name: 'Low Stock Premium',
    condition: 'inventory < 10 units',
    action: 'Increase price by',
    value: 15,
    isActive: true,
    priority: 3,
    triggeredCount: 12
  }
];

const sampleCompetitors: CompetitorPrice[] = [
  { competitor: 'Competitor A', price: 89.99, lastUpdated: '2025-09-08', priceChange: -2.5 },
  { competitor: 'Competitor B', price: 94.50, lastUpdated: '2025-09-07', priceChange: 1.2 },
  { competitor: 'Competitor C', price: 87.99, lastUpdated: '2025-09-08', priceChange: 0 },
];

const sampleOptimizations: PriceOptimization[] = [
  {
    productId: '1',
    productName: 'Wireless Headphones Pro',
    currentPrice: 89.99,
    suggestedPrice: 94.99,
    expectedLift: 12.5,
    confidence: 85,
    reason: 'Demand analysis shows price elasticity allows for increase'
  },
  {
    productId: '2',
    productName: 'Smart Fitness Watch',
    currentPrice: 199.99,
    suggestedPrice: 179.99,
    expectedLift: 18.3,
    confidence: 92,
    reason: 'Competitor pricing analysis suggests reduction for market share'
  },
  {
    productId: '3',
    productName: 'Portable Bluetooth Speaker',
    currentPrice: 49.99,
    suggestedPrice: 54.99,
    expectedLift: 8.7,
    confidence: 78,
    reason: 'Low inventory and high demand support premium pricing'
  }
];

export default function PricingManager() {
  const [activeStrategy, setActiveStrategy] = useState<string>('1');
  const [isDynamicPricing, setIsDynamicPricing] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  const queryClient = useQueryClient();

  // Mock API calls
  const { data: strategies } = useQuery({
    queryKey: ['pricing-strategies'],
    queryFn: () => Promise.resolve(sampleStrategies),
  });

  const { data: pricingRules } = useQuery({
    queryKey: ['pricing-rules'],
    queryFn: () => Promise.resolve(sampleRules),
  });

  const updateStrategyMutation = useMutation({
    mutationFn: (strategy: PricingStrategy) => {
      return Promise.resolve(strategy);
    },
    onSuccess: () => {
      toast.success('Pricing strategy updated successfully');
      queryClient.invalidateQueries({ queryKey: ['pricing-strategies'] });
    }
  });

  const getStrategyTypeColor = (type: string) => {
    switch (type) {
      case 'VALUE_BASED': return 'bg-purple-100 text-purple-800';
      case 'COMPETITIVE': return 'bg-blue-100 text-blue-800';
      case 'DYNAMIC': return 'bg-green-100 text-green-800';
      case 'COST_PLUS': return 'bg-orange-100 text-orange-800';
      case 'PSYCHOLOGICAL': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Pricing Management
          </h2>
          <p className="text-muted-foreground">
            Manage pricing strategies, rules, and optimization recommendations
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="dynamic-pricing">Dynamic Pricing</Label>
            <Switch
              id="dynamic-pricing"
              checked={isDynamicPricing}
              onCheckedChange={setIsDynamicPricing}
            />
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
          </Button>
        </div>
      </div>

      {/* Pricing Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Margin</p>
                <p className="text-2xl font-bold">34.5%</p>
                <Badge variant="default" className="text-xs mt-1">+2.3%</Badge>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Price Changes</p>
                <p className="text-2xl font-bold">127</p>
                <Badge variant="default" className="text-xs mt-1">This month</Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Impact</p>
                <p className="text-2xl font-bold">{formatCurrency(28450)}</p>
                <Badge variant="default" className="text-xs mt-1">+15.7%</Badge>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Optimization Score</p>
                <p className="text-2xl font-bold">87%</p>
                <Badge variant="default" className="text-xs mt-1">Excellent</Badge>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="strategies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="strategies">Pricing Strategies</TabsTrigger>
          <TabsTrigger value="rules">Dynamic Rules</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Price Optimization</TabsTrigger>
        </TabsList>

        {/* Pricing Strategies Tab */}
        <TabsContent value="strategies">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Pricing Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {strategies?.map((strategy) => (
                  <div key={strategy.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{strategy.name}</h4>
                        <Badge className={getStrategyTypeColor(strategy.type)} variant="secondary">
                          {strategy.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Switch
                        checked={strategy.isActive}
                        onCheckedChange={(checked) => {
                          updateStrategyMutation.mutate({
                            ...strategy,
                            isActive: checked
                          });
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Markup:</span>
                        <div className="font-medium">{strategy.markup}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Conversion:</span>
                        <div className="font-medium">{strategy.performance.conversionRate}%</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Performance Score</span>
                        <span>{Math.round((strategy.performance.conversionRate / 15) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(strategy.performance.conversionRate / 15) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={strategies?.map(s => ({
                      name: s.name.substring(0, 10),
                      conversion: s.performance.conversionRate,
                      revenue: s.performance.revenue / 1000
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="conversion" 
                        stroke="#8884d8" 
                        name="Conversion Rate %" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dynamic Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dynamic Pricing Rules</CardTitle>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Add New Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingRules?.map((rule, index) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge 
                          variant={rule.isActive ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Priority {rule.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">When:</span> {rule.condition}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Then:</span> {rule.action} {rule.value}%
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        Triggered {rule.triggeredCount} times this month
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => {
                          // Handle rule toggle
                        }}
                      />
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitor Analysis Tab */}
        <TabsContent value="competitors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitor Price Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleCompetitors.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{comp.competitor}</h4>
                        <p className="text-sm text-muted-foreground">
                          Updated: {comp.lastUpdated}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {formatCurrency(comp.price)}
                        </div>
                        <Badge 
                          variant={comp.priceChange > 0 ? 'destructive' : comp.priceChange < 0 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {comp.priceChange > 0 ? '+' : ''}{comp.priceChange}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Position Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sampleCompetitors.concat([
                      { competitor: 'Our Store', price: 92.99, lastUpdated: '2025-09-08', priceChange: 0 }
                    ])}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="competitor" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="price" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Price Optimization Tab */}
        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI-Powered Price Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleOptimizations.map((opt) => (
                  <div key={opt.productId} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{opt.productName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {opt.reason}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <Badge 
                          variant={opt.confidence >= 80 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {opt.confidence}% Confident
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">Current Price:</span>
                        <div className="font-medium">{formatCurrency(opt.currentPrice)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Suggested Price:</span>
                        <div className="font-medium text-green-600">
                          {formatCurrency(opt.suggestedPrice)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expected Lift:</span>
                        <div className="font-medium">+{opt.expectedLift}%</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Apply Suggestion
                      </Button>
                      <Button variant="outline" size="sm">
                        Test A/B
                      </Button>
                      <Button variant="ghost" size="sm">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dynamic Pricing Alert */}
      {isDynamicPricing && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            Dynamic pricing is active. Prices are automatically adjusted based on your configured rules and market conditions.
            <Button variant="link" className="p-0 ml-2 h-auto">
              View recent changes
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

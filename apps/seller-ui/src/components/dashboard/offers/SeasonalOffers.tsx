// components/dashboard/offers/SeasonalOffers.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Calendar as CalendarIcon, Plus, Snowflake, Sun, Leaf, Flower, Gift, Heart, Zap, TrendingUp } from 'lucide-react';
import { format, addDays, addMonths, isWithinInterval } from 'date-fns';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';
import { toast } from 'sonner';

interface SeasonalOffer {
  id: string;
  title: string;
  description: string;
  season: 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER' | 'HOLIDAY' | 'CUSTOM';
  holiday?: string;
  startDate: string;
  endDate: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO';
  discountValue: number;
  targetCategories: string[];
  status: 'ACTIVE' | 'SCHEDULED' | 'ENDED' | 'DRAFT';
  performance: {
    views: number;
    conversions: number;
    revenue: number;
    customerCount: number;
  };
  bannerColor: string;
  icon?: string;
}

interface SeasonalTemplate {
  id: string;
  name: string;
  season: string;
  description: string;
  suggestedDiscount: number;
  estimatedLift: string;
  categories: string[];
  icon: React.ComponentType<any>;
  color: string;
}

const seasonalTemplates: SeasonalTemplate[] = [
  {
    id: '1',
    name: 'Spring Renewal Sale',
    season: 'SPRING',
    description: 'Fresh start with spring cleaning and renewal items',
    suggestedDiscount: 25,
    estimatedLift: '+15-20%',
    categories: ['Home & Garden', 'Fashion', 'Health & Beauty'],
    icon: Flower,
    color: 'from-green-400 to-blue-500'
  },
  {
    id: '2',
    name: 'Summer Clearance',
    season: 'SUMMER',
    description: 'Beat the heat with summer essentials and outdoor gear',
    suggestedDiscount: 35,
    estimatedLift: '+25-30%',
    categories: ['Sports & Outdoors', 'Fashion', 'Electronics'],
    icon: Sun,
    color: 'from-yellow-400 to-red-500'
  },
  {
    id: '3',
    name: 'Fall Back to School',
    season: 'FALL',
    description: 'Prepare for the new school year with educational supplies',
    suggestedDiscount: 20,
    estimatedLift: '+18-25%',
    categories: ['Electronics', 'Books', 'Fashion'],
    icon: Leaf,
    color: 'from-orange-400 to-red-600'
  },
  {
    id: '4',
    name: 'Winter Holiday Magic',
    season: 'WINTER',
    description: 'Spread joy with holiday gifts and winter essentials',
    suggestedDiscount: 40,
    estimatedLift: '+30-45%',
    categories: ['Gifts', 'Fashion', 'Home & Garden'],
    icon: Snowflake,
    color: 'from-blue-400 to-purple-600'
  },
  {
    id: '5',
    name: 'Valentine\'s Romance',
    season: 'HOLIDAY',
    description: 'Love is in the air with romantic gifts and experiences',
    suggestedDiscount: 30,
    estimatedLift: '+20-35%',
    categories: ['Gifts', 'Jewelry', 'Health & Beauty'],
    icon: Heart,
    color: 'from-pink-400 to-red-500'
  }
];

const sampleOffers: SeasonalOffer[] = [
  {
    id: '1',
    title: 'Summer Clearance Extravaganza',
    description: 'Clear out summer inventory with massive discounts',
    season: 'SUMMER',
    startDate: '2025-08-15',
    endDate: '2025-09-15',
    discountType: 'PERCENTAGE',
    discountValue: 35,
    targetCategories: ['Fashion', 'Sports & Outdoors'],
    status: 'ACTIVE',
    performance: {
      views: 45230,
      conversions: 2840,
      revenue: 125000,
      customerCount: 2156
    },
    bannerColor: 'from-yellow-400 to-red-500',
    icon: 'Sun'
  },
  {
    id: '2',
    title: 'Back to School Special',
    description: 'Get ready for the new academic year',
    season: 'FALL',
    startDate: '2025-09-01',
    endDate: '2025-09-30',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    targetCategories: ['Electronics', 'Books', 'Fashion'],
    status: 'ACTIVE',
    performance: {
      views: 28940,
      conversions: 1890,
      revenue: 89000,
      customerCount: 1654
    },
    bannerColor: 'from-orange-400 to-red-600',
    icon: 'Leaf'
  },
  {
    id: '3',
    title: 'Halloween Spook-tacular',
    season: 'HOLIDAY',
    holiday: 'Halloween',
    startDate: '2025-10-15',
    endDate: '2025-10-31',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    targetCategories: ['Costumes', 'Decorations', 'Candy'],
    status: 'SCHEDULED',
    performance: {
      views: 0,
      conversions: 0,
      revenue: 0,
      customerCount: 0
    },
    bannerColor: 'from-purple-600 to-orange-500',
    icon: 'Zap'
  },
  {
    id: '4',
    title: 'Winter Wonderland Sale',
    description: 'Embrace the cold with winter essentials',
    season: 'WINTER',
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    discountType: 'PERCENTAGE',
    discountValue: 40,
    targetCategories: ['Fashion', 'Home & Garden', 'Electronics'],
    status: 'DRAFT',
    performance: {
      views: 0,
      conversions: 0,
      revenue: 0,
      customerCount: 0
    },
    bannerColor: 'from-blue-400 to-purple-600',
    icon: 'Snowflake'
  }
];

export default function SeasonalOffers() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: offers } = useQuery({
    queryKey: ['seasonal-offers'],
    queryFn: () => Promise.resolve(sampleOffers),
  });

  const createOfferMutation = useMutation({
    mutationFn: (offer: Partial<SeasonalOffer>) => {
      return Promise.resolve({ ...offer, id: Date.now().toString() } as SeasonalOffer);
    },
    onSuccess: () => {
      toast.success('Seasonal offer created successfully');
      queryClient.invalidateQueries({ queryKey: ['seasonal-offers'] });
      setIsCreateDialogOpen(false);
    }
  });

  // Get offers for selected date
  const getOffersForDate = (date: Date) => {
    if (!offers) return [];
    
    return offers.filter(offer => {
      const start = new Date(offer.startDate);
      const end = new Date(offer.endDate);
      return isWithinInterval(date, { start, end });
    });
  };

  // Filter offers by season
  const filteredOffers = offers?.filter(offer => 
    selectedSeason === 'all' || offer.season === selectedSeason
  ) || [];

  // Get upcoming seasonal opportunities
  const getUpcomingSeasons = () => {
    const now = new Date();
    const upcoming = [];
    
    // Next 6 months of seasonal opportunities
    for (let i = 0; i < 6; i++) {
      const month = addMonths(now, i);
      const monthName = format(month, 'MMMM yyyy');
      
      // Determine season based on month
      const monthNum = month.getMonth();
      let season = '';
      let opportunities: string[] = [];
      
      if (monthNum >= 2 && monthNum <= 4) {
        season = 'Spring';
        opportunities = ['Spring Cleaning', 'Easter', 'Mother\'s Day'];
      } else if (monthNum >= 5 && monthNum <= 7) {
        season = 'Summer';
        opportunities = ['Summer Vacation', 'Father\'s Day', 'July 4th'];
      } else if (monthNum >= 8 && monthNum <= 10) {
        season = 'Fall';
        opportunities = ['Back to School', 'Halloween', 'Thanksgiving'];
      } else {
        season = 'Winter';
        opportunities = ['Christmas', 'New Year', 'Valentine\'s Day'];
      }
      
      upcoming.push({
        month: monthName,
        season,
        opportunities
      });
    }
    
    return upcoming;
  };

  const upcomingSeasons = getUpcomingSeasons();
  const selectedDateOffers = selectedDate ? getOffersForDate(selectedDate) : [];

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'SPRING': return Flower;
      case 'SUMMER': return Sun;
      case 'FALL': return Leaf;
      case 'WINTER': return Snowflake;
      case 'HOLIDAY': return Gift;
      default: return CalendarIcon;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Seasonal Offers
          </h2>
          <p className="text-muted-foreground">
            Create and manage seasonal promotions and holiday campaigns
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Seasonal Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Seasonal Offer</DialogTitle>
            </DialogHeader>
            {/* Add form content here */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Season Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by Season:</Label>
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            <SelectItem value="SPRING">Spring</SelectItem>
            <SelectItem value="SUMMER">Summer</SelectItem>
            <SelectItem value="FALL">Fall</SelectItem>
            <SelectItem value="WINTER">Winter</SelectItem>
            <SelectItem value="HOLIDAY">Holiday</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Seasonal Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            
            {selectedDate && selectedDateOffers.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">
                  Active on {format(selectedDate, 'PPP')}
                </h4>
                {selectedDateOffers.map(offer => (
                  <div key={offer.id} className="p-2 bg-muted rounded text-sm">
                    <div className="font-medium">{offer.title}</div>
                    <div className="text-muted-foreground">
                      {offer.discountValue}% off
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">Active Offers</TabsTrigger>
              <TabsTrigger value="templates">Seasonal Templates</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Opportunities</TabsTrigger>
              <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            </TabsList>

            {/* Active Offers */}
            <TabsContent value="active">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOffers.map((offer) => {
                  const SeasonIcon = getSeasonIcon(offer.season);
                  const conversionRate = offer.performance.conversions > 0 
                    ? (offer.performance.conversions / offer.performance.views * 100) 
                    : 0;

                  return (
                    <Card key={offer.id} className="relative overflow-hidden">
                      {/* Gradient Background */}
                      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${offer.bannerColor}`}></div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <SeasonIcon className="h-5 w-5" />
                            <div>
                              <CardTitle className="text-lg">{offer.title}</CardTitle>
                              {offer.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {offer.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(offer.status)}>
                            {offer.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Offer Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Discount:</span>
                            <div className="font-bold text-green-600">
                              {offer.discountValue}% OFF
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <div className="font-medium">
                              {format(new Date(offer.startDate), 'MMM dd')} - {format(new Date(offer.endDate), 'MMM dd')}
                            </div>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        {offer.status === 'ACTIVE' && offer.performance.views > 0 && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold text-blue-600">
                                  {formatNumber(offer.performance.views)}
                                </div>
                                <div className="text-xs text-muted-foreground">Views</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-green-600">
                                  {formatCurrency(offer.performance.revenue)}
                                </div>
                                <div className="text-xs text-muted-foreground">Revenue</div>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Conversion Rate</span>
                                <span>{conversionRate.toFixed(1)}%</span>
                              </div>
                              <Progress value={conversionRate} className="h-2" />
                            </div>
                          </div>
                        )}

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1">
                          {offer.targetCategories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Seasonal Templates */}
            <TabsContent value="templates">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seasonalTemplates.map((template) => {
                  const TemplateIcon = template.icon;
                  
                  return (
                    <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className={`w-full h-24 bg-gradient-to-r ${template.color} rounded-lg flex items-center justify-center mb-4`}>
                          <TemplateIcon className="h-12 w-12 text-white" />
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Suggested Discount:</span>
                            <div className="font-bold text-green-600">
                              {template.suggestedDiscount}%
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Est. Lift:</span>
                            <div className="font-medium">
                              {template.estimatedLift}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Target Categories:</span>
                          <div className="flex flex-wrap gap-1">
                            {template.categories.slice(0, 2).map((category) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {template.categories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.categories.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button className="w-full">
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Upcoming Opportunities */}
            <TabsContent value="upcoming">
              <div className="space-y-4">
                {upcomingSeasons.map((season, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{season.month}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {season.season} Season
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Plan Campaign
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium">Seasonal Opportunities:</h4>
                        <div className="flex flex-wrap gap-2">
                          {season.opportunities.map((opp) => (
                            <Badge key={opp} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                              {opp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Seasonal Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={offers?.filter(o => o.performance.revenue > 0).map(o => ({
                          name: o.title.substring(0, 10),
                          revenue: o.performance.revenue / 1000,
                          conversions: o.performance.conversions
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (K)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Seasons</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {offers?.filter(o => o.performance.revenue > 0)
                      .sort((a, b) => b.performance.revenue - a.performance.revenue)
                      .slice(0, 3)
                      .map((offer, index) => {
                        const SeasonIcon = getSeasonIcon(offer.season);
                        return (
                          <div key={offer.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                              }`}>
                                {index + 1}
                              </div>
                              <SeasonIcon className="h-5 w-5" />
                              <div>
                                <div className="font-medium">{offer.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {offer.season.toLowerCase()} season
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                {formatCurrency(offer.performance.revenue)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatNumber(offer.performance.customerCount)} customers
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

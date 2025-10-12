// components/dashboard/offers/OffersOverview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Gift, Calendar, Zap, DollarSign, Users, TrendingUp, Eye, Edit } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';

// Sample data
const recentOffers = [
  {
    id: '1',
    title: 'Summer Clearance Sale',
    type: 'SEASONAL',
    discount: 30,
    status: 'ACTIVE',
    startDate: '2025-09-01',
    endDate: '2025-09-30',
    progress: 65,
    revenue: 12450,
    customers: 234
  },
  {
    id: '2',
    title: 'Flash Weekend Deal',
    type: 'FLASH_SALE',
    discount: 50,
    status: 'SCHEDULED',
    startDate: '2025-09-15',
    endDate: '2025-09-17',
    progress: 0,
    revenue: 0,
    customers: 0
  },
  {
    id: '3',
    title: 'New Customer Welcome',
    type: 'PROMOTIONAL',
    discount: 15,
    status: 'ACTIVE',
    startDate: '2025-08-01',
    endDate: '2025-12-31',
    progress: 40,
    revenue: 8920,
    customers: 156
  }
];

export default function OffersOverview() {
  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'SEASONAL': return Calendar;
      case 'FLASH_SALE': return Zap;
      case 'PROMOTIONAL': return Gift;
      default: return Gift;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'SCHEDULED': return 'secondary';
      case 'ENDED': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Stats */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(45230)}
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue Impact</p>
            <div className="mt-2">
              <Badge variant="default" className="text-xs">
                +23.7% this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">8,420</div>
            <p className="text-sm text-muted-foreground">Customers Reached</p>
            <div className="mt-2">
              <Badge variant="default" className="text-xs">
                +18.2% engagement
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">12.8%</div>
            <p className="text-sm text-muted-foreground">Avg Conversion Rate</p>
            <div className="mt-2">
              <Badge variant="default" className="text-xs">
                +2.1% improvement
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Offers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOffers.map((offer) => {
              const OfferIcon = getOfferIcon(offer.type);
              
              return (
                <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <OfferIcon className="h-5 w-5" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium">{offer.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{offer.discount}% off</span>
                        <span>•</span>
                        <span>{formatDate(offer.startDate)} - {formatDate(offer.endDate)}</span>
                      </div>
                      
                      {offer.status === 'ACTIVE' && offer.progress > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{offer.progress}%</span>
                          </div>
                          <Progress value={offer.progress} className="h-1 w-32" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant={getStatusColor(offer.status) as any}>
                        {offer.status}
                      </Badge>
                      {offer.revenue > 0 && (
                        <div className="mt-2 text-sm">
                          <div className="flex items-center gap-1 text-green-600">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCurrency(offer.revenue)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{offer.customers} customers</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOffers.filter(offer => offer.revenue > 0).map((offer, index) => (
                <div key={offer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm">{offer.title}</span>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium text-green-600">
                      {formatCurrency(offer.revenue)}
                    </div>
                    <div className="text-muted-foreground">
                      {offer.customers} customers
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offer Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Seasonal Offers</span>
                </div>
                <Badge variant="outline">8 active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Flash Sales</span>
                </div>
                <Badge variant="outline">3 active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Pricing Offers</span>
                </div>
                <Badge variant="outline">12 active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Promotional</span>
                </div>
                <Badge variant="outline">5 active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// components/dashboard/offers/OfferComparison.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, DollarSign, Users, Target, Zap, Calendar, GitCompare } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';

interface OfferForComparison {
  id: string;
  name: string;
  type: string;
  status: string;
  discountValue: number;
  discountType: string;
  startDate: string;
  endDate?: string;
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  revenue: number;
  customersReached: number;
  conversionRate: number;
  averageOrderValue: number;
  clickThroughRate: number;
  costPerAcquisition: number;
  returnOnInvestment: number;
}

const sampleOffers: OfferForComparison[] = [
  {
    id: '1',
    name: 'Summer Flash Sale',
    type: 'FLASH_SALE',
    status: 'ENDED',
    discountValue: 50,
    discountType: 'PERCENTAGE',
    startDate: '2025-08-01',
    endDate: '2025-08-03',
    totalViews: 15420,
    totalClicks: 3850,
    totalConversions: 462,
    revenue: 23100,
    customersReached: 12800,
    conversionRate: 12.0,
    averageOrderValue: 50.0,
    clickThroughRate: 25.0,
    costPerAcquisition: 15.5,
    returnOnInvestment: 4.2
  },
  {
    id: '2',
    name: 'Back to School Promo',
    type: 'SEASONAL',
    status: 'ACTIVE',
    discountValue: 25,
    discountType: 'PERCENTAGE',
    startDate: '2025-08-15',
    endDate: '2025-09-15',
    totalViews: 28940,
    totalClicks: 5230,
    totalConversions: 680,
    revenue: 45600,
    customersReached: 24500,
    conversionRate: 13.0,
    averageOrderValue: 67.0,
    clickThroughRate: 18.1,
    costPerAcquisition: 22.3,
    returnOnInvestment: 3.8
  },
  {
    id: '3',
    name: 'New Customer Welcome',
    type: 'PROMOTIONAL',
    status: 'ACTIVE',
    discountValue: 15,
    discountType: 'PERCENTAGE',
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    totalViews: 45230,
    totalClicks: 6340,
    totalConversions: 890,
    revenue: 28900,
    customersReached: 38200,
    conversionRate: 14.0,
    averageOrderValue: 32.5,
    clickThroughRate: 14.0,
    costPerAcquisition: 18.7,
    returnOnInvestment: 2.9
  },
  {
    id: '4',
    name: 'Weekend Lightning Deal',
    type: 'FLASH_SALE',
    status: 'ENDED',
    discountValue: 40,
    discountType: 'PERCENTAGE',
    startDate: '2025-08-25',
    endDate: '2025-08-27',
    totalViews: 8930,
    totalClicks: 2140,
    totalConversions: 287,
    revenue: 17250,
    customersReached: 7500,
    conversionRate: 13.4,
    averageOrderValue: 60.1,
    clickThroughRate: 24.0,
    costPerAcquisition: 19.2,
    returnOnInvestment: 3.5
  }
];

export default function OfferComparison() {
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [comparisonMetric, setComparisonMetric] = useState<string>('revenue');

  const handleOfferSelection = (offerId: string, checked: boolean) => {
    if (checked) {
      if (selectedOffers.length < 4) {
        setSelectedOffers([...selectedOffers, offerId]);
      }
    } else {
      setSelectedOffers(selectedOffers.filter(id => id !== offerId));
    }
  };

  const selectedOfferData = sampleOffers.filter(offer => selectedOffers.includes(offer.id));

  const getComparisonChartData = () => {
    return selectedOfferData.map(offer => ({
      name: offer.name.length > 15 ? offer.name.substring(0, 15) + '...' : offer.name,
      revenue: offer.revenue,
      conversions: offer.totalConversions,
      conversionRate: offer.conversionRate,
      averageOrderValue: offer.averageOrderValue,
      clickThroughRate: offer.clickThroughRate,
      roi: offer.returnOnInvestment
    }));
  };

  const getRadarChartData = () => {
    return selectedOfferData.map(offer => ({
      offer: offer.name.length > 10 ? offer.name.substring(0, 10) + '...' : offer.name,
      Conversion: offer.conversionRate,
      CTR: offer.clickThroughRate,
      AOV: offer.averageOrderValue,
      ROI: offer.returnOnInvestment,
      Revenue: offer.revenue / 1000 // Scale down for better visualization
    }));
  };

  const getMetricColor = (index: number) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];
    return colors[index % colors.length];
  };

  const comparisonChartData = getComparisonChartData();
  const radarData = getRadarChartData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitCompare className="h-6 w-6" />
            Offer Comparison
          </h2>
          <p className="text-muted-foreground">
            Compare performance metrics across different offers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedOffers.length}/4 offers selected
          </span>
        </div>
      </div>

      {/* Offer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Offers to Compare (Max 4)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleOffers.map((offer) => (
              <div key={offer.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  checked={selectedOffers.includes(offer.id)}
                  onCheckedChange={(checked) => handleOfferSelection(offer.id, !!checked)}
                  disabled={!selectedOffers.includes(offer.id) && selectedOffers.length >= 4}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{offer.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {offer.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>{formatCurrency(offer.revenue)} revenue</span>
                    <span>{offer.conversionRate}% conversion</span>
                    <Badge 
                      variant={offer.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {offer.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedOffers.length > 1 && (
        <>
          {/* Quick Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Metric</th>
                      {selectedOfferData.map((offer, index) => (
                        <th key={offer.id} className="text-center py-2">
                          <div className="flex flex-col items-center">
                            <div 
                              className="w-4 h-4 rounded-full mb-1"
                              style={{ backgroundColor: getMetricColor(index) }}
                            ></div>
                            <span className="font-medium">{offer.name.length > 12 ? offer.name.substring(0, 12) + '...' : offer.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Revenue</td>
                      {selectedOfferData.map(offer => (
                        <td key={offer.id} className="text-center py-2">
                          {formatCurrency(offer.revenue)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Conversions</td>
                      {selectedOfferData.map(offer => (
                        <td key={offer.id} className="text-center py-2">
                          {formatNumber(offer.totalConversions)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Conversion Rate</td>
                      {selectedOfferData.map(offer => (
                        <td key={offer.id} className="text-center py-2">
                          {offer.conversionRate}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Click-Through Rate</td>
                      {selectedOfferData.map(offer => (
                        <td key={offer.id} className="text-center py-2">
                          {offer.clickThroughRate}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Average Order Value</td>
                      {selectedOfferData.map(offer => (
                        <td key={offer.id} className="text-center py-2">
                          {formatCurrency(offer.averageOrderValue)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">ROI</td>
                      {selectedOfferData.map(offer => (
                        <td key={offer.id} className="text-center py-2">
                          {offer.returnOnInvestment}x
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Visual Comparisons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart Comparison */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Performance Metrics</CardTitle>
                  <Select value={comparisonMetric} onValueChange={setComparisonMetric}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                      <SelectItem value="conversionRate">Conversion Rate</SelectItem>
                      <SelectItem value="averageOrderValue">Avg Order Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'revenue') return [formatCurrency(Number(value)), 'Revenue'];
                          if (name === 'averageOrderValue') return [formatCurrency(Number(value)), 'Avg Order Value'];
                          return [value, name];
                        }}
                      />
                      <Bar 
                        dataKey={comparisonMetric} 
                        fill="#8884d8" 
                        name={comparisonMetric.charAt(0).toUpperCase() + comparisonMetric.slice(1)}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Multi-Metric Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="offer" />
                      <PolarRadiusAxis />
                      {selectedOfferData.map((offer, index) => (
                        <Radar
                          key={offer.id}
                          name={offer.name}
                          dataKey="Conversion"
                          stroke={getMetricColor(index)}
                          fill={getMetricColor(index)}
                          fillOpacity={0.1}
                        />
                      ))}
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Winner Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance Winners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Best Revenue */}
                <div className="text-center p-4 border rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-medium text-green-700">Best Revenue</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOfferData.reduce((best, current) => 
                      current.revenue > best.revenue ? current : best
                    ).name}
                  </p>
                  <p className="font-bold text-green-600">
                    {formatCurrency(Math.max(...selectedOfferData.map(o => o.revenue)))}
                  </p>
                </div>

                {/* Best Conversion Rate */}
                <div className="text-center p-4 border rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-medium text-blue-700">Best Conversion</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOfferData.reduce((best, current) => 
                      current.conversionRate > best.conversionRate ? current : best
                    ).name}
                  </p>
                  <p className="font-bold text-blue-600">
                    {Math.max(...selectedOfferData.map(o => o.conversionRate))}%
                  </p>
                </div>

                {/* Best CTR */}
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <h4 className="font-medium text-yellow-700">Best CTR</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOfferData.reduce((best, current) => 
                      current.clickThroughRate > best.clickThroughRate ? current : best
                    ).name}
                  </p>
                  <p className="font-bold text-yellow-600">
                    {Math.max(...selectedOfferData.map(o => o.clickThroughRate))}%
                  </p>
                </div>

                {/* Best ROI */}
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h4 className="font-medium text-purple-700">Best ROI</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOfferData.reduce((best, current) => 
                      current.returnOnInvestment > best.returnOnInvestment ? current : best
                    ).name}
                  </p>
                  <p className="font-bold text-purple-600">
                    {Math.max(...selectedOfferData.map(o => o.returnOnInvestment))}x
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {selectedOffers.length <= 1 && (
        <Card>
          <CardContent className="p-12 text-center">
            <GitCompare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Select Offers to Compare</h3>
            <p className="text-muted-foreground">
              Choose at least 2 offers from the list above to see detailed performance comparisons
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

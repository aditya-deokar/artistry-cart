// components/dashboard/events/EventPreview.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Calendar, Clock, DollarSign, Percent, Users, Star, Timer } from 'lucide-react';
import Image from 'next/image';
import { Event } from '@/types/event';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface EventPreviewProps {
  event: Event;
  trigger?: React.ReactNode;
  products?: any[]; // Associated products
}

export default function EventPreview({ event, trigger, products = [] }: EventPreviewProps) {
  const [selectedView, setSelectedView] = useState<'customer' | 'admin'>('customer');

  // Calculate event progress
  const getEventProgress = () => {
    const now = new Date();
    const start = new Date(event.starting_date);
    const end = new Date(event.ending_date);
    
    if (now < start) return { status: 'upcoming', progress: 0 };
    if (now > end) return { status: 'ended', progress: 100 };
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return { status: 'active', progress: Math.round((elapsed / total) * 100) };
  };

  const { status, progress } = getEventProgress();

  const getEventTypeDisplay = (type: string) => {
    switch (type) {
      case 'FLASH_SALE': return { label: 'Flash Sale', color: 'bg-red-500' };
      case 'SEASONAL': return { label: 'Seasonal Sale', color: 'bg-blue-500' };
      case 'CLEARANCE': return { label: 'Clearance', color: 'bg-orange-500' };
      case 'NEW_ARRIVAL': return { label: 'New Arrival', color: 'bg-green-500' };
      default: return { label: type, color: 'bg-gray-500' };
    }
  };

  const eventTypeDisplay = getEventTypeDisplay(event.event_type);

  // Customer View Component
  const CustomerView = () => (
    <div className="space-y-6">
      {/* Event Banner */}
      <div className="relative aspect-[16/9] bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg overflow-hidden">
        {event.banner_image?.url ? (
          <Image
            src={event.banner_image.url}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4" />
              <p className="text-2xl font-bold">{event.title}</p>
            </div>
          </div>
        )}
        
        {/* Event Type Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${eventTypeDisplay.color} text-white`}>
            {eventTypeDisplay.label}
          </Badge>
        </div>
        
        {/* Discount Badge */}
        {event.discount_percent && (
          <div className="absolute top-4 right-4">
            <Badge variant="destructive" className="text-xl px-4 py-2">
              {event.discount_percent}% OFF
            </Badge>
          </div>
        )}

        {/* Status Indicator */}
        <div className="absolute bottom-4 left-4">
          <Badge 
            variant={status === 'active' ? 'default' : status === 'upcoming' ? 'secondary' : 'destructive'}
            className="flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            {status === 'active' ? 'Live Now' : 
             status === 'upcoming' ? 'Coming Soon' : 
             'Ended'}
          </Badge>
        </div>
      </div>

      {/* Event Details */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-lg text-muted-foreground">{event.description}</p>
          </div>

          {/* Event Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Event Period</span>
              <span className="font-medium">
                {formatDate(event.starting_date)} - {formatDate(event.ending_date)}
              </span>
            </div>
            
            {status === 'active' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{progress}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>

          {/* Discount Details */}
          {event.discount_value && (
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-400">
                  Special Offer
                </h3>
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {event.discount_type === 'PERCENTAGE' ? `${event.discount_value}% OFF` : 
                   formatCurrency(event.discount_value)}
                </p>
                
                {event.min_order_value && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Minimum order: {formatCurrency(event.min_order_value)}
                  </p>
                )}
                
                {event.max_discount && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Maximum discount: {formatCurrency(event.max_discount)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Event Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="font-bold">{event.views || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Views</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-green-500" />
                <span className="font-bold">{event.clicks || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Interested</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-bold">{event.conversions || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Purchases</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Products */}
      {products.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Featured Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.slice(0, 6).map((product) => (
                <div key={product.id} className="group">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                    {product.images?.[0]?.url && (
                      <Image
                        src={product.images[0].url}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                    {product.is_on_discount && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                        Sale
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium text-sm line-clamp-1">{product.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatCurrency(product.current_price)}</span>
                    {product.is_on_discount && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(product.regular_price)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Admin View Component
  const AdminView = () => (
    <div className="space-y-6">
      {/* Event Configuration */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4">Event Configuration</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Event Type:</span>
                <p className="font-medium">{eventTypeDisplay.label}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={event.is_active ? 'default' : 'secondary'} className="ml-2">
                  {event.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Duration:</span>
                <p className="font-medium">
                  {formatDate(event.starting_date)} to {formatDate(event.ending_date)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Discount Type:</span>
                <p className="font-medium">{event.discount_type?.replace('_', ' ') || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Discount Value:</span>
                <p className="font-medium">
                  {event.discount_type === 'PERCENTAGE' ? `${event.discount_value}%` : 
                   event.discount_value ? formatCurrency(event.discount_value) : 'N/A'}
                </p>
              </div>
              
              {event.min_order_value && (
                <div>
                  <span className="text-sm text-muted-foreground">Min Order Value:</span>
                  <p className="font-medium">{formatCurrency(event.min_order_value)}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4">Performance Metrics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{event.views || 0}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{event.clicks || 0}</p>
              <p className="text-sm text-muted-foreground">Clicks</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{event.conversions || 0}</p>
              <p className="text-sm text-muted-foreground">Conversions</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{formatCurrency(event.totalRevenue || 0)}</p>
              <p className="text-sm text-muted-foreground">Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {products.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Associated Products ({products.length})</h3>
            
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {product.images?.[0]?.url && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={product.images[0].url}
                          alt={product.title}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.category} • Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(product.current_price)}</p>
                    {product.is_on_discount && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.regular_price)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Event Preview</span>
            <div className="flex gap-2">
              <Button
                variant={selectedView === 'customer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('customer')}
              >
                Customer View
              </Button>
              <Button
                variant={selectedView === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('admin')}
              >
                Admin View
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {selectedView === 'customer' ? <CustomerView /> : <AdminView />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

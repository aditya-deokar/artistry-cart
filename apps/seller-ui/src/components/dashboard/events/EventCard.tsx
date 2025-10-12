// components/dashboard/events/EventCard.tsx
'use client';

import { Event } from '@/types/event';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, MoreVertical, Trash2, Copy, Calendar, TrendingUp, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { useEventStore } from '@/store/events/eventStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

interface EventCardProps {
  event: Event;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  selectable?: boolean;
}

export default function EventCard({ 
  event, 
  onEdit, 
  onDelete, 
  onView,
  selectable = false 
}: EventCardProps) {
  const { selectedEvents, toggleEventSelection } = useEventStore();
  const isSelected = selectedEvents.includes(event.id);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'FLASH_SALE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'SEASONAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'CLEARANCE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'NEW_ARRIVAL': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (isActive: boolean, startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isActive) return 'bg-gray-500';
    if (now < start) return 'bg-blue-500';
    if (now > end) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = (isActive: boolean, startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isActive) return 'Inactive';
    if (now < start) return 'Scheduled';
    if (now > end) return 'Ended';
    return 'Active';
  };

  // Calculate progress for active events
  const getEventProgress = () => {
    const now = new Date();
    const start = new Date(event.starting_date);
    const end = new Date(event.ending_date);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  const progress = getEventProgress();
  const primaryImage = event.banner_image?.url || '/placeholder-event.jpg';

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      {selectable && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleEventSelection(event.id)}
            className="bg-white border-2"
          />
        </div>
      )}
      
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        <Image
          src={primaryImage}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge className={getEventTypeColor(event.event_type)}>
            {event.event_type.replace('_', ' ')}
          </Badge>
          <Badge 
            className={`${getStatusColor(event.is_active, event.starting_date, event.ending_date)} text-white text-xs`}
          >
            {getStatusText(event.is_active, event.starting_date, event.ending_date)}
          </Badge>
        </div>
        
        {event.discount_percent && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {event.discount_percent}% OFF
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold line-clamp-2 hover:text-primary cursor-pointer">
            <Link href={`/seller/events/${event.id}`}>
              {event.title}
            </Link>
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>

          {/* Event Schedule */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.starting_date)} - {formatDate(event.ending_date)}</span>
            </div>
            
            {getStatusText(event.is_active, event.starting_date, event.ending_date) === 'Active' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>

          {/* Event Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">{event.views || 0}</div>
              <div className="text-muted-foreground text-xs">Views</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{event.clicks || 0}</div>
              <div className="text-muted-foreground text-xs">Clicks</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{event.conversions || 0}</div>
              <div className="text-muted-foreground text-xs">Sales</div>
            </div>
          </div>

          {/* Revenue */}
          {event.totalRevenue > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Revenue:</span>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">{formatCurrency(event.totalRevenue)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(event.id)}
            asChild
          >
            <Link href={`/seller/events/${event.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit?.(event.id)}
            asChild
          >
            <Link href={`/seller/events/${event.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/seller/events/${event.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/seller/events/${event.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/seller/events/${event.id}/products`}>
                  <Package className="h-4 w-4 mr-2" />
                  Manage Products
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/seller/events/${event.id}/analytics`}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete?.(event.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}

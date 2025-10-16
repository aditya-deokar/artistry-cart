'use client';

import { Event } from '@/types/events';
import { Calendar, Clock, Percent, Tag } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/offers/CountdownTimer';

interface EventCardProps {
  event: Event;
  upcoming?: boolean;
}

const eventTypeColors = {
  FLASH_SALE: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
  SEASONAL: 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800',
  CLEARANCE: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800',
  NEW_ARRIVAL: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
};

const eventTypeLabels = {
  FLASH_SALE: 'Flash Sale',
  SEASONAL: 'Seasonal',
  CLEARANCE: 'Clearance',
  NEW_ARRIVAL: 'New Arrival',
};

export function EventCard({ event, upcoming = false }: EventCardProps) {
  const isActive = event.is_active && new Date(event.ending_date) > new Date();
  const hasStarted = new Date(event.starting_date) <= new Date();

  return (
    <Link href={`/events/${event.id}`} className="block h-full group">
      <div className={`h-full flex flex-col overflow-hidden rounded-xl border-2 bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        upcoming 
          ? 'border-primary/40 shadow-lg shadow-primary/5' 
          : 'border-border hover:border-primary/50'
      }`}>
        {/* Banner Image - Larger */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {event.banner_image?.url ? (
            <img
              src={event.banner_image.url}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Tag className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Event Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${eventTypeColors[event.event_type]} font-semibold shadow-sm`}>
              {eventTypeLabels[event.event_type]}
            </Badge>
          </div>

          {/* Discount Badge */}
          {event.discount_percent && event.discount_percent > 0 && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
                <Percent className="h-4 w-4" />
                <span>{event.discount_percent}% OFF</span>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          {!hasStarted && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold backdrop-blur-md ${
                upcoming 
                  ? 'bg-primary/90 text-primary-foreground shadow-lg' 
                  : 'bg-yellow-500/90 text-white'
              }`}>
                <Clock className="h-4 w-4" />
                <span>Coming Soon</span>
              </div>
            </div>
          )}
        </div>

        {/* Content - More Spacious */}
        <div className="flex-1 p-6 space-y-4">
          {/* Title */}
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Shop Info */}
          {event.Shop && (
            <div className="flex items-center gap-3 pt-4 border-t">
              {event.Shop.logo?.url ? (
                <img
                  src={event.Shop.logo.url}
                  alt={event.Shop.name}
                  className="h-8 w-8 rounded-full object-cover border-2 border-background shadow-sm"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <span className="text-sm font-bold text-primary">
                    {event.Shop.name[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">{event.Shop.name}</span>
              </div>
            </div>
          )}

          {/* Date Range & Countdown */}
          <div className="space-y-3 pt-2">
            {isActive && hasStarted ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Ends in
                </span>
                <CountdownTimer endDate={event.ending_date} className="text-sm font-semibold" />
              </div>
            ) : hasStarted ? (
              <div className="text-sm text-red-600 font-semibold flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                <Clock className="h-4 w-4" />
                Event Ended
              </div>
            ) : (
              <div>
                {upcoming ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                    <span className="text-sm text-primary font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Starts in
                    </span>
                    <CountdownTimer endDate={event.starting_date} className="text-sm font-semibold text-primary" />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.starting_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Product Count */}
            {event.productCount !== undefined && event.productCount > 0 && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{event.productCount} {event.productCount === 1 ? 'product' : 'products'} available</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

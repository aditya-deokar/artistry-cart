'use client';

import { Event } from '@/types/events';
import { Calendar, Clock, MapPin, Percent, Share2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/offers/CountdownTimer';

interface EventHeroProps {
  event: Event;
}

const eventTypeColors = {
  FLASH_SALE: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
  SEASONAL: 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800',
  CLEARANCE: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800',
  NEW_ARRIVAL: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
};

const eventTypeLabels = {
  FLASH_SALE: 'Flash Sale',
  SEASONAL: 'Seasonal Sale',
  CLEARANCE: 'Clearance Sale',
  NEW_ARRIVAL: 'New Arrival',
};

export function EventHero({ event }: EventHeroProps) {
  const isActive = event.is_active && new Date(event.ending_date) > new Date();
  const hasStarted = new Date(event.starting_date) <= new Date();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card shadow-lg">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        {event.banner_image?.url && (
          <img
            src={event.banner_image.url}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="relative">
        <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Side - Image */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted lg:aspect-square">
            {event.banner_image?.url ? (
              <img
                src={event.banner_image.url}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Tag className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}

            {/* Discount Badge */}
            {event.discount_percent && event.discount_percent > 0 && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-lg font-bold text-white shadow-xl">
                  <Percent className="h-5 w-5" />
                  <span>UP TO {event.discount_percent}% OFF</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Info */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Event Type Badge */}
            <div>
              <Badge className={`${eventTypeColors[event.event_type]} text-base px-4 py-1.5 font-semibold`}>
                {eventTypeLabels[event.event_type]}
              </Badge>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                {event.title}
              </h1>
            </div>

            {/* Description */}
            <p className="text-lg text-muted-foreground">
              {event.description}
            </p>

            {/* Shop Info */}
            {event.Shop && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                {event.Shop.logo?.url ? (
                  <img
                    src={event.Shop.logo.url}
                    alt={event.Shop.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {event.Shop.name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{event.Shop.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Event Host</p>
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              {/* Start Date */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.starting_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* End Date / Countdown */}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  {isActive && hasStarted ? (
                    <div>
                      <p className="text-sm font-medium text-red-600">Ending Soon!</p>
                      <div className="mt-1">
                        <CountdownTimer endDate={event.ending_date} />
                      </div>
                    </div>
                  ) : hasStarted ? (
                    <div>
                      <p className="text-sm font-medium text-red-600">Event Ended</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.ending_date).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Coming Soon</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.starting_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isActive && hasStarted && (
                <Button size="lg" className="flex-1">
                  Shop Now
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// components/dashboard/events/EventFilters.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import { useEventStore } from '@/store/events/eventStore';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function EventFilters() {
  const {
    filters,
    setFilters,
    clearFilters,
    selectedCount,
    activeEvents,
    upcomingEvents,
    endedEvents
  } = useEventStore();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.dateRange ? {
      from: filters.dateRange.from,
      to: filters.dateRange.to
    } : undefined
  );

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setFilters({ 
      dateRange: range ? {
        from: range.from,
        to: range.to
      } : null 
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.event_type) count++;
    if (filters.status) count++;
    if (filters.dateRange) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Event Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {selectedCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {selectedCount} events selected
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Event Type Filter */}
        <div className="space-y-2">
          <Label>Event Type</Label>
          <Select
            value={filters.event_type || ''}
            onValueChange={(value) => handleFilterChange('event_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
              <SelectItem value="SEASONAL">Seasonal Sale</SelectItem>
              <SelectItem value="CLEARANCE">Clearance</SelectItem>
              <SelectItem value="NEW_ARRIVAL">New Arrival</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Event Status</Label>
          <Select
            value={filters.status || ''}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">
                Active ({activeEvents.length})
              </SelectItem>
              <SelectItem value="upcoming">
                Upcoming ({upcomingEvents.length})
              </SelectItem>
              <SelectItem value="ended">
                Ended ({endedEvents.length})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Separator />

        {/* Quick Filters */}
        <div className="space-y-3">
          <Label>Quick Filters</Label>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active-only"
                checked={filters.status === 'active'}
                onCheckedChange={(checked) => 
                  handleFilterChange('status', checked ? 'active' : '')
                }
              />
              <Label htmlFor="active-only" className="text-sm">
                Active Events Only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="upcoming-only"
                checked={filters.status === 'upcoming'}
                onCheckedChange={(checked) => 
                  handleFilterChange('status', checked ? 'upcoming' : '')
                }
              />
              <Label htmlFor="upcoming-only" className="text-sm">
                Upcoming Events Only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="flash-sales"
                checked={filters.event_type === 'FLASH_SALE'}
                onCheckedChange={(checked) => 
                  handleFilterChange('event_type', checked ? 'FLASH_SALE' : '')
                }
              />
              <Label htmlFor="flash-sales" className="text-sm">
                Flash Sales Only
              </Label>
            </div>
          </div>
        </div>

        {/* Event Statistics */}
        <div className="bg-muted/50 rounded-lg p-3">
          <Label className="text-sm font-medium mb-2 block">Event Overview</Label>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Events:</span>
              <Badge variant="default" className="text-xs">
                {activeEvents.length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Upcoming Events:</span>
              <Badge variant="secondary" className="text-xs">
                {upcomingEvents.length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ended Events:</span>
              <Badge variant="outline" className="text-xs">
                {endedEvents.length}
              </Badge>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.event_type && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.event_type.replace('_', ' ')}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleFilterChange('event_type', '')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.status && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.status}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleFilterChange('status', '')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {dateRange && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Date Range
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleDateRangeChange(undefined)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* Clear All Button */}
        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={clearFilters}
          >
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

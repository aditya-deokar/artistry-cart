// components/dashboard/offers/OfferFilters.tsx
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
import { Input } from '@/components/ui/input';
import { Filter, X, RotateCcw, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface OfferFiltersProps {
  onFiltersChange: (filters: any) => void;
  activeFilters?: any;
}

export default function OfferFilters({ onFiltersChange, activeFilters = {} }: OfferFiltersProps) {
  const [filters, setFilters] = useState({
    offerType: activeFilters.offerType || '',
    status: activeFilters.status || '',
    discountType: activeFilters.discountType || '',
    category: activeFilters.category || '',
    priority: activeFilters.priority || '',
    minDiscount: activeFilters.minDiscount || '',
    maxDiscount: activeFilters.maxDiscount || '',
    dateRange: activeFilters.dateRange || null,
    ...activeFilters
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.dateRange ? {
      from: new Date(filters.dateRange.from),
      to: new Date(filters.dateRange.to)
    } : undefined
  );

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    const dateFilter = range ? {
      from: range.from,
      to: range.to
    } : null;
    handleFilterChange('dateRange', dateFilter);
  };

  const clearFilters = () => {
    const emptyFilters = {
      offerType: '',
      status: '',
      discountType: '',
      category: '',
      priority: '',
      minDiscount: '',
      maxDiscount: '',
      dateRange: null,
    };
    setFilters(emptyFilters);
    setDateRange(undefined);
    onFiltersChange(emptyFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Offer Filters
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
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Offer Type Filter */}
        <div className="space-y-2">
          <Label>Offer Type</Label>
          <Select
            value={filters.offerType}
            onValueChange={(value) => handleFilterChange('offerType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="SEASONAL">Seasonal Offers</SelectItem>
              <SelectItem value="FLASH_SALE">Flash Sales</SelectItem>
              <SelectItem value="PRICING">Pricing Offers</SelectItem>
              <SelectItem value="PROMOTIONAL">Promotional</SelectItem>
              <SelectItem value="LIMITED_TIME">Limited Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="ENDED">Ended</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Discount Type Filter */}
        <div className="space-y-2">
          <Label>Discount Type</Label>
          <Select
            value={filters.discountType}
            onValueChange={(value) => handleFilterChange('discountType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Discounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Discounts</SelectItem>
              <SelectItem value="PERCENTAGE">Percentage Off</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
              <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={filters.priority}
            onValueChange={(value) => handleFilterChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="HIGH">High Priority</SelectItem>
              <SelectItem value="MEDIUM">Medium Priority</SelectItem>
              <SelectItem value="LOW">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Discount Range Filter */}
        <div className="space-y-2">
          <Label>Discount Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                placeholder="Min %"
                type="number"
                value={filters.minDiscount}
                onChange={(e) => handleFilterChange('minDiscount', e.target.value)}
              />
            </div>
            <div>
              <Input
                placeholder="Max %"
                type="number"
                value={filters.maxDiscount}
                onChange={(e) => handleFilterChange('maxDiscount', e.target.value)}
              />
            </div>
          </div>
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
                checked={filters.status === 'ACTIVE'}
                onCheckedChange={(checked) => 
                  handleFilterChange('status', checked ? 'ACTIVE' : '')
                }
              />
              <Label htmlFor="active-only" className="text-sm">
                Active Offers Only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="high-priority"
                checked={filters.priority === 'HIGH'}
                onCheckedChange={(checked) => 
                  handleFilterChange('priority', checked ? 'HIGH' : '')
                }
              />
              <Label htmlFor="high-priority" className="text-sm">
                High Priority Only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="flash-sales"
                checked={filters.offerType === 'FLASH_SALE'}
                onCheckedChange={(checked) => 
                  handleFilterChange('offerType', checked ? 'FLASH_SALE' : '')
                }
              />
              <Label htmlFor="flash-sales" className="text-sm">
                Flash Sales Only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ending-soon"
                checked={filters.endingSoon || false}
                onCheckedChange={(checked) => 
                  handleFilterChange('endingSoon', checked)
                }
              />
              <Label htmlFor="ending-soon" className="text-sm">
                Ending Soon (24h)
              </Label>
            </div>
          </div>
        </div>

        {/* Performance Filters */}
        <div className="space-y-3">
          <Label>Performance</Label>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="high-conversion"
                checked={filters.highConversion || false}
                onCheckedChange={(checked) => 
                  handleFilterChange('highConversion', checked)
                }
              />
              <Label htmlFor="high-conversion" className="text-sm">
                High Conversion (>5%)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="high-revenue"
                checked={filters.highRevenue || false}
                onCheckedChange={(checked) => 
                  handleFilterChange('highRevenue', checked)
                }
              />
              <Label htmlFor="high-revenue" className="text-sm">
                High Revenue (>$1000)
              </Label>
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
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || value === '' || value === null) return null;
                  
                  return (
                    <Badge key={key} variant="secondary" className="flex items-center gap-1">
                      {key}: {typeof value === 'object' ? 'Custom Range' : value}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => handleFilterChange(key, '')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
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

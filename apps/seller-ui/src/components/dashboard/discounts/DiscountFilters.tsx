// components/dashboard/discounts/DiscountFilters.tsx
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
import { Filter, X, RotateCcw, Calendar as CalendarIcon, Percent, DollarSign } from 'lucide-react';
import { useDiscountStore } from '@/store/discounts/discountStore';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Input } from '@/components/ui/input';

export default function DiscountFilters() {
  const {
    filters,
    setFilters,
    clearFilters,
    selectedCount,
    activeDiscounts,
    expiredDiscounts,
    inactiveDiscounts
  } = useDiscountStore();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.dateRange ? {
      from: filters.dateRange.from,
      to: filters.dateRange.to
    } : undefined
  );

  const [usageRange, setUsageRange] = useState({ min: '', max: '' });

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

  const handleUsageRangeChange = (type: 'min' | 'max', value: string) => {
    setUsageRange(prev => ({ ...prev, [type]: value }));
    setFilters({ 
      usageRange: {
        min: type === 'min' ? (value ? parseInt(value) : undefined) : usageRange.min ? parseInt(usageRange.min) : undefined,
        max: type === 'max' ? (value ? parseInt(value) : undefined) : usageRange.max ? parseInt(usageRange.max) : undefined
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.discountType) count++;
    if (filters.status) count++;
    if (filters.dateRange) count++;
    if (filters.usageRange?.min || filters.usageRange?.max) count++;
    if (filters.minimumAmount) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Discount Filters
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
            {selectedCount} discounts selected
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Discount Type Filter */}
        <div className="space-y-2">
          <Label>Discount Type</Label>
          <Select
            value={filters.discountType || ''}
            onValueChange={(value) => handleFilterChange('discountType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="PERCENTAGE">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Percentage Discount
                </div>
              </SelectItem>
              <SelectItem value="FIXED_AMOUNT">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Fixed Amount
                </div>
              </SelectItem>
              <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
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
                Active ({activeDiscounts.length})
              </SelectItem>
              <SelectItem value="expired">
                Expired ({expiredDiscounts.length})
              </SelectItem>
              <SelectItem value="inactive">
                Inactive ({inactiveDiscounts.length})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Valid Date Range</Label>
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

        {/* Usage Range Filter */}
        <div className="space-y-2">
          <Label>Usage Count</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                placeholder="Min"
                type="number"
                value={usageRange.min}
                onChange={(e) => handleUsageRangeChange('min', e.target.value)}
              />
            </div>
            <div>
              <Input
                placeholder="Max"
                type="number"
                value={usageRange.max}
                onChange={(e) => handleUsageRangeChange('max', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Minimum Order Amount Filter */}
        <div className="space-y-2">
          <Label>Minimum Order Amount</Label>
          <Input
            placeholder="e.g., 50.00"
            type="number"
            step="0.01"
            value={filters.minimumAmount || ''}
            onChange={(e) => handleFilterChange('minimumAmount', e.target.value ? parseFloat(e.target.value) : null)}
          />
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
                Active Discounts Only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="no-usage-limit"
                checked={filters.noUsageLimit || false}
                onCheckedChange={(checked) => 
                  handleFilterChange('noUsageLimit', checked)
                }
              />
              <Label htmlFor="no-usage-limit" className="text-sm">
                No Usage Limit
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="high-usage"
                checked={filters.highUsage || false}
                onCheckedChange={(checked) => 
                  handleFilterChange('highUsage', checked)
                }
              />
              <Label htmlFor="high-usage" className="text-sm">
                High Usage (50+ uses)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="percentage-discounts"
                checked={filters.discountType === 'PERCENTAGE'}
                onCheckedChange={(checked) => 
                  handleFilterChange('discountType', checked ? 'PERCENTAGE' : '')
                }
              />
              <Label htmlFor="percentage-discounts" className="text-sm">
                Percentage Discounts
              </Label>
            </div>
          </div>
        </div>

        {/* Discount Statistics */}
        <div className="bg-muted/50 rounded-lg p-3">
          <Label className="text-sm font-medium mb-2 block">Overview</Label>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active:</span>
              <Badge variant="default" className="text-xs">
                {activeDiscounts.length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expired:</span>
              <Badge variant="destructive" className="text-xs">
                {expiredDiscounts.length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inactive:</span>
              <Badge variant="secondary" className="text-xs">
                {inactiveDiscounts.length}
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
                {filters.discountType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.discountType.replace('_', ' ')}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleFilterChange('discountType', '')}
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

                {(usageRange.min || usageRange.max) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Usage Range
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => {
                        setUsageRange({ min: '', max: '' });
                        handleFilterChange('usageRange', null);
                      }}
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

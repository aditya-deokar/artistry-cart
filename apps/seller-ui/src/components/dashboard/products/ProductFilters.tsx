// components/dashboard/products/ProductFilters.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Filter, X, RotateCcw } from 'lucide-react';
import { useProductStore } from '@/store/products/productStore';
import { getCategories } from '@/lib/api/products';
import { formatCurrency } from '@/lib/utils/formatting';

export default function ProductFilters() {
  const {
    filters,
    setFilters,
    clearFilters,
    selectedCount
  } = useProductStore();

  const [priceRange, setPriceRange] = useState<[number, number]>(
    filters.priceRange || [0, 10000]
  );

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
    setFilters({ priceRange: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.subCategory) count++;
    if (filters.status) count++;
    if (filters.brand) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000)) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  
  const availableSubCategories = filters.category && categoriesData?.subCategories[filters.category] || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
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
            {selectedCount} products selected
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.category || ''}
            onValueChange={(value) => {
              handleFilterChange('category', value);
              handleFilterChange('subCategory', ''); // Reset subcategory when category changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categoriesData?.categories?.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub Category Filter */}
        {availableSubCategories.length > 0 && (
          <div className="space-y-2">
            <Label>Sub Category</Label>
            <Select
              value={filters.subCategory || ''}
              onValueChange={(value) => handleFilterChange('subCategory', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Sub Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sub Categories</SelectItem>
                {availableSubCategories.map((subCategory) => (
                  <SelectItem key={subCategory} value={subCategory}>
                    {subCategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Range Filter */}
        <div className="space-y-4">
          <Label>Price Range</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              min={0}
              max={10000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{formatCurrency(priceRange[0])}</span>
              <span>{formatCurrency(priceRange[1])}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Stock Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={filters.inStock || false}
            onCheckedChange={(checked) => handleFilterChange('inStock', checked)}
          />
          <Label htmlFor="inStock" className="text-sm">
            In Stock Only
          </Label>
        </div>

        {/* On Sale Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="onSale"
            checked={filters.onSale || false}
            onCheckedChange={(checked) => handleFilterChange('onSale', checked)}
          />
          <Label htmlFor="onSale" className="text-sm">
            On Sale
          </Label>
        </div>

        <Separator />

        {/* Brand Filter */}
        <div className="space-y-2">
          <Label>Brand</Label>
          <Select
            value={filters.brand || ''}
            onValueChange={(value) => handleFilterChange('brand', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Brands</SelectItem>
              {/* You can populate this with actual brands from your data */}
              <SelectItem value="Nike">Nike</SelectItem>
              <SelectItem value="Adidas">Adidas</SelectItem>
              <SelectItem value="Apple">Apple</SelectItem>
              <SelectItem value="Samsung">Samsung</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.category}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleFilterChange('category', '')}
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
                
                {filters.inStock && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    In Stock
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleFilterChange('inStock', false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.onSale && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    On Sale
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleFilterChange('onSale', false)}
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

'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

import { RotateCcw } from 'lucide-react';
import { aiVisionClient, type SchemaData } from '@/lib/api/aivision-client';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FilterSidebarProps {
  activeTab: string;
  onFiltersChange?: (filters: FilterState) => void;
}

export interface FilterState {
  categories: string[];
  materials: string[];
  styles: string[];
  priceRange: [number, number];
  sortBy?: string;
}

export default function FilterSidebar({ activeTab, onFiltersChange }: FilterSidebarProps) {
  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    materials: [],
    styles: [],
    priceRange: [0, 50000],
  });

  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = async () => {
    try {
      setLoading(true);
      const data = await aiVisionClient.getAllSchema();
      setSchema(data);
    } catch (error) {
      console.error('Failed to load schema:', error);
      toast.error('Failed to load filters');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    handleFilterChange('categories', newCategories);
  };

  const handleMaterialToggle = (material: string) => {
    const newMaterials = filters.materials.includes(material)
      ? filters.materials.filter((m) => m !== material)
      : [...filters.materials, material];
    handleFilterChange('materials', newMaterials);
  };

  const handleStyleToggle = (style: string) => {
    const newStyles = filters.styles.includes(style)
      ? filters.styles.filter((s) => s !== style)
      : [...filters.styles, style];
    handleFilterChange('styles', newStyles);
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      categories: [],
      materials: [],
      styles: [],
      priceRange: [0, 50000],
    };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.materials.length > 0 ||
    filters.styles.length > 0 ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 50000;

  if (loading) {
    return (
      <Card className="p-4 space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </Card>
    );
  }

  // Show different filters based on active tab
  const showCategoryFilter = activeTab !== 'generate';
  const showMaterialFilter = true;
  const showStyleFilter = true;
  const showPriceFilter = activeTab === 'explore' || activeTab === 'my-concepts';

  return (
    <Card className="p-4 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] uppercase tracking-wide">
            Filters
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Categories */}
        {showCategoryFilter && schema?.categories && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
              Categories
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-premium">
              {schema.categories.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={filters.categories.includes(category.value)}
                    onCheckedChange={() => handleCategoryToggle(category.value)}
                  />
                  <label
                    htmlFor={`category-${category.value}`}
                    className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] cursor-pointer hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materials */}
        {showMaterialFilter && schema?.materials && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
              Materials
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-premium">
              {schema.materials.slice(0, 10).map((material) => (
                <div key={material} className="flex items-center space-x-2">
                  <Checkbox
                    id={`material-${material}`}
                    checked={filters.materials.includes(material)}
                    onCheckedChange={() => handleMaterialToggle(material)}
                  />
                  <label
                    htmlFor={`material-${material}`}
                    className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] cursor-pointer hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors"
                  >
                    {material}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Styles */}
        {showStyleFilter && schema?.styles && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
              Styles
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-premium">
              {schema.styles.slice(0, 10).map((style) => (
                <div key={style} className="flex items-center space-x-2">
                  <Checkbox
                    id={`style-${style}`}
                    checked={filters.styles.includes(style)}
                    onCheckedChange={() => handleStyleToggle(style)}
                  />
                  <label
                    htmlFor={`style-${style}`}
                    className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] cursor-pointer hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors"
                  >
                    {style}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        {showPriceFilter && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
              Price Range
            </Label>
            <div className="space-y-4">
              <Slider
                min={0}
                max={50000}
                step={1000}
                value={filters.priceRange}
                onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs text-[var(--ac-stone)]">
                <span>₹{filters.priceRange[0].toLocaleString()}</span>
                <span>₹{filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

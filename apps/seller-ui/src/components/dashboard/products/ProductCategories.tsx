// components/dashboard/products/ProductCategories.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, FolderTree, Tag } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { getCategories } from '@/lib/api/products';

interface ProductCategoriesProps {
  onCategoryChange?: (category: string, subCategory: string) => void;
}

export default function ProductCategories({ onCategoryChange }: ProductCategoriesProps) {
  const form = useFormContext();
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [customSubCategory, setCustomSubCategory] = useState('');

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const selectedCategory = form.watch('category');
  const selectedSubCategory = form.watch('subCategory');
  
  const availableSubCategories = selectedCategory && categoriesData?.subCategories[selectedCategory] || [];

  const handleCategoryChange = (category: string) => {
    form.setValue('category', category);
    form.setValue('subCategory', ''); // Reset subcategory
    onCategoryChange?.(category, '');
  };

  const handleSubCategoryChange = (subCategory: string) => {
    form.setValue('subCategory', subCategory);
    onCategoryChange?.(selectedCategory, subCategory);
  };

  const addCustomCategory = () => {
    if (customCategory.trim()) {
      form.setValue('category', customCategory.trim());
      if (customSubCategory.trim()) {
        form.setValue('subCategory', customSubCategory.trim());
      }
      setCustomCategory('');
      setCustomSubCategory('');
      setShowCustomCategory(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderTree className="h-5 w-5" />
          Product Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.categories?.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sub Category */}
        {availableSubCategories.length > 0 && (
          <FormField
            control={form.control}
            name="subCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub Category</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={handleSubCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sub category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubCategories.map((subCategory) => (
                        <SelectItem key={subCategory} value={subCategory}>
                          {subCategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Selected Categories Display */}
        {(selectedCategory || selectedSubCategory) && (
          <div className="space-y-2">
            <Label>Selected Categories</Label>
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <Badge variant="default" className="flex items-center gap-1">
                  <FolderTree className="h-3 w-3" />
                  {selectedCategory}
                </Badge>
              )}
              {selectedSubCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {selectedSubCategory}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Custom Category Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Custom Category</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCustomCategory(!showCustomCategory)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Custom
            </Button>
          </div>

          {showCustomCategory && (
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="customCategory">Custom Category</Label>
                <Input
                  id="customCategory"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customSubCategory">Custom Sub Category (Optional)</Label>
                <Input
                  id="customSubCategory"
                  placeholder="Enter custom sub category"
                  value={customSubCategory}
                  onChange={(e) => setCustomSubCategory(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={addCustomCategory}
                  disabled={!customCategory.trim()}
                >
                  Add Category
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategory('');
                    setCustomSubCategory('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Category Suggestions */}
        {categoriesData?.categories && (
          <div className="space-y-2">
            <Label>Popular Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categoriesData.categories.slice(0, 6).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  className="px-3 py-1 text-sm border rounded-full hover:bg-muted transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Guidelines */}
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">Category Guidelines</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Choose the most specific category that fits your product</li>
            <li>• Sub categories help customers find your product easier</li>
            <li>• Use custom categories only if existing ones don't fit</li>
            <li>• Categories affect search visibility and recommendations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

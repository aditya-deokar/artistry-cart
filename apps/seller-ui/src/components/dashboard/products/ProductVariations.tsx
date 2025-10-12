// components/dashboard/products/ProductVariations.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Palette, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductVariationsProps {
  colors: string[];
  sizes: string[];
  onColorsChange: (colors: string[]) => void;
  onSizesChange: (sizes: string[]) => void;
}

const predefinedColors = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Orange', value: '#f97316' },
];

const predefinedSizes = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  '28', '30', '32', '34', '36', '38', '40', '42',
  '6', '7', '8', '9', '10', '11', '12'
];

export default function ProductVariations({
  colors,
  sizes,
  onColorsChange,
  onSizesChange
}: ProductVariationsProps) {
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');

  const addColor = (color: string) => {
    if (color && !colors.includes(color)) {
      onColorsChange([...colors, color]);
    }
  };

  const removeColor = (colorToRemove: string) => {
    onColorsChange(colors.filter(color => color !== colorToRemove));
  };

  const addSize = (size: string) => {
    if (size && !sizes.includes(size)) {
      onSizesChange([...sizes, size]);
    }
  };

  const removeSize = (sizeToRemove: string) => {
    onSizesChange(sizes.filter(size => size !== sizeToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Colors Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Color Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter custom color"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addColor(colorInput);
                  setColorInput('');
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                addColor(colorInput);
                setColorInput('');
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Predefined Colors */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Quick Select Colors
            </Label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => addColor(color.name)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors",
                    colors.includes(color.name)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: color.value }}
                  />
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Colors */}
          {colors.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Selected Colors ({colors.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const predefinedColor = predefinedColors.find(c => c.name === color);
                  return (
                    <Badge key={color} variant="secondary" className="flex items-center gap-2">
                      {predefinedColor && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: predefinedColor.value }}
                        />
                      )}
                      {color}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeColor(color)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sizes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Sizes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Size Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter custom size"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSize(sizeInput);
                  setSizeInput('');
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                addSize(sizeInput);
                setSizeInput('');
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Predefined Sizes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Quick Select Sizes
            </Label>
            <div className="flex flex-wrap gap-2">
              {predefinedSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => addSize(size)}
                  className={cn(
                    "px-3 py-2 rounded-md border text-sm transition-colors",
                    sizes.includes(size)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Sizes */}
          {sizes.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Selected Sizes ({sizes.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <Badge key={size} variant="secondary" className="flex items-center gap-2">
                    {size}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeSize(size)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

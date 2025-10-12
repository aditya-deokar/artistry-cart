// components/dashboard/shared/CategorySelector.tsx
'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronDown, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface Category {
  id: string;
  name: string;
  slug?: string;
  parent?: string;
  level?: number;
  children?: Category[];
  count?: number;
  description?: string;
}

interface CategorySelectorProps {
  categories: Category[];
  value?: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  multiple?: boolean;
  hierarchical?: boolean;
  showCount?: boolean;
  maxSelections?: number;
  onCreateNew?: (name: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CategorySelector({
  categories,
  value = [],
  onChange,
  placeholder = "Select categories...",
  searchPlaceholder = "Search categories...",
  multiple = true,
  hierarchical = true,
  showCount = false,
  maxSelections,
  onCreateNew,
  disabled = false,
  className,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Flatten hierarchical categories if needed
  const flatCategories = useMemo(() => {
    const flatten = (cats: Category[], level = 0): Category[] => {
      return cats.reduce((acc: Category[], cat) => {
        const flatCat = { ...cat, level };
        acc.push(flatCat);
        if (cat.children && cat.children.length > 0) {
          acc.push(...flatten(cat.children, level + 1));
        }
        return acc;
      }, []);
    };
    
    return hierarchical ? flatten(categories) : categories;
  }, [categories, hierarchical]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return flatCategories;
    
    return flatCategories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [flatCategories, searchQuery]);

  // Get selected category names
  const selectedCategories = useMemo(() => {
    return flatCategories.filter(cat => value.includes(cat.id));
  }, [flatCategories, value]);

  const handleSelect = (categoryId: string) => {
    if (!multiple) {
      onChange([categoryId]);
      setOpen(false);
      return;
    }

    const newValue = value.includes(categoryId)
      ? value.filter(id => id !== categoryId)
      : [...value, categoryId];

    if (maxSelections && newValue.length > maxSelections) {
      return; // Don't allow selection beyond max
    }

    onChange(newValue);
  };

  const handleRemove = (categoryId: string) => {
    onChange(value.filter(id => id !== categoryId));
  };

  const handleClear = () => {
    onChange([]);
  };

  const handleCreateNew = (name: string) => {
    if (onCreateNew && name.trim()) {
      onCreateNew(name.trim());
      setSearchQuery("");
    }
  };

  const renderCategoryItem = (category: Category) => {
    const isSelected = value.includes(category.id);
    const indentClass = hierarchical && category.level 
      ? `ml-${category.level * 4}` 
      : '';

    return (
      <CommandItem
        key={category.id}
        onSelect={() => handleSelect(category.id)}
        className={cn("flex items-center space-x-2 cursor-pointer", indentClass)}
      >
        <div className="flex items-center space-x-2 flex-1">
          {multiple ? (
            <Checkbox
              checked={isSelected}
              onChange={() => handleSelect(category.id)}
            />
          ) : (
            <div className={cn(
              "h-4 w-4 rounded-full border",
              isSelected && "bg-primary border-primary"
            )}>
              {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
          )}
          
          <div className="flex-1">
            <span className="text-sm">{category.name}</span>
            {category.description && (
              <p className="text-xs text-muted-foreground truncate">
                {category.description}
              </p>
            )}
          </div>
          
          {showCount && category.count !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {category.count}
            </Badge>
          )}
        </div>
      </CommandItem>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-10"
            disabled={disabled}
          >
            <div className="flex items-center gap-1 flex-1">
              {selectedCategories.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : selectedCategories.length === 1 ? (
                <span>{selectedCategories[0].name}</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedCategories.slice(0, 2).map(cat => (
                    <Badge key={cat.id} variant="secondary" className="text-xs">
                      {cat.name}
                    </Badge>
                  ))}
                  {selectedCategories.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedCategories.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            
            <CommandList>
              <ScrollArea className="h-72">
                <CommandEmpty className="py-6 text-center text-sm">
                  <div className="space-y-2">
                    <p>No categories found.</p>
                    {onCreateNew && searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateNew(searchQuery)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create "{searchQuery}"
                      </Button>
                    )}
                  </div>
                </CommandEmpty>
                
                <CommandGroup>
                  {filteredCategories.map(renderCategoryItem)}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
            
            {multiple && selectedCategories.length > 0 && (
              <>
                <Separator />
                <div className="p-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Selected ({selectedCategories.length})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="h-6 px-2 text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedCategories.map(cat => (
                      <Badge
                        key={cat.id}
                        variant="secondary"
                        className="text-xs cursor-pointer"
                        onClick={() => handleRemove(cat.id)}
                      >
                        {cat.name}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {maxSelections && (
        <p className="text-xs text-muted-foreground mt-1">
          {selectedCategories.length}/{maxSelections} selected
        </p>
      )}
    </div>
  );
}

// components/dashboard/shared/FilterSidebar.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
  checked?: boolean;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'select' | 'range' | 'search';
  options?: FilterOption[];
  value?: any;
  placeholder?: string;
  min?: number;
  max?: number;
  collapsed?: boolean;
}

interface FilterSidebarProps {
  title?: string;
  groups: FilterGroup[];
  onFilterChange: (groupId: string, value: any) => void;
  onClearFilters: () => void;
  activeFiltersCount?: number;
  className?: string;
}

export function FilterSidebar({
  title = "Filters",
  groups,
  onFilterChange,
  onClearFilters,
  activeFiltersCount = 0,
  className,
}: FilterSidebarProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(groups.filter(g => g.collapsed).map(g => g.id))
  );

  const toggleGroup = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  const handleCheckboxChange = (groupId: string, optionId: string, checked: boolean) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !group.options) return;

    const currentValue = group.value || [];
    const newValue = checked
      ? [...currentValue, optionId]
      : currentValue.filter((id: string) => id !== optionId);
    
    onFilterChange(groupId, newValue);
  };

  const renderFilterGroup = (group: FilterGroup) => {
    const isCollapsed = collapsedGroups.has(group.id);

    return (
      <div key={group.id} className="space-y-3">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleGroup(group.id)}
        >
          <Label className="text-sm font-medium">{group.label}</Label>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </div>

        {!isCollapsed && (
          <div className="space-y-2">
            {group.type === 'checkbox' && group.options && (
              <div className="space-y-2">
                {group.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${group.id}-${option.id}`}
                      checked={group.value?.includes(option.id) || option.checked}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(group.id, option.id, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`${group.id}-${option.id}`}
                      className="text-sm flex items-center justify-between flex-1 cursor-pointer"
                    >
                      <span>{option.label}</span>
                      {option.count !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          {option.count}
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {group.type === 'select' && group.options && (
              <Select value={group.value} onValueChange={(value) => onFilterChange(group.id, value)}>
                <SelectTrigger>
                  <SelectValue placeholder={group.placeholder || "Select option"} />
                </SelectTrigger>
                <SelectContent>
                  {group.options.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {option.count !== undefined && (
                          <Badge variant="outline" className="text-xs ml-2">
                            {option.count}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {group.type === 'search' && (
              <Input
                type="text"
                placeholder={group.placeholder || "Search..."}
                value={group.value || ''}
                onChange={(e) => onFilterChange(group.id, e.target.value)}
              />
            )}

            {group.type === 'range' && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  min={group.min}
                  max={group.max}
                  value={group.value?.min || ''}
                  onChange={(e) => onFilterChange(group.id, { 
                    ...group.value, 
                    min: e.target.value ? Number(e.target.value) : null 
                  })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  min={group.min}
                  max={group.max}
                  value={group.value?.max || ''}
                  onChange={(e) => onFilterChange(group.id, { 
                    ...group.value, 
                    max: e.target.value ? Number(e.target.value) : null 
                  })}
                />
              </div>
            )}
          </div>
        )}
        
        <Separator />
      </div>
    );
  };

  return (
    <Card className={cn("w-80 h-fit", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {title}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[600px] pr-3">
          <div className="space-y-4">
            {groups.map(renderFilterGroup)}
          </div>
        </ScrollArea>

        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={onClearFilters}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

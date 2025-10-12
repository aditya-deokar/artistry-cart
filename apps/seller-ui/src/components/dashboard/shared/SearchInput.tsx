// components/dashboard/shared/SearchInput.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchSuggestion {
  id: string;
  label: string;
  category?: string;
  count?: number;
}

export interface SearchFilter {
  id: string;
  label: string;
  active: boolean;
}

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string, filters?: string[]) => void;
  onClear?: () => void;
  suggestions?: SearchSuggestion[];
  filters?: SearchFilter[];
  onFilterChange?: (filterId: string, active: boolean) => void;
  loading?: boolean;
  debounceMs?: number;
  showSuggestions?: boolean;
  showFilters?: boolean;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  value: controlledValue = '',
  onSearch,
  onClear,
  suggestions = [],
  filters = [],
  onFilterChange,
  loading = false,
  debounceMs = 300,
  showSuggestions = true,
  showFilters = true,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  const debouncedQuery = useDebounce(internalValue, debounceMs);

  // Update internal value when controlled value changes
  useEffect(() => {
    setInternalValue(controlledValue);
  }, [controlledValue]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== controlledValue) {
      const activeFilters = filters.filter(f => f.active).map(f => f.id);
      onSearch(debouncedQuery, activeFilters);
    }
  }, [debouncedQuery, filters, onSearch, controlledValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    setSelectedSuggestionIndex(-1);
    
    if (showSuggestions && suggestions.length > 0) {
      setShowSuggestionsList(newValue.length > 0);
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestionsList || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const suggestion = suggestions[selectedSuggestionIndex];
          setInternalValue(suggestion.label);
          setShowSuggestionsList(false);
          const activeFilters = filters.filter(f => f.active).map(f => f.id);
          onSearch(suggestion.label, activeFilters);
        } else {
          const activeFilters = filters.filter(f => f.active).map(f => f.id);
          onSearch(internalValue, activeFilters);
        }
        break;
      case 'Escape':
        setShowSuggestionsList(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestionsList, suggestions, selectedSuggestionIndex, internalValue, onSearch, filters]);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setInternalValue(suggestion.label);
    setShowSuggestionsList(false);
    const activeFilters = filters.filter(f => f.active).map(f => f.id);
    onSearch(suggestion.label, activeFilters);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setInternalValue('');
    setShowSuggestionsList(false);
    setSelectedSuggestionIndex(-1);
    onClear?.();
    const activeFilters = filters.filter(f => f.active).map(f => f.id);
    onSearch('', activeFilters);
    inputRef.current?.focus();
  };

  const handleFilterToggle = (filterId: string) => {
    const filter = filters.find(f => f.id === filterId);
    if (filter && onFilterChange) {
      onFilterChange(filterId, !filter.active);
    }
  };

  const activeFilterCount = filters.filter(f => f.active).length;

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={internalValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (showSuggestions && suggestions.length > 0 && internalValue.length > 0) {
              setShowSuggestionsList(true);
            }
          }}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking on them
            setTimeout(() => setShowSuggestionsList(false), 150);
          }}
          className="pl-10 pr-20"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {showFilters && filters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* Toggle filter panel */}}
              className={cn(
                "h-6 w-6 p-0",
                activeFilterCount > 0 && "text-primary"
              )}
            >
              <Filter className="h-3 w-3" />
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}
          
          {internalValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {showFilters && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {filters
            .filter(f => f.active)
            .map(filter => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="text-xs cursor-pointer"
                onClick={() => handleFilterToggle(filter.id)}
              >
                {filter.label}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
        </div>
      )}

      {/* Search Suggestions */}
      {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-md max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={cn(
                "px-3 py-2 cursor-pointer hover:bg-muted flex items-center justify-between",
                index === selectedSuggestionIndex && "bg-muted"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center gap-2">
                <Search className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{suggestion.label}</span>
                {suggestion.category && (
                  <Badge variant="outline" className="text-xs">
                    {suggestion.category}
                  </Badge>
                )}
              </div>
              {suggestion.count !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {suggestion.count}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Available Filters */}
      {showFilters && filters.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {filters.map(filter => (
              <Badge
                key={filter.id}
                variant={filter.active ? "default" : "outline"}
                className="text-xs cursor-pointer"
                onClick={() => handleFilterToggle(filter.id)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

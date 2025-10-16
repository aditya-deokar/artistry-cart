'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { LoaderCircle, Search, X } from 'lucide-react';
import { LiveSearchResults } from './LiveSearchResults';

export const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300); // 300ms delay
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['liveSearch', debouncedQuery],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/api/search/live?q=${encodeURIComponent(debouncedQuery)}`);
      console.log('Live Search API Response:', res.data);
      
      // Handle different response structures
      if (res.data.data) {
        return res.data.data;
      }
      return res.data;
    },
    enabled: debouncedQuery.length > 1, // Only search if query is > 1 character
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false); // Close dropdown on navigation
      setQuery(''); // Clear search after navigation
    }
  };

  // Clear search input
  const handleClear = useCallback(() => {
    setQuery('');
    setIsFocused(false);
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFocused(false);
        setQuery('');
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for art, artists, shops..."
          className="w-full pl-10 pr-10 py-2.5 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
        />
        {isLoading && (
          <LoaderCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={20} />
        )}
        {query && !isLoading && (
          <button 
            type="button" 
            onClick={handleClear} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </form>

      {isFocused && debouncedQuery.length > 1 && (
        <div className="absolute top-full mt-2 w-full z-[100]">
          <LiveSearchResults 
            results={data} 
            isLoading={isLoading} 
            query={debouncedQuery}
            onResultClick={() => setIsFocused(false)}
          />
        </div>
      )}
    </div>
  );
};
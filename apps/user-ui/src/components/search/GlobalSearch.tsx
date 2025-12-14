'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, X } from 'lucide-react';
import { LiveSearchResults } from './LiveSearchResults';
import { SearchSuggestions, Suggestion } from './SearchSuggestions';
import Fuse from 'fuse.js';
import { useLenis } from 'lenis/react';
import { AnimatePresence, motion } from 'framer-motion';

// Constants
const RECENT_SEARCHES_KEY = 'artistry-cart-recent-searches';
const MAX_RECENT_SEARCHES = 5;

// Helper functions for localStorage
const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (search: string): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const searches = getRecentSearches();
    const filtered = searches.filter(s => s.toLowerCase() !== search.toLowerCase());
    const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

const removeRecentSearch = (search: string): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const searches = getRecentSearches();
    const updated = searches.filter(s => s !== search);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

const clearAllRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    return [];
  } catch {
    return [];
  }
};

export const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const lenis = useLenis();
  const [mounted, setMounted] = useState(false);

  // Load recent searches on mount
  useEffect(() => {
    setMounted(true);
    setRecentSearches(getRecentSearches());
  }, []);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  // Search index for fuzzy fallback
  const { data: searchIndex } = useQuery({
    queryKey: ['searchIndex'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/product/api/products?limit=100');
        return res.data.data.products || [];
      } catch (e) {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5
  });

  const fuse = React.useMemo(() => {
    if (!searchIndex) return null;
    return new Fuse(searchIndex, {
      keys: ['title', 'Shop.name'],
      threshold: 0.3,
      location: 0,
      distance: 100,
    });
  }, [searchIndex]);

  // Fetch suggestions (for typeahead)
  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['searchSuggestions', debouncedQuery],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/product/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`
      );
      return res.data.data;
    },
    enabled: isOpen, // Always fetch when modal is open (for popular searches)
  });

  // Fetch live results (for product cards)
  const { data: apiData, isLoading: resultsLoading } = useQuery({
    queryKey: ['liveSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return null;
      try {
        const res = await axiosInstance.get(
          `/product/api/search/live?q=${encodeURIComponent(debouncedQuery)}`
        );
        return res.data.data || res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: debouncedQuery.length > 1,
  });

  // Combined display results with Fuse.js fallback
  const displayResults = React.useMemo(() => {
    let products = apiData?.products || [];
    let shops = apiData?.shops || [];

    if (fuse && debouncedQuery.length > 1) {
      const fuseResults = fuse.search(debouncedQuery).map(result => result.item);
      const existingIds = new Set(products.map((p: any) => p.id));
      const newItems = fuseResults.filter((p: any) => !existingIds.has(p.id));
      products = [...products, ...newItems.slice(0, 5)];
    }

    return { products, shops };
  }, [apiData, fuse, debouncedQuery]);

  // Determine total items for keyboard navigation
  const totalSuggestions = suggestionsData?.suggestions?.length || 0;
  const totalPopular = suggestionsData?.popular?.length || 0;
  const totalItems = query.length === 0 ? totalPopular : totalSuggestions;

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();

      if (selectedIndex >= 0) {
        // Navigate to selected suggestion
        const items = query.length === 0
          ? suggestionsData?.popular || []
          : suggestionsData?.suggestions || [];

        if (items[selectedIndex]) {
          handleSuggestionClick(items[selectedIndex]);
          return;
        }
      }

      // Submit search
      if (query.trim()) {
        handleSubmit(e as any);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [selectedIndex, totalItems, query, suggestionsData]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setRecentSearches(saveRecentSearch(query.trim()));
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setRecentSearches(saveRecentSearch(suggestion.value));
    setIsOpen(false);
    setQuery('');
  };

  // Handle recent search click
  const handleRecentClick = (search: string) => {
    setQuery(search);
    // Optionally auto-submit
    setRecentSearches(saveRecentSearch(search));
    router.push(`/search?q=${encodeURIComponent(search)}`);
    setIsOpen(false);
    setQuery('');
  };

  // Handle remove recent search
  const handleRemoveRecent = (search: string) => {
    setRecentSearches(removeRecentSearch(search));
  };

  // Handle clear all recent searches
  const handleClearAllRecent = () => {
    setRecentSearches(clearAllRecentSearches());
  };

  // Handle escape key and auto-focus
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent scrolling when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [isOpen, lenis]);

  // Show suggestions when query is short, live results when longer
  const showSuggestions = query.length <= 2 || (debouncedQuery.length <= 2 && !displayResults.products?.length);
  const showLiveResults = query.length > 2 && (resultsLoading || displayResults.products?.length > 0 || displayResults.shops?.length > 0);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <Search size={22} className="group-hover:scale-110 transition-transform" />
        <span className="hidden md:block text-sm font-medium">Search</span>
      </button>

      {mounted && createPortal(
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] bg-background flex flex-col items-center pt-[10vh] px-4 md:px-8"
            >
              <div className="w-full max-w-3xl relative">
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute -top-[6vh] right-0 p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close search"
                >
                  <X size={32} />
                </button>

                {/* Main Search Input */}
                <form onSubmit={handleSubmit} className="w-full mb-8 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for art, collections, shops..."
                    className="w-full bg-transparent border-b-2 border-border focus:border-primary text-3xl md:text-5xl lg:text-6xl font-light py-4 outline-none placeholder:text-muted-foreground/30 transition-all text-center md:text-left"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Submit search"
                  >
                    <Search size={32} />
                  </button>
                </form>

                {/* Keyboard navigation hint */}
                {query.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-4 mb-4 text-xs text-muted-foreground"
                  >
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↓</kbd>
                      <span>navigate</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd>
                      <span>select</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>
                      <span>close</span>
                    </span>
                  </motion.div>
                )}

                {/* Results Container */}
                <div className="w-full max-h-[60vh] overflow-y-auto px-2 custom-scrollbar">
                  {/* Typeahead Suggestions */}
                  {showSuggestions && (
                    <SearchSuggestions
                      suggestions={suggestionsData?.suggestions || []}
                      popular={suggestionsData?.popular || []}
                      recentSearches={recentSearches}
                      query={query}
                      selectedIndex={selectedIndex}
                      isLoading={suggestionsLoading && query.length > 0}
                      onSuggestionClick={handleSuggestionClick}
                      onRecentClick={handleRecentClick}
                      onRemoveRecent={handleRemoveRecent}
                      onClearAllRecent={handleClearAllRecent}
                    />
                  )}

                  {/* Live Search Results */}
                  {showLiveResults && (
                    <LiveSearchResults
                      results={displayResults}
                      isLoading={resultsLoading}
                      query={debouncedQuery}
                      onResultClick={() => setIsOpen(false)}
                      variant="minimal"
                    />
                  )}

                  {/* Initial State - when no query and no suggestions yet */}
                  {query.length === 0 && !suggestionsData && !suggestionsLoading && recentSearches.length === 0 && (
                    <div className="text-center text-muted-foreground/50 mt-12">
                      <p className="text-lg">Start typing to search...</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

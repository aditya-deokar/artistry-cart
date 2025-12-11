'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, X } from 'lucide-react';
import { LiveSearchResults } from './LiveSearchResults';
import Fuse from 'fuse.js';
import { useLenis } from 'lenis/react';


import { AnimatePresence, motion } from 'framer-motion';

export const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300); // 300ms delay
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);


  // ... (in GlobalSearch component)

  // NOTE: Since the real fuzzy search should happen on the server/API for global data, 
  // using Fuse.js on the client side is typically for filtering locally available lists. 
  // However, to fulfill the request of "add fuzzy search into it" in the context of the search bar,
  // we can either mock it or process 'results' if we had a large list.
  // 
  // Assuming the user wants 'fuzzy' behavior even if the API is strict, 
  // OR the user implies the API should be fuzzy.
  //
  // Since I cannot change the API implementation easily without seeing the backend code for search,
  // I will implement client-side fuzzy filtering on the *results returned from the API* 
  // if they were a larger set, OR more likely, mis-interpreted the request. 
  // 
  // BUT, usually "add fuzzy search" means the search itself should be fuzzy.
  // If the API returns a broad set, we can refine it with Fuse.
  // 
  // Let's modify the useQuery to use Fuse if we were searching a local static list.
  // BUT here we are calling an API. 
  //
  // Strategy: Since I can't touch the backend easily in this step (it's in a different service I might not have full access to modify cleanly in one go),
  // I will assume the user might want to search through a pre-fetched list or wants the UI to handle typos better.
  //
  // However, the best place for fuzzy search in a real app is the backend (Postgres ILIKE or vector search).
  //
  // For now, I will add Fuse.js to *re-rank* or *filter* the results IF we were doing local search.
  // Since `GlobalSearch.tsx` calls `/product/api/search/live`, that's server side.
  //
  // IF the user effectively wants client-side search for demo purposes or small datasets:
  // I will create a Fuse instance that *could* search a cached list of products.
  //
  // Let's stick to the most robust interpretation:
  // The user likely wants to see fuzzy matches. 
  // I'll update the component to fetch a "search index" (all products light version) and search THAT with Fuse.js
  // This makes the search super fast and fuzzy.

  const { data: searchIndex } = useQuery({
    queryKey: ['searchIndex'],
    queryFn: async () => {
      // Fetch a lightweight list of all products for client-side fuzzy search
      // This is a common pattern for "instant" search
      try {
        const res = await axiosInstance.get('/product/api/products?limit=100'); // limit 100 for demo
        return res.data.data.products || [];
      } catch (e) {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5 // 5 mins
  });

  const fuse = React.useMemo(() => {
    if (!searchIndex) return null;
    return new Fuse(searchIndex, {
      keys: ['title', 'Shop.name'],
      threshold: 0.3, // Fuzzy threshold
      location: 0,
      distance: 100,
    });
  }, [searchIndex]);

  // Combined Results: API + Fuzzy Local
  // We will prefer API results, but if empty, fall back to Fuzzy Local
  // OR merge them.

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['liveSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return null;
      try {
        const res = await axiosInstance.get(`/product/api/search/live?q=${encodeURIComponent(debouncedQuery)}`);
        return res.data.data || res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: debouncedQuery.length > 1,
  });

  // Derived state for display
  const displayResults = React.useMemo(() => {
    // 1. Start with API results
    let products = apiData?.products || [];
    let shops = apiData?.shops || [];

    // 2. If API returns few results, augment with Fuse.js
    if (fuse && debouncedQuery.length > 1) {
      const fuseResults = fuse.search(debouncedQuery).map(result => result.item);

      // Deduplicate based on ID
      const existingIds = new Set(products.map((p: any) => p.id));
      const newItems = fuseResults.filter((p: any) => !existingIds.has(p.id));

      // Add top 5 fuzzy matches if not already present
      products = [...products, ...newItems.slice(0, 5)];
    }

    return { products, shops };
  }, [apiData, fuse, debouncedQuery]);


  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false); // Close dropdown on navigation
      setQuery(''); // Clear search after navigation
    }
  };

  // Handle escape key to close and auto-focus
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    // Auto-focus input when opened
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent scrolling when overlay is open
  const lenis = useLenis();
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
    }
  }, [isOpen, lenis]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
              className="fixed inset-0 z-[9999] bg-background flex flex-col items-center pt-[15vh] px-4 md:px-8"
            >
              <div className="w-full max-w-3xl relative">
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute -top-[10vh] right-0 p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close search"
                >
                  <X size={32} />
                </button>

                {/* Main Search Input */}
                <form onSubmit={handleSubmit} className="w-full mb-12 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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

                {/* Results Container */}
                <div className="w-full h-[60vh] overflow-y-auto px-2 custom-scrollbar">
                  {query.length > 1 && (isLoading || displayResults) ? (
                    <LiveSearchResults
                      results={displayResults}
                      isLoading={isLoading}
                      query={debouncedQuery}
                      onResultClick={() => setIsOpen(false)}
                      variant="minimal"
                    />
                  ) : (
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
'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Register GSAP with React
gsap.registerPlugin(useGSAP);
import {
    Search,
    X,
    ArrowRight,
    Clock,
    TrendingUp,
    Sparkles,
    Store,
    Tag,
} from 'lucide-react';
import Fuse from 'fuse.js';

import axiosInstance from '@/utils/axiosinstance';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPrice } from '@/lib/formatters';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

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

// Quick Categories
const QUICK_CATEGORIES = [
    { label: 'Art & Prints', href: '/product?category=art', icon: Sparkles },
    { label: 'Jewelry', href: '/product?category=jewelry', icon: Tag },
    { label: 'Home & Living', href: '/product?category=home', icon: Store },
];

// Product Result Card
function ProductResultCard({
    product,
    onClick,
}: {
    product: any;
    onClick: () => void;
}) {
    const primaryImage = product.images?.find((img: any) => img !== null);
    const price = product.pricing?.finalPrice || product.sale_price || product.regular_price;
    const originalPrice = product.regular_price;
    const hasDiscount = price !== originalPrice;

    return (
        <Link
            href={`/product/${product.slug}`}
            onClick={onClick}
            className="group flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--ac-cream)] dark:hover:bg-[var(--ac-onyx)] transition-colors duration-200"
        >
            {/* Image */}
            <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] rounded-lg">
                {primaryImage ? (
                    <Image
                        src={primaryImage.url}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="64px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Tag className="w-5 h-5 text-[var(--ac-stone)]" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] truncate group-hover:text-[var(--ac-gold)] transition-colors duration-200">
                    {product.title}
                </p>
                {product.Shop?.name && (
                    <p className="text-xs text-[var(--ac-stone)] mt-0.5">by {product.Shop.name}</p>
                )}
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                        {formatPrice(price)}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-[var(--ac-stone)] line-through">
                            {formatPrice(originalPrice)}
                        </span>
                    )}
                </div>
            </div>

            <ArrowRight className="w-4 h-4 text-[var(--ac-stone)] group-hover:text-[var(--ac-gold)] transition-all duration-200 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
        </Link>
    );
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [mounted, setMounted] = useState(false);

    const debouncedQuery = useDebounce(query, 300);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Load recent searches on mount
    useEffect(() => {
        setMounted(true);
        setRecentSearches(getRecentSearches());
    }, []);

    // Auto-focus input when overlay opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setQuery('');
            setSelectedIndex(-1);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // GSAP animations with useGSAP hook
    useGSAP(() => {
        if (!isOpen) return;

        const elements = overlayRef.current?.querySelectorAll('.search-animate');
        if (elements && elements.length > 0) {
            gsap.fromTo(
                elements,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: 'power3.out',
                    delay: 0.1, // Small delay to ensure render
                }
            );
        }
    }, {
        dependencies: [isOpen],
        scope: overlayRef
    });

    // Fetch search index for fuzzy search
    const { data: searchIndex } = useQuery({
        queryKey: ['searchIndex'],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get('/product/api/products?limit=100');
                return res.data.data.products || [];
            } catch {
                return [];
            }
        },
        staleTime: 1000 * 60 * 5,
    });

    const fuse = useMemo(() => {
        if (!searchIndex) return null;
        return new Fuse(searchIndex, {
            keys: ['title', 'Shop.name', 'category'],
            threshold: 0.3,
            location: 0,
            distance: 100,
        });
    }, [searchIndex]);

    // Fetch suggestions
    const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
        queryKey: ['searchSuggestions', debouncedQuery],
        queryFn: async () => {
            const res = await axiosInstance.get(
                `/product/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`
            );
            return res.data.data;
        },
        enabled: isOpen && debouncedQuery.length > 0,
    });

    // Fetch live results
    const { data: liveResults, isLoading: resultsLoading } = useQuery({
        queryKey: ['liveSearch', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return null;
            try {
                const res = await axiosInstance.get(
                    `/product/api/search/live?q=${encodeURIComponent(debouncedQuery)}`
                );
                return res.data.data || res.data;
            } catch {
                return null;
            }
        },
        enabled: debouncedQuery.length > 1,
    });

    // Combined results with Fuse.js fallback
    const displayResults = useMemo(() => {
        let products = liveResults?.products || [];
        const shops = liveResults?.shops || [];

        if (fuse && debouncedQuery.length > 1) {
            const fuseResults = fuse.search(debouncedQuery).map((result) => result.item);
            const existingIds = new Set(products.map((p: any) => p.id));
            const newItems = fuseResults.filter((p: any) => !existingIds.has(p.id));
            products = [...products, ...newItems.slice(0, 6)];
        }

        return { products: products.slice(0, 6), shops };
    }, [liveResults, fuse, debouncedQuery]);

    // Handle submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setRecentSearches(saveRecentSearch(query.trim()));
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            onClose();
        }
    };

    // Handle recent search click
    const handleRecentClick = (search: string) => {
        setRecentSearches(saveRecentSearch(search));
        router.push(`/search?q=${encodeURIComponent(search)}`);
        onClose();
    };

    // Handle remove recent
    const handleRemoveRecent = (search: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setRecentSearches(removeRecentSearch(search));
    };

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const totalResults = displayResults.products.length;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < totalResults - 1 ? prev + 1 : 0));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalResults - 1));
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const product = displayResults.products[selectedIndex];
                if (product) {
                    router.push(`/product/${product.slug}`);
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        },
        [displayResults.products, selectedIndex, router, onClose]
    );

    const showResults = debouncedQuery.length > 1 && displayResults.products.length > 0;
    const showLoading = debouncedQuery.length > 1 && resultsLoading;
    const showInitialState = query.length === 0;

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={overlayRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] bg-[var(--ac-ivory)]/95 dark:bg-[var(--ac-obsidian)]/95 backdrop-blur-xl flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 lg:px-12 py-6 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-3"
                        >
                            <Search className="w-5 h-5 text-[var(--ac-gold)]" />
                            <span className="font-[family-name:var(--font-playfair)] text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                Search
                            </span>
                        </motion.div>
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--ac-gold)]/10 rounded-full transition-colors duration-200"
                            aria-label="Close search"
                        >
                            <X className="w-6 h-6" />
                        </motion.button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
                            {/* Search Input */}
                            <motion.form
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.4 }}
                                onSubmit={handleSubmit}
                                className="relative mb-10"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="What are you looking for?"
                                    className="w-full bg-transparent border-b-2 border-[var(--ac-linen)] dark:border-[var(--ac-slate)] focus:border-[var(--ac-gold)] text-3xl md:text-4xl lg:text-5xl font-[family-name:var(--font-playfair)] py-4 outline-none placeholder:text-[var(--ac-stone)]/40 transition-colors duration-300 text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-[var(--ac-stone)] hover:text-[var(--ac-gold)] transition-colors duration-200"
                                    aria-label="Submit search"
                                >
                                    <ArrowRight className="w-8 h-8" />
                                </button>
                            </motion.form>

                            {/* Initial State */}
                            {showInitialState && (
                                <div className="space-y-10">
                                    {/* Recent Searches */}
                                    {recentSearches.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="search-animate"
                                        >
                                            <div className="flex items-center gap-2 mb-4">
                                                <Clock className="w-4 h-4 text-[var(--ac-stone)]" />
                                                <h3 className="text-xs font-medium tracking-wider uppercase text-[var(--ac-stone)]">
                                                    Recent Searches
                                                </h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map((search) => (
                                                    <button
                                                        key={search}
                                                        onClick={() => handleRecentClick(search)}
                                                        className="group flex items-center gap-2 px-4 py-2 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] rounded-full text-sm text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:bg-[var(--ac-gold)] hover:text-white transition-colors duration-200"
                                                    >
                                                        <span>{search}</span>
                                                        <X
                                                            className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={(e) => handleRemoveRecent(search, e)}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Quick Categories */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="search-animate"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="w-4 h-4 text-[var(--ac-stone)]" />
                                            <h3 className="text-xs font-medium tracking-wider uppercase text-[var(--ac-stone)]">
                                                Popular Categories
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {QUICK_CATEGORIES.map((category) => (
                                                <Link
                                                    key={category.label}
                                                    href={category.href}
                                                    onClick={onClose}
                                                    className="group flex items-center gap-3 p-4 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] rounded-lg hover:bg-[var(--ac-gold)] hover:text-white transition-colors duration-200"
                                                >
                                                    <category.icon className="w-5 h-5 text-[var(--ac-gold)] group-hover:text-white transition-colors" />
                                                    <span className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] group-hover:text-white transition-colors">
                                                        {category.label}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Hint */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex items-center justify-center gap-6 text-xs text-[var(--ac-stone)] pt-8"
                                    >
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-2 py-1 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] rounded text-[10px]">↑↓</kbd>
                                            <span>navigate</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-2 py-1 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] rounded text-[10px]">Enter</kbd>
                                            <span>select</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-2 py-1 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] rounded text-[10px]">Esc</kbd>
                                            <span>close</span>
                                        </span>
                                    </motion.div>
                                </div>
                            )}

                            {/* Loading State */}
                            {showLoading && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                        className="w-8 h-8 border-2 border-[var(--ac-gold)] border-t-transparent rounded-full"
                                    />
                                    <p className="mt-4 text-sm text-[var(--ac-stone)]">Searching artisan creations...</p>
                                </div>
                            )}

                            {/* Search Results */}
                            {showResults && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-xs font-medium tracking-wider uppercase text-[var(--ac-stone)]">
                                            Products ({displayResults.products.length})
                                        </p>
                                        <Link
                                            href={`/search?q=${encodeURIComponent(query)}`}
                                            onClick={onClose}
                                            className="text-xs font-medium text-[var(--ac-gold)] hover:underline flex items-center gap-1"
                                        >
                                            View all results <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                    <div className="space-y-1">
                                        {displayResults.products.map((product: any, index: number) => (
                                            <motion.div
                                                key={product.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`${selectedIndex === index
                                                    ? 'ring-2 ring-[var(--ac-gold)] ring-offset-2 ring-offset-[var(--ac-ivory)] dark:ring-offset-[var(--ac-obsidian)] rounded-lg'
                                                    : ''
                                                    }`}
                                            >
                                                <ProductResultCard product={product} onClick={onClose} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* No Results */}
                            {debouncedQuery.length > 1 && !resultsLoading && displayResults.products.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    <Search className="w-12 h-12 text-[var(--ac-stone)]/30 mx-auto mb-4" />
                                    <p className="text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                                        No results found for "{query}"
                                    </p>
                                    <p className="text-sm text-[var(--ac-stone)]">
                                        Try different keywords or browse our categories
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

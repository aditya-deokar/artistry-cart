'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Tag,
    Store,
    TrendingUp,
    Clock,
    X,
    Search,
    ArrowRight
} from 'lucide-react';

// Types for suggestions
export interface Suggestion {
    type: 'product' | 'category' | 'shop' | 'popular';
    value: string;
    slug?: string;
    category?: string;
    image?: string | null;
    avatar?: string | null;
    count?: number;
}

export interface SearchSuggestionsProps {
    suggestions: Suggestion[];
    popular?: Suggestion[];
    recentSearches: string[];
    query: string;
    selectedIndex: number;
    isLoading?: boolean;
    onSuggestionClick: (suggestion: Suggestion) => void;
    onRecentClick: (search: string) => void;
    onRemoveRecent: (search: string) => void;
    onClearAllRecent: () => void;
}

// Highlight matching text in suggestion
const HighlightedText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
    if (!query) return <>{text}</>;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return (
        <>
            {parts.map((part, i) => (
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="text-primary font-semibold">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            ))}
        </>
    );
};

// Icon component based on suggestion type
const SuggestionIcon: React.FC<{ type: Suggestion['type']; className?: string }> = ({ type, className = '' }) => {
    const iconProps = { size: 16, className: `flex-shrink-0 ${className}` };

    switch (type) {
        case 'product':
        case 'popular':
            return <Package {...iconProps} />;
        case 'category':
            return <Tag {...iconProps} />;
        case 'shop':
            return <Store {...iconProps} />;
        default:
            return <Search {...iconProps} />;
    }
};

// Get link for suggestion
const getSuggestionLink = (suggestion: Suggestion): string => {
    switch (suggestion.type) {
        case 'product':
        case 'popular':
            return suggestion.slug ? `/product/${suggestion.slug}` : `/search?q=${encodeURIComponent(suggestion.value)}`;
        case 'category':
            return `/search?q=${encodeURIComponent(suggestion.value)}&category=${encodeURIComponent(suggestion.value)}`;
        case 'shop':
            return suggestion.slug ? `/shops/${suggestion.slug}` : `/search?q=${encodeURIComponent(suggestion.value)}`;
        default:
            return `/search?q=${encodeURIComponent(suggestion.value)}`;
    }
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
    suggestions,
    popular = [],
    recentSearches,
    query,
    selectedIndex,
    isLoading,
    onSuggestionClick,
    onRecentClick,
    onRemoveRecent,
    onClearAllRecent,
}) => {
    // Show recent + popular when no query
    const showRecentsAndPopular = query.length === 0;

    // Group suggestions by type
    const productSuggestions = suggestions.filter(s => s.type === 'product');
    const categorySuggestions = suggestions.filter(s => s.type === 'category');
    const shopSuggestions = suggestions.filter(s => s.type === 'shop');

    // Calculate flat index for keyboard navigation
    let currentIndex = 0;
    const getItemIndex = () => currentIndex++;

    if (isLoading) {
        return (
            <div className="py-8 text-center">
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm">Finding suggestions...</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full space-y-6"
        >
            {/* Recent Searches - Only show when no query */}
            <AnimatePresence>
                {showRecentsAndPopular && recentSearches.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock size={14} />
                                <span className="text-xs uppercase tracking-wider font-medium">Recent Searches</span>
                            </div>
                            <button
                                onClick={onClearAllRecent}
                                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((search, idx) => (
                                <motion.button
                                    key={search}
                                    variants={itemVariants}
                                    onClick={() => onRecentClick(search)}
                                    className="group flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted dark:bg-muted/30 dark:hover:bg-muted/60 rounded-full text-sm text-foreground transition-colors border border-transparent hover:border-border/50"
                                >
                                    <span>{search}</span>
                                    <X
                                        size={14}
                                        className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveRecent(search);
                                        }}
                                    />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Popular Searches - Only show when no query */}
            <AnimatePresence>
                {showRecentsAndPopular && popular.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2 text-muted-foreground px-1">
                            <TrendingUp size={14} />
                            <span className="text-xs uppercase tracking-wider font-medium">Trending Now</span>
                        </div>
                        <div className="space-y-1">
                            {popular.map((item, idx) => {
                                const itemIndex = getItemIndex();
                                const isSelected = selectedIndex === itemIndex;

                                return (
                                    <motion.div key={`popular-${item.value}-${idx}`} variants={itemVariants}>
                                        <Link
                                            href={getSuggestionLink(item)}
                                            onClick={() => onSuggestionClick(item)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isSelected
                                                ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                                                : 'hover:bg-muted/50 dark:hover:bg-muted/30'
                                                }`}
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                                                <SuggestionIcon type={item.type} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{item.value}</p>
                                                {item.category && (
                                                    <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                                                )}
                                            </div>
                                            <ArrowRight
                                                size={16}
                                                className={`flex-shrink-0 transition-transform ${isSelected ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'
                                                    }`}
                                            />
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Search Suggestions */}
            {query.length > 0 && suggestions.length > 0 && (
                <div className="space-y-4">
                    {/* Product Suggestions */}
                    {productSuggestions.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground px-1">
                                <Package size={14} />
                                <span className="text-xs uppercase tracking-wider font-medium">Products</span>
                            </div>
                            <div className="space-y-1">
                                {productSuggestions.map((suggestion, idx) => {
                                    const itemIndex = getItemIndex();
                                    const isSelected = selectedIndex === itemIndex;

                                    return (
                                        <motion.div key={`product-${suggestion.slug || idx}`} variants={itemVariants}>
                                            <Link
                                                href={getSuggestionLink(suggestion)}
                                                onClick={() => onSuggestionClick(suggestion)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isSelected
                                                    ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                                                    : 'hover:bg-muted/50 dark:hover:bg-muted/30'
                                                    }`}
                                            >
                                                {/* Product Image */}
                                                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted dark:bg-muted/50 overflow-hidden border border-border/30">
                                                    {suggestion.image ? (
                                                        <Image
                                                            src={suggestion.image}
                                                            alt={suggestion.value}
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                            <Package size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">
                                                        <HighlightedText text={suggestion.value} query={query} />
                                                    </p>
                                                    {suggestion.category && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            in {suggestion.category}
                                                        </p>
                                                    )}
                                                </div>
                                                <ArrowRight
                                                    size={16}
                                                    className={`flex-shrink-0 transition-transform ${isSelected ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'
                                                        }`}
                                                />
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Category Suggestions */}
                    {categorySuggestions.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground px-1">
                                <Tag size={14} />
                                <span className="text-xs uppercase tracking-wider font-medium">Categories</span>
                            </div>
                            <div className="space-y-1">
                                {categorySuggestions.map((suggestion, idx) => {
                                    const itemIndex = getItemIndex();
                                    const isSelected = selectedIndex === itemIndex;

                                    return (
                                        <motion.div key={`category-${suggestion.value}-${idx}`} variants={itemVariants}>
                                            <Link
                                                href={getSuggestionLink(suggestion)}
                                                onClick={() => onSuggestionClick(suggestion)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isSelected
                                                    ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                    : 'hover:bg-muted/50 dark:hover:bg-muted/30'
                                                    }`}
                                            >
                                                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                    <Tag size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">
                                                        <HighlightedText text={suggestion.value} query={query} />
                                                    </p>
                                                    {suggestion.count && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {suggestion.count} products
                                                        </p>
                                                    )}
                                                </div>
                                                <ArrowRight
                                                    size={16}
                                                    className={`flex-shrink-0 transition-transform ${isSelected ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'
                                                        }`}
                                                />
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Shop Suggestions */}
                    {shopSuggestions.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground px-1">
                                <Store size={14} />
                                <span className="text-xs uppercase tracking-wider font-medium">Shops</span>
                            </div>
                            <div className="space-y-1">
                                {shopSuggestions.map((suggestion, idx) => {
                                    const itemIndex = getItemIndex();
                                    const isSelected = selectedIndex === itemIndex;

                                    return (
                                        <motion.div key={`shop-${suggestion.slug || idx}`} variants={itemVariants}>
                                            <Link
                                                href={getSuggestionLink(suggestion)}
                                                onClick={() => onSuggestionClick(suggestion)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isSelected
                                                    ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                                                    : 'hover:bg-muted/50 dark:hover:bg-muted/30'
                                                    }`}
                                            >
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted dark:bg-muted/50 overflow-hidden border border-border/30">
                                                    {suggestion.avatar ? (
                                                        <Image
                                                            src={suggestion.avatar}
                                                            alt={suggestion.value}
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                            <Store size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">
                                                        <HighlightedText text={suggestion.value} query={query} />
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Shop</p>
                                                </div>
                                                <ArrowRight
                                                    size={16}
                                                    className={`flex-shrink-0 transition-transform ${isSelected ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'
                                                        }`}
                                                />
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* No Results State */}
            {query.length > 0 && suggestions.length === 0 && !isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8 text-center"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 dark:bg-muted/30 flex items-center justify-center">
                        <Search size={24} className="text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground">
                        No suggestions for "<span className="text-foreground font-medium">{query}</span>"
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                        Press Enter to search anyway
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default SearchSuggestions;

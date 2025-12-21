'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Tag, MapPin, X, Loader2 } from 'lucide-react';
import { useArtisanSearchSuggestions } from '@/hooks/useArtisans';

interface ArtisanSearchProps {
    className?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    autoFocus?: boolean;
    variant?: 'default' | 'hero';
}

export function ArtisanSearch({
    className = '',
    placeholder = 'Search artisans, crafts, or locations...',
    onSearch,
    autoFocus = false,
    variant = 'default',
}: ArtisanSearchProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const { data: suggestions = [], isLoading } = useArtisanSearchSuggestions(query);

    const showDropdown = isFocused && query.length >= 2 && (suggestions.length > 0 || isLoading);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!showDropdown) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < suggestions.length - 1 ? prev + 1 : prev
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                        handleSelect(suggestions[selectedIndex]);
                    } else if (query) {
                        handleSearchSubmit();
                    }
                    break;
                case 'Escape':
                    setIsFocused(false);
                    inputRef.current?.blur();
                    break;
            }
        },
        [showDropdown, suggestions, selectedIndex, query]
    );

    const handleSelect = useCallback(
        (suggestion: (typeof suggestions)[0]) => {
            setIsFocused(false);
            setQuery('');

            switch (suggestion.type) {
                case 'artisan':
                    router.push(`/artisans/${suggestion.value}`);
                    break;
                case 'craft':
                    router.push(`/artisans?category=${suggestion.value}`);
                    break;
                case 'location':
                    router.push(`/artisans?search=${encodeURIComponent(suggestion.value)}`);
                    break;
            }
        },
        [router]
    );

    const handleSearchSubmit = useCallback(() => {
        if (!query.trim()) return;

        setIsFocused(false);
        if (onSearch) {
            onSearch(query);
        } else {
            router.push(`/artisans?search=${encodeURIComponent(query)}`);
        }
    }, [query, onSearch, router]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'artisan':
                return <User className="w-4 h-4" />;
            case 'craft':
                return <Tag className="w-4 h-4" />;
            case 'location':
                return <MapPin className="w-4 h-4" />;
            default:
                return <Search className="w-4 h-4" />;
        }
    };

    const isHero = variant === 'hero';

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div
                className={`relative flex items-center ${isHero
                        ? 'bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]'
                        : 'bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]'
                    } border ${isFocused
                        ? 'border-[var(--ac-gold)]'
                        : 'border-[var(--ac-linen)] dark:border-[var(--ac-slate)]'
                    } transition-colors`}
            >
                <Search
                    className={`absolute left-4 w-5 h-5 ${isFocused
                            ? 'text-[var(--ac-gold)]'
                            : 'text-[var(--ac-stone)]'
                        } transition-colors`}
                />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className={`w-full pl-12 pr-12 ${isHero ? 'py-4 text-base' : 'py-3 text-sm'
                        } bg-transparent text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none`}
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            inputRef.current?.focus();
                        }}
                        className="absolute right-14 p-1 text-[var(--ac-stone)] hover:text-[var(--ac-graphite)] dark:hover:text-[var(--ac-silver)] transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={handleSearchSubmit}
                    disabled={!query.trim()}
                    className={`absolute right-0 h-full px-6 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-ivory)] dark:text-[var(--ac-obsidian)] text-xs tracking-wider uppercase font-medium hover:bg-[var(--ac-graphite)] dark:hover:bg-[var(--ac-silver)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                    Search
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] shadow-lg z-50 max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 text-[var(--ac-gold)] animate-spin" />
                        </div>
                    ) : (
                        <>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={`${suggestion.type}-${suggestion.value}`}
                                    onClick={() => handleSelect(suggestion)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${index === selectedIndex
                                            ? 'bg-[var(--ac-gold)]/10'
                                            : 'hover:bg-[var(--ac-linen)] dark:hover:bg-[var(--ac-slate)]'
                                        }`}
                                >
                                    <span
                                        className={`flex-shrink-0 ${index === selectedIndex
                                                ? 'text-[var(--ac-gold)]'
                                                : 'text-[var(--ac-stone)]'
                                            }`}
                                    >
                                        {getIcon(suggestion.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] truncate">
                                            {suggestion.label}
                                        </p>
                                        <p className="text-xs text-[var(--ac-stone)] capitalize">
                                            {suggestion.type}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            {/* Search all option */}
                            <button
                                onClick={handleSearchSubmit}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:bg-[var(--ac-linen)] dark:hover:bg-[var(--ac-slate)] transition-colors"
                            >
                                <Search className="w-4 h-4 text-[var(--ac-gold)]" />
                                <span className="text-sm text-[var(--ac-gold)]">
                                    Search all artisans for "{query}"
                                </span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

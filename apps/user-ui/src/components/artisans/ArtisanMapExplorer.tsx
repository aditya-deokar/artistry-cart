'use client';

import { useRef, useLayoutEffect, useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Users, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Mock artisan locations data
const artisanLocations = [
    {
        id: 'portugal',
        name: 'Portugal',
        country: 'Europe',
        lat: 39.3999,
        lng: -8.2245,
        count: 127,
        featured: [
            { id: '1', name: 'Maria Santos', craft: 'Ceramics', image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&h=100&fit=crop' },
            { id: '2', name: 'João Oliveira', craft: 'Tilework', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
        ],
    },
    {
        id: 'japan',
        name: 'Japan',
        country: 'Asia',
        lat: 36.2048,
        lng: 138.2529,
        count: 89,
        featured: [
            { id: '3', name: 'Kenji Tanaka', craft: 'Woodwork', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop' },
        ],
    },
    {
        id: 'india',
        name: 'India',
        country: 'Asia',
        lat: 20.5937,
        lng: 78.9629,
        count: 156,
        featured: [
            { id: '4', name: 'Priya Sharma', craft: 'Textiles', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop' },
        ],
    },
    {
        id: 'italy',
        name: 'Italy',
        country: 'Europe',
        lat: 41.8719,
        lng: 12.5674,
        count: 98,
        featured: [
            { id: '5', name: 'Isabella Romano', craft: 'Glass', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop' },
        ],
    },
    {
        id: 'mexico',
        name: 'Mexico',
        country: 'Americas',
        lat: 23.6345,
        lng: -102.5528,
        count: 73,
        featured: [
            { id: '6', name: 'Carlos Mendez', craft: 'Pottery', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
        ],
    },
    {
        id: 'morocco',
        name: 'Morocco',
        country: 'Africa',
        lat: 31.7917,
        lng: -7.0926,
        count: 64,
        featured: [
            { id: '7', name: 'Fatima El Amrani', craft: 'Leather', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
        ],
    },
];

interface ArtisanMapExplorerProps {
    title?: string;
    subtitle?: string;
}

export function ArtisanMapExplorer({
    title = 'Explore by Location',
    subtitle = 'Discover Globally',
}: ArtisanMapExplorerProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [selectedLocation, setSelectedLocation] = useState<typeof artisanLocations[0] | null>(null);
    const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

    // Entrance animation
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Header entrance
            gsap.from('.map-header', {
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
            });

            // Map container
            gsap.from('.map-container', {
                y: 60,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.map-container',
                    start: 'top 85%',
                },
            });

            // Region pills
            gsap.from('.region-pill', {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.region-pills',
                    start: 'top 90%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const handleLocationClick = useCallback((location: typeof artisanLocations[0]) => {
        setSelectedLocation(location);
    }, []);

    const closePanel = useCallback(() => {
        setSelectedLocation(null);
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-20 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="map-header text-center mb-12">
                    <p className="text-xs tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-3 font-medium">
                        {subtitle}
                    </p>
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-4">
                        {title}
                    </h2>
                    <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] max-w-xl mx-auto">
                        Click on a region to discover artisans from around the world
                    </p>
                </div>

                {/* Map Container */}
                <div className="map-container relative">
                    {/* Stylized World Map SVG */}
                    <div className="relative aspect-[2/1] min-h-[400px] bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] overflow-hidden">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 opacity-10">
                            <svg className="w-full h-full" viewBox="0 0 100 50">
                                {/* Horizontal lines */}
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <line
                                        key={`h-${i}`}
                                        x1="0"
                                        y1={10 + i * 10}
                                        x2="100"
                                        y2={10 + i * 10}
                                        stroke="currentColor"
                                        strokeWidth="0.2"
                                        className="text-[var(--ac-gold)]"
                                    />
                                ))}
                                {/* Vertical lines */}
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <line
                                        key={`v-${i}`}
                                        x1={10 + i * 10}
                                        y1="0"
                                        x2={10 + i * 10}
                                        y2="50"
                                        stroke="currentColor"
                                        strokeWidth="0.2"
                                        className="text-[var(--ac-gold)]"
                                    />
                                ))}
                            </svg>
                        </div>

                        {/* Location Pins */}
                        {artisanLocations.map((location) => {
                            // Convert lat/lng to percentage position (simplified)
                            const x = ((location.lng + 180) / 360) * 100;
                            const y = ((90 - location.lat) / 180) * 100;

                            return (
                                <button
                                    key={location.id}
                                    onClick={() => handleLocationClick(location)}
                                    onMouseEnter={() => setHoveredLocation(location.id)}
                                    onMouseLeave={() => setHoveredLocation(null)}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                                    style={{ left: `${x}%`, top: `${y}%` }}
                                >
                                    {/* Pulse animation */}
                                    <span
                                        className={`absolute inset-0 rounded-full bg-[var(--ac-gold)]/30 animate-ping ${hoveredLocation === location.id ? 'opacity-100' : 'opacity-0'
                                            } transition-opacity`}
                                        style={{ animationDuration: '2s' }}
                                    />

                                    {/* Pin */}
                                    <span
                                        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${selectedLocation?.id === location.id
                                                ? 'bg-[var(--ac-gold)] scale-110'
                                                : hoveredLocation === location.id
                                                    ? 'bg-[var(--ac-gold)]/80 scale-105'
                                                    : 'bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)]'
                                            }`}
                                    >
                                        <span
                                            className={`text-xs font-bold ${selectedLocation?.id === location.id || hoveredLocation === location.id
                                                    ? 'text-[var(--ac-obsidian)]'
                                                    : 'text-[var(--ac-ivory)] dark:text-[var(--ac-obsidian)]'
                                                }`}
                                        >
                                            {location.count}
                                        </span>
                                    </span>

                                    {/* Tooltip */}
                                    <span
                                        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-[var(--ac-charcoal)] text-[var(--ac-pearl)] text-xs whitespace-nowrap transition-all ${hoveredLocation === location.id
                                                ? 'opacity-100 translate-y-0'
                                                : 'opacity-0 translate-y-2 pointer-events-none'
                                            }`}
                                    >
                                        {location.name}
                                    </span>
                                </button>
                            );
                        })}

                        {/* Selected Location Panel */}
                        {selectedLocation && (
                            <div className="absolute top-4 right-4 w-72 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] shadow-lg animate-slideIn">
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                                    <div>
                                        <h3 className="font-[family-name:var(--font-cormorant)] text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                            {selectedLocation.name}
                                        </h3>
                                        <p className="text-xs text-[var(--ac-stone)]">
                                            {selectedLocation.count} Artisans
                                        </p>
                                    </div>
                                    <button
                                        onClick={closePanel}
                                        className="p-1 text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)] transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Featured Artisans */}
                                <div className="p-4 space-y-3">
                                    {selectedLocation.featured.map((artisan) => (
                                        <Link
                                            key={artisan.id}
                                            href={`/artisans/${artisan.id}`}
                                            className="flex items-center gap-3 group"
                                        >
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                                <Image
                                                    src={artisan.image}
                                                    alt={artisan.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] group-hover:text-[var(--ac-gold)] transition-colors truncate">
                                                    {artisan.name}
                                                </p>
                                                <p className="text-xs text-[var(--ac-stone)]">
                                                    {artisan.craft}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-[var(--ac-stone)] group-hover:text-[var(--ac-gold)] transition-colors" />
                                        </Link>
                                    ))}
                                </div>

                                {/* View All Link */}
                                <Link
                                    href={`/artisans?location=${selectedLocation.id}`}
                                    className="block p-4 text-center text-sm text-[var(--ac-gold)] hover:text-[var(--ac-gold-light)] border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)] transition-colors"
                                >
                                    View all artisans in {selectedLocation.name} →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Popular Regions Pills */}
                <div className="region-pills flex flex-wrap justify-center gap-3 mt-8">
                    {artisanLocations.map((location) => (
                        <button
                            key={location.id}
                            onClick={() => handleLocationClick(location)}
                            className={`region-pill flex items-center gap-2 px-4 py-2 border transition-all ${selectedLocation?.id === location.id
                                    ? 'border-[var(--ac-gold)] bg-[var(--ac-gold)]/10 text-[var(--ac-gold)]'
                                    : 'border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:border-[var(--ac-gold)] hover:text-[var(--ac-gold)]'
                                }`}
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-sm">{location.name}</span>
                            <span className="flex items-center gap-1 text-xs">
                                <Users className="w-3 h-3" />
                                {location.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Animation keyframes */}
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </section>
    );
}

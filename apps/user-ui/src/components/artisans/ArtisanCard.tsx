'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, ShoppingBag, CheckCircle2, Crown, Sparkles } from 'lucide-react';

export interface Artisan {
    id: string;
    name: string;
    title: string;
    craft: string;
    location: string;
    country: string;
    image: string;
    rating: number;
    reviewCount: number;
    productCount: number;
    isVerified: boolean;
    isTopSeller?: boolean;
    isNew?: boolean;
    featuredProducts?: {
        id: string;
        image: string;
        name: string;
    }[];
}

interface ArtisanCardProps {
    artisan: Artisan;
    variant?: 'grid' | 'list';
}

export function ArtisanCard({ artisan, variant = 'grid' }: ArtisanCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);

        if (cardRef.current) {
            gsap.to(cardRef.current, {
                scale: 1.02,
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)',
                duration: 0.3,
                ease: 'power2.out',
            });
        }

        if (imageRef.current) {
            gsap.to(imageRef.current.querySelector('img'), {
                scale: 1.05,
                duration: 0.6,
                ease: 'power2.out',
            });
        }

        if (galleryRef.current) {
            gsap.to(galleryRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out',
            });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);

        if (cardRef.current) {
            gsap.to(cardRef.current, {
                scale: 1,
                boxShadow: '0 4px 12px -6px rgba(0,0,0,0.1)',
                duration: 0.3,
                ease: 'power2.out',
            });
        }

        if (imageRef.current) {
            gsap.to(imageRef.current.querySelector('img'), {
                scale: 1,
                duration: 0.6,
                ease: 'power2.out',
            });
        }

        if (galleryRef.current) {
            gsap.to(galleryRef.current, {
                opacity: 0,
                y: 10,
                duration: 0.2,
            });
        }
    };

    if (variant === 'list') {
        return (
            <Link href={`/artisans/${artisan.id}`}>
                <div
                    ref={cardRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="flex gap-6 p-4 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] transition-shadow cursor-pointer"
                >
                    {/* Image */}
                    <div ref={imageRef} className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
                        <Image
                            src={artisan.image}
                            alt={artisan.name}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-[family-name:var(--font-cormorant)] text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                        {artisan.name}
                                    </h3>
                                    {artisan.isVerified && (
                                        <CheckCircle2 className="w-4 h-4 text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)]" />
                                    )}
                                    {artisan.isTopSeller && (
                                        <Crown className="w-4 h-4 text-[var(--ac-gold)]" />
                                    )}
                                </div>
                                <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                                    {artisan.title}
                                </p>
                            </div>

                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-[var(--ac-gold)] text-[var(--ac-gold)]" />
                                <span className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                    {artisan.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-[var(--ac-stone)]">
                                    ({artisan.reviewCount})
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-[var(--ac-stone)]">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {artisan.location}
                            </span>
                            <span className="px-2 py-0.5 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                                {artisan.craft}
                            </span>
                            <span className="flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                {artisan.productCount} Products
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Grid variant (default)
    return (
        <Link href={`/artisans/${artisan.id}`}>
            <div
                ref={cardRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="group relative bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] overflow-hidden cursor-pointer transition-shadow"
                style={{ boxShadow: '0 4px 12px -6px rgba(0,0,0,0.1)' }}
            >
                {/* Badges */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                    {artisan.isNew && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-[var(--ac-success)] text-white text-[10px] tracking-wider uppercase font-medium">
                            <Sparkles className="w-3 h-3" />
                            New
                        </span>
                    )}
                    {artisan.isTopSeller && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-[var(--ac-gold)] text-[var(--ac-ivory)] text-[10px] tracking-wider uppercase font-medium">
                            <Crown className="w-3 h-3" />
                            Top Seller
                        </span>
                    )}
                </div>

                {/* Image Container */}
                <div ref={imageRef} className="relative aspect-[3/4] overflow-hidden">
                    <Image
                        src={artisan.image}
                        alt={artisan.name}
                        fill
                        className="object-cover transition-transform duration-600"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ac-charcoal)]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Featured Products Gallery (on hover) */}
                    {artisan.featuredProducts && artisan.featuredProducts.length > 0 && (
                        <div
                            ref={galleryRef}
                            className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-2"
                        >
                            {artisan.featuredProducts.slice(0, 3).map((product) => (
                                <div
                                    key={product.id}
                                    className="relative w-12 h-12 bg-[var(--ac-ivory)] border border-[var(--ac-linen)] overflow-hidden"
                                >
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                            {artisan.featuredProducts.length > 3 && (
                                <div className="flex items-center justify-center w-12 h-12 bg-[var(--ac-charcoal)]/80 text-[var(--ac-pearl)] text-xs">
                                    +{artisan.featuredProducts.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Verified Badge */}
                    {artisan.isVerified && (
                        <div className="flex items-center gap-1.5 text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] text-xs font-medium mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="tracking-wide uppercase">Verified Artisan</span>
                        </div>
                    )}

                    {/* Name & Title */}
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-1 line-clamp-1">
                        {artisan.name}
                    </h3>
                    <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-3">
                        {artisan.title}
                    </p>

                    {/* Location & Craft */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ac-stone)] mb-3">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {artisan.location}
                        </span>
                        <span className="px-2 py-0.5 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                            {artisan.craft}
                        </span>
                    </div>

                    {/* Rating & Products */}
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-[var(--ac-gold)] text-[var(--ac-gold)]" />
                            <span className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                {artisan.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-[var(--ac-stone)]">
                                ({artisan.reviewCount} reviews)
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[var(--ac-stone)]">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{artisan.productCount} Products</span>
                        </div>
                    </div>

                    {/* View Studio Button (on hover) */}
                    <div
                        className={`mt-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 h-0 mt-0'
                            }`}
                    >
                        <span className="block w-full py-2.5 text-center text-sm tracking-wider uppercase font-medium bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-ivory)] dark:text-[var(--ac-obsidian)] hover:bg-[var(--ac-gold)] dark:hover:bg-[var(--ac-gold-dark)] transition-colors">
                            View Studio
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Eye, Check, Clock, Loader2, ArrowUpRight, Send, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GalleryItem as GalleryItemType, ConceptStatus } from '@/types/aivision';
import Image from 'next/image';

// Legacy interface for backward compatibility
export interface Concept {
    id: string;
    imageUrl: string;
    category: string;
    title: string;
    author: string;
    likes: number;
    views: number;
    status: 'realized' | 'in-progress' | 'awaiting';
    prompt?: string;
    aspectRatio?: 'portrait' | 'landscape' | 'square';
}

interface GalleryItemProps {
    item: GalleryItemType;
    onClick: () => void;
    onFavoriteToggle?: () => void;
    isNew?: boolean;
}

// Map API status to display status
function mapStatus(status: ConceptStatus): 'realized' | 'in-progress' | 'awaiting' {
    switch (status) {
        case 'REALIZED':
            return 'realized';
        case 'SENT_TO_ARTISANS':
            return 'in-progress';
        case 'SAVED':
        case 'GENERATED':
        default:
            return 'awaiting';
    }
}

export function GalleryItem({ item, onClick, onFavoriteToggle, isNew = false }: GalleryItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(item.isFavorite || false);
    const [isLiking, setIsLiking] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const infoRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!overlayRef.current || !infoRef.current) return;

            if (isHovered) {
                gsap.to(overlayRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out',
                });

                gsap.to(infoRef.current, {
                    y: -5,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            } else {
                gsap.to(overlayRef.current, {
                    opacity: 0,
                    y: 10,
                    duration: 0.3,
                    ease: 'power2.in',
                });

                gsap.to(infoRef.current, {
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                });

                if (imageContainerRef.current) {
                    gsap.to(imageContainerRef.current, {
                        rotationX: 0,
                        rotationY: 0,
                        scale: 1,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                }
            }
        },
        { dependencies: [isHovered], scope: cardRef }
    );

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!imageContainerRef.current) return;
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        gsap.to(imageContainerRef.current, {
            rotationY: x * 8,
            rotationX: -y * 8,
            scale: 1.02,
            duration: 0.4,
            ease: 'power2.out'
        });
    };

    const handleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLiking) return;

        setIsLiking(true);
        setIsLiked(!isLiked); // Optimistic update

        if (onFavoriteToggle) {
            await onFavoriteToggle();
        }

        setIsLiking(false);
    };

    const displayStatus = mapStatus(item.status);

    const statusConfig = {
        realized: {
            icon: Check,
            label: 'Realized',
            color: 'text-emerald-400',
            bg: 'bg-emerald-950/50',
            border: 'border-emerald-500/20'
        },
        'in-progress': {
            icon: Send,
            label: 'With Artisans',
            color: 'text-amber-400',
            bg: 'bg-amber-950/50',
            border: 'border-amber-500/20'
        },
        awaiting: {
            icon: Clock,
            label: 'Concept',
            color: 'text-blue-400',
            bg: 'bg-blue-950/50',
            border: 'border-blue-500/20'
        },
    };

    const status = statusConfig[displayStatus];
    const StatusIcon = status.icon;

    // Determine aspect ratio based on image or default
    const aspectClass = 'aspect-[3/4]'; // Default portrait for gallery

    // Emoji based on category for placeholder
    const categoryEmojis: Record<string, string> = {
        'Art': '🎨',
        'Art & Prints': '🎨',
        'Jewelry': '💎',
        'Home Decor': '🏠',
        'Furniture': '🪑',
        'Ceramics': '🏺',
        'Pottery': '🏺',
        'Textiles': '🧵',
    };
    const emoji = categoryEmojis[item.category] || '✨';

    // Format price range
    const priceDisplay = item.priceRange
        ? `$${item.priceRange.min} - $${item.priceRange.max}`
        : null;

    return (
        <div
            ref={cardRef}
            className={cn(
                'relative break-inside-avoid mb-8 cursor-pointer perspective-1000',
                isNew && 'animate-fade-in'
            )}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            data-new={isNew ? 'true' : undefined}
        >
            <div className="relative group">
                {/* Image Container with 3D Tilt */}
                <div
                    ref={imageContainerRef}
                    className={cn(
                        'relative rounded-2xl overflow-hidden transform-style-3d shadow-xl bg-[#111]',
                        aspectClass
                    )}
                >
                    {/* Background Noise Texture */}
                    <div className="absolute inset-0 opacity-20 z-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

                    {/* Placeholder gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1F1F1F] via-[#151515] to-[#0A0A0A] z-[-1]" />

                    {/* Image or Emoji Placeholder */}
                    {item.thumbnailUrl || item.imageUrl ? (
                        <Image
                            src={item.thumbnailUrl || item.imageUrl}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div
                                className="text-6xl opacity-80 transform transition-transform duration-700 drop-shadow-2xl select-none filter saturate-0 group-hover:saturate-100 group-hover:scale-110"
                                style={{ transform: isHovered ? 'scale(1.1) translateZ(30px)' : 'scale(1)' }}
                            >
                                {emoji}
                            </div>
                        </div>
                    )}

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />

                    {/* Top Bar (Status & Like) */}
                    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20" style={{ transform: 'translateZ(20px)' }}>
                        <div className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border uppercase tracking-wider',
                            status.bg, status.color, status.border
                        )}>
                            <StatusIcon size={10} />
                            {status.label}
                        </div>

                        <button
                            onClick={handleFavorite}
                            disabled={isLiking}
                            className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                                'backdrop-blur-md border border-white/5 hover:border-white/20',
                                isLiked
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                    : 'bg-black/20 text-white/40 hover:text-white'
                            )}
                        >
                            {isLiking ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Heart size={14} className={isLiked ? 'fill-current' : ''} />
                            )}
                        </button>
                    </div>

                    {/* Content positioning: Bottom */}
                    <div
                        ref={infoRef}
                        className="absolute bottom-0 left-0 w-full p-5 z-20"
                        style={{ transform: 'translateZ(10px)' }}
                    >
                        {/* Category */}
                        <div className="text-[10px] text-[var(--av-gold)] font-bold uppercase tracking-widest mb-2 opacity-80">
                            {item.category}
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-[var(--av-pearl)] text-lg leading-snug mb-2 font-serif group-hover:text-white transition-colors line-clamp-2">
                            {item.title}
                        </h4>

                        {/* Footer (Price & Stats) */}
                        <div className="flex items-center justify-between">
                            {/* Price Range */}
                            {priceDisplay && (
                                <p className="text-xs text-[var(--av-gold)] font-mono flex items-center gap-1">
                                    <DollarSign size={10} />
                                    {priceDisplay}
                                </p>
                            )}

                            {/* Stats - show on hover */}
                            <div className="flex items-center gap-3 text-[10px] text-[var(--av-ash)] font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 delay-75">
                                <span className="flex items-center gap-1">
                                    <Eye size={10} /> {item.viewCount > 1000 ? (item.viewCount / 1000).toFixed(1) + 'k' : item.viewCount}
                                </span>
                                {item.matchCount > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Send size={10} /> {item.matchCount} artisans
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Hover Button Overlay */}
                    <div
                        ref={overlayRef}
                        className="absolute inset-0 z-30 flex items-center justify-center opacity-0 translate-y-4 pointer-events-none"
                    >
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-full text-white shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <ArrowUpRight size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

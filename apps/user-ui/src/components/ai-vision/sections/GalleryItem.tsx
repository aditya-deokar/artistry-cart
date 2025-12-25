'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Eye, Check, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    concept: Concept;
    onClick: () => void;
    isNew?: boolean;
}

export function GalleryItem({ concept, onClick, isNew = false }: GalleryItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!overlayRef.current) return;

            if (isHovered) {
                gsap.to(overlayRef.current, {
                    opacity: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            } else {
                gsap.to(overlayRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.in',
                });
            }
        },
        { dependencies: [isHovered], scope: cardRef }
    );

    const statusConfig = {
        realized: {
            icon: Check,
            label: 'Realized',
            color: 'bg-emerald-500/90 text-white',
            borderColor: 'border-emerald-500/50'
        },
        'in-progress': {
            icon: Loader2,
            label: 'In Progress',
            color: 'bg-amber-500/90 text-white',
            borderColor: 'border-amber-500/50'
        },
        awaiting: {
            icon: Clock,
            label: 'Awaiting Artisan',
            color: 'bg-blue-500/90 text-white',
            borderColor: 'border-blue-500/50'
        },
    };

    const status = statusConfig[concept.status];
    const StatusIcon = status.icon;

    // Determine aspect ratio class
    const aspectClass = concept.aspectRatio === 'landscape'
        ? 'aspect-[4/3]'
        : concept.aspectRatio === 'portrait'
            ? 'aspect-[3/4]'
            : 'aspect-square';

    // Emoji based on category for placeholder
    const categoryEmojis: Record<string, string> = {
        'Art': '🎨',
        'Jewelry': '💎',
        'Home Decor': '🏠',
        'Furniture': '🪑',
        'Ceramics': '🏺',
    };
    const emoji = categoryEmojis[concept.category] || '✨';

    return (
        <div
            ref={cardRef}
            className={cn(
                'relative break-inside-avoid mb-6 group cursor-pointer',
                isNew && 'animate-fade-in'
            )}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-new={isNew ? 'true' : undefined}
        >
            <div className={cn(
                'relative bg-[#1A1A1A] rounded-xl overflow-hidden shadow-lg transition-all duration-300',
                'hover:shadow-2xl hover:shadow-[var(--av-gold)]/10 hover:-translate-y-1',
                `border border-white/5 hover:${status.borderColor}`
            )}>
                {/* Image */}
                <div className={cn('relative bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F]', aspectClass)}>
                    {/* Placeholder gradient background with emoji */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl opacity-60 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                            {emoji}
                        </div>
                    </div>

                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <div className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-lg',
                            status.color
                        )}>
                            <StatusIcon size={12} className={concept.status === 'in-progress' ? 'animate-spin' : ''} />
                            {status.label}
                        </div>
                    </div>

                    {/* Like Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsLiked(!isLiked);
                        }}
                        className={cn(
                            'absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300',
                            'backdrop-blur-md shadow-lg border border-white/10',
                            isLiked
                                ? 'bg-red-500/90 text-white'
                                : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-red-500'
                        )}
                    >
                        <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                    </button>

                    {/* Hover Overlay */}
                    <div
                        ref={overlayRef}
                        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 flex flex-col justify-end p-5"
                    >
                        <button className="w-full py-3 px-4 bg-gradient-to-r from-[var(--av-gold)] to-[var(--av-gold-dark)] text-white rounded-xl font-bold hover:shadow-[0_0_15px_rgba(212,168,75,0.3)] transition-all transform hover:scale-[1.02] border border-white/10">
                            View Prompt & Details
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="p-5">
                    {/* Category Tag */}
                    <div className="inline-flex items-center gap-1.5 text-xs text-[var(--av-gold)] font-bold mb-2 bg-[var(--av-gold)]/10 px-2 py-1 rounded-full border border-[var(--av-gold)]/10">
                        <span>{emoji}</span>
                        {concept.category}
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-[var(--av-pearl)] text-lg mb-1.5 line-clamp-2 group-hover:text-[var(--av-gold)] transition-colors font-serif">
                        {concept.title}
                    </h4>

                    {/* Author */}
                    <p className="text-sm text-[var(--av-silver)] mb-4 font-light">
                        by <span className="font-medium text-[var(--av-pearl)]">{concept.author}</span>
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-4 text-sm text-[var(--av-ash)]">
                            <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer">
                                <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                                <span className="font-medium">{concept.likes + (isLiked ? 1 : 0)}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Eye size={14} />
                                <span className="font-medium">{concept.views.toLocaleString()}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

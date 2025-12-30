'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { X, Heart, Share2, Sparkles, ExternalLink, Calendar, Eye, Loader2, Send, DollarSign, Check, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumButton } from '../ui/PremiumButton';
import { useGalleryItem, useConceptActions } from '@/hooks/useAIVision';
import type { ConceptStatus } from '@/types/aivision';
import Image from 'next/image';

interface ConceptLightboxProps {
    itemId: string;
    onClose: () => void;
    onTrySimilar: () => void;
}

// Map status to display config
function getStatusConfig(status: ConceptStatus) {
    switch (status) {
        case 'REALIZED':
            return {
                label: 'Realized',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                icon: Check,
                description: 'This concept has been brought to life by an artisan!',
            };
        case 'SENT_TO_ARTISANS':
            return {
                label: 'With Artisans',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                icon: Send,
                description: 'Artisans are reviewing this concept.',
            };
        case 'SAVED':
            return {
                label: 'Saved',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
                icon: Heart,
                description: 'This concept has been saved for later.',
            };
        default:
            return {
                label: 'Concept',
                color: 'text-[var(--av-silver)]',
                bg: 'bg-white/5',
                border: 'border-white/10',
                icon: Sparkles,
                description: 'A generated AI concept.',
            };
    }
}

export function ConceptLightbox({ itemId, onClose, onTrySimilar }: ConceptLightboxProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Fetch item details
    const { item, isLoading, error, refetch } = useGalleryItem(itemId);

    // Actions
    const { save, isLoading: actionLoading } = useConceptActions();

    const [isFavorite, setIsFavorite] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Update favorite state when item loads
    useEffect(() => {
        if (item) {
            setIsFavorite(item.isFavorite);
        }
    }, [item]);

    useGSAP(
        () => {
            // Animate overlay
            gsap.fromTo(
                modalRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );

            // Animate content
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.fromTo(
                contentRef.current,
                { y: 50, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, delay: 0.1 }
            );

            // Stagger animate details
            tl.from(
                '.lightbox-detail',
                { y: 20, opacity: 0, stagger: 0.05, duration: 0.4 },
                '-=0.2'
            );
        },
        { scope: modalRef }
    );

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSave = async () => {
        if (item) {
            const success = await save(item.id);
            if (success) {
                setIsFavorite(true);
            }
        }
    };

    const handleShare = async () => {
        if (item && navigator.share) {
            try {
                await navigator.share({
                    title: item.title,
                    text: `Check out this AI-generated concept: ${item.title}`,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled or share failed
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div
                ref={modalRef}
                className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6"
            >
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
                <div className="relative bg-[#0A0A0A] rounded-2xl p-12 flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[var(--av-gold)]" />
                    <p className="text-[var(--av-silver)]">Loading concept details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !item) {
        return (
            <div
                ref={modalRef}
                className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6"
            >
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
                <div className="relative bg-[#0A0A0A] rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
                    <p className="text-red-400">{error || 'Failed to load concept'}</p>
                    <button
                        onClick={() => refetch()}
                        className="text-[var(--av-gold)] hover:underline"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={onClose}
                        className="text-[var(--av-silver)] hover:text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(item.status);
    const StatusIcon = statusConfig.icon;
    const images = item.images || [];
    const currentImage = images[currentImageIndex];

    // Format date
    const createdDate = new Date(item.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={contentRef}
                className="relative w-full max-w-6xl max-h-[90vh] bg-[#0A0A0A] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors border border-white/10"
                >
                    <X size={24} />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-3/5 lg:w-2/3 bg-[#151515] relative flex items-center justify-center overflow-hidden min-h-[300px]">
                    {/* Main Image */}
                    {currentImage ? (
                        <Image
                            src={currentImage.url}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 66vw"
                            className="object-contain"
                        />
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]" />
                            <div className="relative text-9xl select-none opacity-50 animate-pulse">
                                ✨
                            </div>
                        </>
                    )}

                    {/* Image Navigation (if multiple images) */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={cn(
                                        'w-2 h-2 rounded-full transition-all',
                                        index === currentImageIndex
                                            ? 'bg-white w-6'
                                            : 'bg-white/30 hover:bg-white/50'
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex gap-4">
                            <button
                                onClick={handleSave}
                                disabled={actionLoading || isFavorite}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm border transition-colors",
                                    isFavorite
                                        ? "bg-red-500/20 text-red-400 border-red-500/20"
                                        : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                                )}
                            >
                                <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                                {isFavorite ? 'Saved' : 'Save'}
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm border border-white/10 transition-colors"
                            >
                                <Share2 size={16} /> Share
                            </button>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="w-full md:w-2/5 lg:w-1/3 bg-[#111] flex flex-col border-l border-white/5">
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        {/* Category Badge */}
                        <div className="lightbox-detail mb-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--av-gold)]/10 rounded-full text-xs text-[var(--av-gold)] font-semibold uppercase tracking-wider">
                                <Tag size={10} />
                                {item.category}
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="lightbox-detail text-2xl md:text-3xl font-bold text-[var(--av-pearl)] mb-4 font-serif leading-tight">
                            {item.title}
                        </h2>

                        {/* Stats Row */}
                        <div className="lightbox-detail flex items-center gap-4 mb-6 pb-6 border-b border-white/10 flex-wrap">
                            <div className="flex items-center gap-2 text-[var(--av-silver)]">
                                <Eye size={16} />
                                <span className="font-semibold text-[var(--av-pearl)]">{item.viewCount}</span> views
                            </div>
                            {item.matchCount > 0 && (
                                <div className="flex items-center gap-2 text-[var(--av-silver)]">
                                    <Send size={16} />
                                    <span className="font-semibold text-[var(--av-pearl)]">{item.matchCount}</span> artisans
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-[var(--av-silver)]">
                                <Calendar size={16} />
                                <span className="text-sm">{createdDate}</span>
                            </div>
                        </div>

                        {/* Price Range */}
                        {item.priceRange && (
                            <div className="lightbox-detail mb-6">
                                <h4 className="text-xs text-[var(--av-silver)] uppercase tracking-wider mb-2">Estimated Price</h4>
                                <div className="flex items-center gap-2 text-xl font-bold text-[var(--av-gold)]">
                                    <DollarSign size={20} />
                                    ${item.priceRange.min.toLocaleString()} - ${item.priceRange.max.toLocaleString()}
                                </div>
                            </div>
                        )}

                        {/* Materials */}
                        {item.materials && item.materials.length > 0 && (
                            <div className="lightbox-detail mb-6">
                                <h4 className="text-xs text-[var(--av-silver)] uppercase tracking-wider mb-2">Materials</h4>
                                <div className="flex flex-wrap gap-2">
                                    {item.materials.map(material => (
                                        <span key={material} className="px-3 py-1 bg-white/5 rounded-full text-xs text-[var(--av-pearl)] border border-white/5">
                                            {material}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Style Keywords */}
                        {item.styleKeywords && item.styleKeywords.length > 0 && (
                            <div className="lightbox-detail flex flex-wrap gap-2 mb-6">
                                {item.styleKeywords.map(keyword => (
                                    <span key={keyword} className="px-3 py-1 bg-[var(--av-gold)]/5 rounded-full text-xs text-[var(--av-gold)] border border-[var(--av-gold)]/10">
                                        #{keyword}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Status Info */}
                        <div className={cn("lightbox-detail mb-6 p-4 rounded-xl border", statusConfig.bg, statusConfig.border)}>
                            <h4 className={cn("flex items-center gap-2 font-bold mb-1", statusConfig.color)}>
                                <StatusIcon size={16} /> {statusConfig.label}
                            </h4>
                            <p className={cn("text-sm", statusConfig.color, "opacity-80")}>
                                {statusConfig.description}
                            </p>
                            {item.status === 'REALIZED' && (
                                <button className="mt-3 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 uppercase tracking-wider">
                                    View Final Product <ExternalLink size={12} />
                                </button>
                            )}
                        </div>

                        {/* Related Items would go here */}
                    </div>

                    {/* Action Footer */}
                    <div className="p-6 border-t border-white/10 bg-[#0D0D0D]">
                        <PremiumButton
                            variant="primary"
                            className="w-full justify-center"
                            onClick={onTrySimilar}
                            glow
                        >
                            <Sparkles size={18} className="mr-2" />
                            Generate Similar
                        </PremiumButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

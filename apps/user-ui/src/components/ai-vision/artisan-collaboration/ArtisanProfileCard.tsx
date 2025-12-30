'use client';

import { Star, MapPin, Clock, Award, ArrowUpRight, Check, MessageSquare, DollarSign, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumButton } from '../ui/PremiumButton';
import type { ArtisanMatch } from '@/types/aivision';
import Image from 'next/image';

// Legacy interface for backward compatibility
export interface Artisan {
    id: string;
    name: string;
    studio: string;
    location: string;
    rating: number;
    reviewCount: number;
    specialties: string[];
    responseTime: string;
    priceRange: string;
    avatar: string;
    portfolio: string[];
}

// Props can accept either legacy Artisan or new ArtisanMatch
interface ArtisanProfileCardProps {
    artisan?: Artisan;
    match?: ArtisanMatch;
    onSendRequest: () => void;
    onViewProfile: () => void;
    className?: string;
    isConnecting?: boolean;
}

// Adapter function to normalize data
function normalizeArtisanData(artisan?: Artisan, match?: ArtisanMatch) {
    if (match) {
        return {
            id: match.sellerId,
            name: match.shop?.name || 'Artisan Studio',
            studio: match.shop?.category || 'General',
            location: '', // Not available in API response
            rating: match.shop?.rating || 0,
            reviewCount: 0, // Not available
            specialties: match.matchReasons?.slice(0, 3) || [],
            responseTime: match.respondedAt ? 'Responded' : 'Awaiting',
            priceRange: match.quote ? `$${match.quote.price}` : '',
            avatar: match.shop?.avatar || '🗿',
            portfolio: [],
            // Additional match data
            matchScore: match.overallScore,
            matchReasons: match.matchReasons || [],
            status: match.status,
            quote: match.quote,
            response: match.response,
        };
    }

    if (artisan) {
        return {
            ...artisan,
            matchScore: undefined,
            matchReasons: [],
            status: undefined,
            quote: undefined,
            response: undefined,
        };
    }

    return null;
}

export function ArtisanProfileCard({ artisan, match, onSendRequest, onViewProfile, className, isConnecting }: ArtisanProfileCardProps) {
    const data = normalizeArtisanData(artisan, match);

    if (!data) return null;

    const hasMatchData = match !== undefined;
    const isQuoted = data.status === 'QUOTED' && data.quote;
    const isInterested = data.status === 'INTERESTED';
    const isDeclined = data.status === 'DECLINED';

    // Get match score color
    const getScoreColor = (score?: number) => {
        if (!score) return '';
        if (score >= 0.8) return 'text-emerald-400 bg-emerald-500/20';
        if (score >= 0.6) return 'text-yellow-400 bg-yellow-500/20';
        return 'text-orange-400 bg-orange-500/20';
    };

    return (
        <div className={cn(
            "group relative bg-[#0F0F0F] rounded-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--av-gold)]/10 hover:border-[var(--av-gold)]/30 hover:-translate-y-2",
            isDeclined && "opacity-50",
            className
        )}>

            {/* Cover Image Gradient */}
            <div className="h-32 bg-gradient-to-r from-[#2A2A2A] to-[#151515] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                <div className="absolute top-3 right-3 flex gap-2">
                    {/* Match Score Badge */}
                    {hasMatchData && data.matchScore && (
                        <span className={cn(
                            "px-3 py-1 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 flex items-center gap-1.5 shadow-sm",
                            getScoreColor(data.matchScore)
                        )}>
                            {Math.round(data.matchScore * 100)}% Match
                        </span>
                    )}

                    {/* Response Time Badge */}
                    {!hasMatchData && (
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-[var(--av-pearl)] border border-white/10 flex items-center gap-1.5 shadow-sm">
                            <Clock size={12} className="text-[var(--av-gold)]" />
                            {data.responseTime}
                        </span>
                    )}

                    {/* Status Badge */}
                    {data.status && data.status !== 'PENDING' && (
                        <span className={cn(
                            "px-3 py-1 backdrop-blur-md rounded-full text-xs font-medium border flex items-center gap-1.5",
                            data.status === 'INTERESTED' && "bg-blue-500/20 text-blue-400 border-blue-500/20",
                            data.status === 'QUOTED' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
                            data.status === 'DECLINED' && "bg-red-500/20 text-red-400 border-red-500/20",
                            data.status === 'ACCEPTED' && "bg-[var(--av-gold)]/20 text-[var(--av-gold)] border-[var(--av-gold)]/20"
                        )}>
                            {data.status === 'INTERESTED' && <MessageSquare size={12} />}
                            {data.status === 'QUOTED' && <DollarSign size={12} />}
                            {data.status === 'ACCEPTED' && <Check size={12} />}
                            {data.status}
                        </span>
                    )}
                </div>
            </div>

            <div className="px-6 pb-6 relative z-10">
                {/* Avatar with Status Indicator */}
                <div className="relative -mt-16 mb-4 inline-block group-hover:scale-105 transition-transform duration-300 origin-bottom-left">
                    <div className="w-24 h-24 rounded-2xl bg-[#1A1A1A] border-[4px] border-[#0F0F0F] overflow-hidden flex items-center justify-center text-4xl shadow-lg relative z-10">
                        {data.avatar.startsWith('http') || data.avatar.startsWith('/') ? (
                            <Image
                                src={data.avatar}
                                alt={data.name}
                                fill
                                sizes="96px"
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--av-gold)]/20 to-[var(--av-gold)]/5 flex items-center justify-center">
                                {data.avatar}
                            </div>
                        )}
                    </div>
                    {/* Verified Badge */}
                    <div className="absolute -bottom-1 -right-1 bg-[#0F0F0F] p-1 rounded-full z-20">
                        <div className="bg-[var(--av-gold)] w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-black shadow-md" title="Verified Artisan">
                            <Award size={14} strokeWidth={3} />
                        </div>
                    </div>
                </div>

                {/* Info Block */}
                <div className="mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-[var(--av-pearl)] font-serif leading-tight mb-1 group-hover:text-[var(--av-gold)] transition-colors">
                                {data.name}
                            </h3>
                            <p className="text-sm text-[var(--av-silver)] mb-3 flex items-center gap-1">
                                {data.studio}
                            </p>
                        </div>
                        <div className="flex flex-col items-end">
                            {data.rating > 0 && (
                                <>
                                    <div className="flex items-center gap-1 text-[var(--av-gold)] font-bold text-sm bg-[var(--av-gold)]/10 px-2 py-1 rounded-lg">
                                        <Star size={14} className="fill-current" />
                                        {data.rating.toFixed(1)}
                                    </div>
                                    {data.reviewCount > 0 && (
                                        <span className="text-[10px] text-[var(--av-silver)] mt-1">
                                            {data.reviewCount} reviews
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[var(--av-silver)] mt-2">
                        {data.location && (
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-[var(--av-silver)]" /> {data.location}
                            </div>
                        )}
                        {data.priceRange && (
                            <div className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[var(--av-pearl)]">
                                {data.priceRange}
                            </div>
                        )}
                    </div>
                </div>

                {/* Match Reasons (for API data) or Specialties (for legacy) */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {(hasMatchData ? data.matchReasons : data.specialties).slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className={cn(
                                "px-3 py-1 rounded-full text-[10px] uppercase tracking-wide border font-semibold transition-colors",
                                hasMatchData
                                    ? "bg-[var(--av-gold)]/5 text-[var(--av-gold)] border-[var(--av-gold)]/20"
                                    : "bg-[#1A1A1A] text-[var(--av-silver)] border-white/5 group-hover:border-[var(--av-gold)]/30"
                            )}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Quote Info (if available) */}
                {isQuoted && data.quote && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Quote Received</span>
                            <span className="text-lg font-bold text-emerald-400">${data.quote.price}</span>
                        </div>
                        <p className="text-xs text-[var(--av-silver)]">
                            Timeline: {data.quote.timeline}
                        </p>
                    </div>
                )}

                {/* Response Message */}
                {data.response && (
                    <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-xs text-[var(--av-silver)] italic line-clamp-2">
                            "{data.response}"
                        </p>
                    </div>
                )}

                {/* Portfolio (only for legacy data) */}
                {!hasMatchData && data.portfolio.length > 0 && (
                    <div className="relative h-20 mb-8 w-full group/portfolio cursor-pointer">
                        <p className="text-[10px] uppercase tracking-widest text-[var(--av-silver)] mb-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 left-0">
                            Recent Works
                        </p>
                        {data.portfolio.map((img, i) => (
                            <div
                                key={i}
                                className="absolute top-0 w-20 h-20 rounded-lg bg-[#222] border border-white/10 shadow-lg overflow-hidden transition-all duration-300 ease-out origin-bottom-left group-hover/portfolio:rotate-0"
                                style={{
                                    left: `${i * 25}px`,
                                    zIndex: 10 - i,
                                    transform: `rotate(${i * 5}deg)`
                                }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center text-xl opacity-30 select-none">🖼️</div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                                    <ArrowUpRight size={14} className="text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                    <div className="flex-1">
                        <PremiumButton
                            onClick={onSendRequest}
                            variant={isQuoted ? 'premium' : 'primary'}
                            className="w-full justify-center !py-2.5 text-sm"
                            glow={!isDeclined}
                            disabled={isDeclined || isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : isQuoted ? (
                                'Accept Quote'
                            ) : isInterested ? (
                                'Reply'
                            ) : isDeclined ? (
                                'Declined'
                            ) : (
                                'Connect'
                            )}
                        </PremiumButton>
                    </div>
                    <button
                        onClick={onViewProfile}
                        className="p-2.5 bg-[#1A1A1A] text-[var(--av-silver)] rounded-lg hover:bg-white/10 hover:text-white transition-all border border-white/5 hover:border-white/20 active:scale-95"
                        title="View Full Profile"
                    >
                        <ArrowUpRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

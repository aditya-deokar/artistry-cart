'use client';

import { Star, MapPin, Clock, Award, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumButton } from '../ui/PremiumButton';

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

interface ArtisanProfileCardProps {
    artisan: Artisan;
    onSendRequest: () => void;
    onViewProfile: () => void;
    className?: string;
}

export function ArtisanProfileCard({ artisan, onSendRequest, onViewProfile, className }: ArtisanProfileCardProps) {
    // Purposeful Interaction: "Fan Out" portfolio images on hover
    // Using simple CSS transforms for performance and reliability

    return (
        <div className={cn(
            "group relative bg-[#0F0F0F] rounded-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--av-gold)]/10 hover:border-[var(--av-gold)]/30 hover:-translate-y-2",
            className
        )}>

            {/* Cover Image Gradient */}
            <div className="h-32 bg-gradient-to-r from-[#2A2A2A] to-[#151515] relative overflow-hidden">
                {/* Subtle pattern or noise could go here */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                <div className="absolute top-3 right-3 flex gap-2">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-[var(--av-pearl)] border border-white/10 flex items-center gap-1.5 shadow-sm">
                        <Clock size={12} className="text-[var(--av-gold)]" />
                        {artisan.responseTime}
                    </span>
                </div>
            </div>

            <div className="px-6 pb-6 relative z-10">
                {/* Avatar with Status Indicator */}
                <div className="relative -mt-16 mb-4 inline-block group-hover:scale-105 transition-transform duration-300 origin-bottom-left">
                    <div className="w-24 h-24 rounded-2xl bg-[#1A1A1A] border-[4px] border-[#0F0F0F] overflow-hidden flex items-center justify-center text-4xl shadow-lg relative z-10">
                        {/* Placeholder for real avatar */}
                        <div className="w-full h-full bg-gradient-to-br from-[var(--av-gold)]/20 to-[var(--av-gold)]/5 flex items-center justify-center">
                            {artisan.avatar}
                        </div>
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
                                {artisan.name}
                            </h3>
                            <p className="text-sm text-[var(--av-silver)] mb-3 flex items-center gap-1">
                                {artisan.studio}
                            </p>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-[var(--av-gold)] font-bold text-sm bg-[var(--av-gold)]/10 px-2 py-1 rounded-lg">
                                <Star size={14} className="fill-current" />
                                {artisan.rating}
                            </div>
                            <span className="text-[10px] text-[var(--av-silver)] mt-1">{artisan.reviewCount} reviews</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[var(--av-silver)] mt-2">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-[var(--av-silver)]" /> {artisan.location}
                        </div>
                        <div className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[var(--av-pearl)]">
                            {artisan.priceRange}
                        </div>
                    </div>
                </div>

                {/* Specialties Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {artisan.specialties.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-[#1A1A1A] rounded-full text-[10px] text-[var(--av-silver)] uppercase tracking-wide border border-white/5 font-semibold group-hover:border-[var(--av-gold)]/30 transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Macro Interaction: "Fan Out" Portfolio */}
                {/* Instead of a grid, let's make them overlap and fan out on hover */}
                <div className="relative h-20 mb-8 w-full group/portfolio cursor-pointer">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--av-silver)] mb-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 left-0">
                        Recent Works
                    </p>
                    {artisan.portfolio.map((img, i) => (
                        <div
                            key={i}
                            className="absolute top-0 w-20 h-20 rounded-lg bg-[#222] border border-white/10 shadow-lg overflow-hidden transition-all duration-300 ease-out origin-bottom-left group-hover/portfolio:rotate-0"
                            style={{
                                left: `${i * 25}px`, // Slight stagger in static
                                zIndex: 10 - i,
                                transform: `rotate(${i * 5}deg)` // Rotated stack look normally
                            }}
                        >
                            {/* On parent hover, we override styles via CSS class logic approx or just keep this stack */}
                            {/* To maximize the "Macro" feel, let's use the group-hover utility on the container to move these specific indices */}
                            <div className="absolute inset-0 flex items-center justify-center text-xl opacity-30 select-none">🖼️</div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                                <ArrowUpRight size={14} className="text-white" />
                            </div>
                        </div>
                    ))}
                    {/* Add a "More" indicator if needed */}
                </div>

                <style jsx>{`
            /* Fan Out Effect on Hover */
            .group:hover .group\\/portfolio > div:nth-child(2) {
               transform: translateX(10px) rotate(5deg);
            }
            .group:hover .group\\/portfolio > div:nth-child(3) {
               transform: translateX(40px) rotate(10deg);
            }
            .group:hover .group\\/portfolio > div:nth-child(4) {
               transform: translateX(80px) rotate(15deg);
            }
         `}</style>

                {/* Actions */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                    <div className="flex-1">
                        <PremiumButton
                            onClick={onSendRequest}
                            variant="primary"
                            className="w-full justify-center !py-2.5 text-sm"
                            glow
                        >
                            Connect
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

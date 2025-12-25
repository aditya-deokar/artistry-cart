'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { X, Heart, Share2, Sparkles, ExternalLink, Calendar, Eye } from 'lucide-react';
import { type Concept } from './GalleryItem';
import { cn } from '@/lib/utils';
import { PremiumButton } from '../ui/PremiumButton';

interface ConceptLightboxProps {
    concept: Concept;
    onClose: () => void;
    onTrySimilar: () => void;
}

export function ConceptLightbox({ concept, onClose, onTrySimilar }: ConceptLightboxProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

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
                    {/* Main Image Gradient Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]" />

                    <div className="relative text-9xl select-none opacity-50 animate-pulse">
                        {concept.category === 'Art' ? '🎨' :
                            concept.category === 'Jewelry' ? '💎' :
                                concept.category === 'Home Decor' ? '🏠' :
                                    concept.category === 'Furniture' ? '🪑' : '✨'}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm border border-white/10 transition-colors">
                                <Share2 size={16} /> Share
                            </button>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="w-full md:w-2/5 lg:w-1/3 bg-[#111] flex flex-col border-l border-white/5">
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        {/* Header */}
                        <div className="lightbox-detail flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--av-gold)] to-[var(--av-gold-dark)] flex items-center justify-center text-white shadow-lg">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[var(--av-pearl)] text-lg">{concept.author}</h3>
                                <div className="text-xs text-[var(--av-silver)]">Concept Creator</div>
                            </div>
                        </div>

                        <h2 className="lightbox-detail text-2xl md:text-3xl font-bold text-[var(--av-pearl)] mb-4 font-serif leading-tight">
                            {concept.title}
                        </h2>

                        <div className="lightbox-detail flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                            <div className="flex items-center gap-2 text-[var(--av-silver)]">
                                <Heart size={18} />
                                <span className="font-semibold text-[var(--av-pearl)]">{concept.likes}</span> likes
                            </div>
                            <div className="flex items-center gap-2 text-[var(--av-silver)]">
                                <Eye size={18} />
                                <span className="font-semibold text-[var(--av-pearl)]">{concept.views}</span> views
                            </div>
                            <div className="flex items-center gap-2 text-[var(--av-silver)]">
                                <Calendar size={18} />
                                <span className="text-sm">2 days ago</span>
                            </div>
                        </div>

                        {/* Prompt Section */}
                        <div className="lightbox-detail mb-8">
                            <h4 className="flex items-center gap-2 text-[var(--av-gold)] font-semibold mb-3 uppercase text-xs tracking-wider">
                                <Sparkles size={14} /> AI Prompt Used
                            </h4>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-[var(--av-silver)] italic leading-relaxed text-sm">
                                "{concept.prompt || 'A beautiful handcrafted masterpiece featuring organic shapes and natural textures, illuminated by soft golden hour lighting.'}"
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="lightbox-detail flex flex-wrap gap-2 mb-8">
                            {['Minimalist', 'Organic', 'Handcrafted', 'Modern'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-xs text-[var(--av-silver)] border border-white/5">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Status Info */}
                        {concept.status === 'realized' && (
                            <div className="lightbox-detail mb-8 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <h4 className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                                    <Check size={16} /> Realized Project
                                </h4>
                                <p className="text-sm text-emerald-400/80">
                                    This concept has been brought to life by an artisan!
                                </p>
                                <button className="mt-3 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 uppercase tracking-wider">
                                    View Final Product <ExternalLink size={12} />
                                </button>
                            </div>
                        )}

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
                            Try Similar Prompt
                        </PremiumButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

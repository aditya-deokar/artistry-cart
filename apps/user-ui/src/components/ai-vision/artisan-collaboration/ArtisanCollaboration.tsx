'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionContainer } from '../ui/SectionContainer';
import { ArtisanMatchingFlow } from './ArtisanMatchingFlow';
import { ArtisanProfileCard, type Artisan } from './ArtisanProfileCard';
import { SendToArtisansModal } from './SendToArtisansModal';
import { ChatMockup } from './ChatMockup';
import { ProjectTimeline } from './ProjectTimeline';
import { PricingTransparency } from './PricingTransparency';
import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Mock Artisans
const mockArtisans: Artisan[] = [
    {
        id: '1',
        name: 'Elena Silva',
        studio: 'Terra Ceramics',
        location: 'Lisbon, Portugal',
        rating: 4.9,
        reviewCount: 124,
        specialties: ['Ceramics', 'Pottery', 'Glazing'],
        responseTime: '< 2h',
        priceRange: '$$',
        avatar: '👩‍🎨',
        portfolio: ['/1.jpg', '/2.jpg', '/3.jpg']
    },
    {
        id: '2',
        name: 'Marcus Thorne',
        studio: 'Iron & Oak',
        location: 'Portland, OR',
        rating: 5.0,
        reviewCount: 89,
        specialties: ['Woodworking', 'Furniture', 'Metal'],
        responseTime: '< 5h',
        priceRange: '$$$',
        avatar: '👨‍🔧',
        portfolio: ['/4.jpg', '/5.jpg', '/6.jpg']
    },
    {
        id: '3',
        name: 'Yuki Tanaka',
        studio: 'Kintsugi Art',
        location: 'Kyoto, Japan',
        rating: 4.8,
        reviewCount: 210,
        specialties: ['Kintsugi', 'Lacquer', 'Restoration'],
        responseTime: '< 12h',
        priceRange: '$$',
        avatar: '👩‍🎨',
        portfolio: ['/7.jpg', '/8.jpg', '/9.jpg']
    }
];

export function ArtisanCollaboration() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArtisans, setSelectedArtisans] = useState<Artisan[]>([]);

    const sectionRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const demoRef = useRef<HTMLDivElement>(null);

    // Animate Cards
    useGSAP(
        () => {
            if (cardsRef.current) {
                gsap.fromTo(
                    cardsRef.current.children,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        stagger: 0.15,
                        duration: 0.6,
                        ease: 'back.out(1.2)',
                        scrollTrigger: {
                            trigger: cardsRef.current,
                            start: 'top 80%',
                        }
                    }
                );
            }

            // Animate Dashboard (Bento Grid)
            if (demoRef.current) {
                gsap.fromTo(
                    demoRef.current.children,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: demoRef.current,
                            start: 'top 70%',
                        }
                    }
                );
            }
        },
        { scope: sectionRef }
    );

    const handleSendRequest = (artisan: Artisan) => {
        setSelectedArtisans([artisan]);
        setIsModalOpen(true);
    };

    return (
        <SectionContainer
            ref={sectionRef}
            variant="dark"
            maxWidth="xl"
            className="bg-[#050505] relative overflow-hidden pb-32"
        >
            {/* Macro Background: Large text parallax */}
            <div className="absolute top-0 w-full overflow-hidden pointer-events-none opacity-[0.03]">
                <h1 className="text-[15vw] font-bold text-white whitespace-nowrap leading-none select-none animate-[slide_60s_linear_infinite]">
                    COLLABORATION  CRAFTSMANSHIP  CONNECTION
                </h1>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--av-gold)]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2 animate-pulse [animation-duration:10s]" />

            {/* 1. Matching Flow Diagram */}
            <ArtisanMatchingFlow />

            {/* 2. Artisan Selection */}
            <div className="mt-24 mb-32 relative z-10">
                <div className="flex items-end justify-between mb-12 px-4">
                    <div>
                        <h3 className="text-2xl font-bold text-[var(--av-pearl)] mb-2 font-serif">Top Matches for Your Concept</h3>
                        <p className="text-[var(--av-silver)]">Based on style, material, and budget compatibility</p>
                    </div>
                    <button className="hidden md:flex items-center gap-2 text-[var(--av-gold)] hover:text-[var(--av-pearl)] transition-colors text-sm font-bold uppercase tracking-wider group">
                        View All Matches <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockArtisans.map((artisan) => (
                        <ArtisanProfileCard
                            key={artisan.id}
                            artisan={artisan}
                            onSendRequest={() => handleSendRequest(artisan)}
                            onViewProfile={() => { }}
                        />
                    ))}
                </div>
            </div>

            {/* 3. The Dashboard (Bento Grid) */}
            <div className="mb-20">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full mb-6 border border-white/10">
                        <LayoutDashboard size={14} className="text-[var(--av-gold)]" />
                        <span className="text-xs font-semibold text-[var(--av-pearl)] uppercase tracking-wide">
                            Project Hub
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--av-pearl)] mb-4 font-serif">
                        Your Project <span className="text-[var(--av-gold)]">Control Center</span>
                    </h2>
                    <p className="text-[var(--av-silver)] max-w-xl mx-auto">
                        Everything you need to manage your custom commission, from the first message to the final delivery.
                    </p>
                </div>

                <div ref={demoRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px] relative z-10">

                    {/* Main Area: Chat / Communication (Takes up 7 of 12 columns) */}
                    <div className="lg:col-span-7 h-full flex flex-col">
                        <div className="flex-1 bg-[#111] rounded-2xl border border-white/10 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                            {/* We wrap ChatMockup to fit this container naturally */}
                            <div className="h-full w-full absolute inset-0">
                                <ChatMockup />
                            </div>
                            {/* Overlay title for context if needed, but ChatMockup has header */}
                        </div>
                    </div>

                    {/* Side Area: Timeline & Pricing (Takes up 5 of 12 columns) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 h-full">

                        {/* Top Right: Progress Status */}
                        <div className="flex-1 bg-[#0E0E0E] rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-[var(--av-pearl)] font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[var(--av-gold)] animate-pulse" />
                                    Project Status
                                </h4>
                                <span className="text-[10px] uppercase text-[var(--av-silver)] bg-white/5 px-2 py-1 rounded">Active</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <ProjectTimeline />
                            </div>
                        </div>

                        {/* Bottom Right: Pricing Widget */}
                        <div className="h-[240px]">
                            <PricingTransparency variant="widget" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <SendToArtisansModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedArtisans={selectedArtisans}
            />

            <style jsx>{`
          @keyframes slide {
             0% { transform: translateX(0); }
             100% { transform: translateX(-50%); }
          }
       `}</style>
        </SectionContainer>
    );
}

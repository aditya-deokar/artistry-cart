'use client';

import { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

// Mock gallery data
const mockGalleryItems = [
    {
        id: '1',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=300&fit=crop',
        title: 'Mediterranean Ceramic Collection',
        description: 'Handcrafted vases inspired by the Portuguese coastline',
    },
    {
        id: '2',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=300&fit=crop',
        title: 'Studio Workshop',
        description: 'Where the magic happens',
    },
    {
        id: '3',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&h=300&fit=crop',
        title: 'Earth Tones Series',
        description: 'Natural glazes from local minerals',
    },
    {
        id: '4',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1594125311687-3b1b2c0a2f65?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1594125311687-3b1b2c0a2f65?w=300&h=300&fit=crop',
        title: 'Tea Ceremony Set',
        description: 'Minimalist design meets traditional craft',
    },
    {
        id: '5',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=300&h=300&fit=crop',
        title: 'Wheel Throwing Process',
        description: 'Traditional techniques, modern forms',
    },
    {
        id: '6',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?w=300&h=300&fit=crop',
        title: 'Kiln Firing',
        description: 'The transformative moment',
    },
];

interface ProfileGalleryProps {
    artisanId?: string;
}

export function ProfileGallery({ artisanId }: ProfileGalleryProps) {
    const galleryRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Entrance animation
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.gallery-item', {
                y: 40,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                onComplete: () => setIsLoading(false),
            });
        }, galleryRef);

        return () => ctx.revert();
    }, []);

    const openLightbox = useCallback((index: number) => {
        setSelectedIndex(index);
        document.body.style.overflow = 'hidden';
    }, []);

    const closeLightbox = useCallback(() => {
        setSelectedIndex(null);
        document.body.style.overflow = '';
    }, []);

    const goToPrevious = useCallback(() => {
        if (selectedIndex === null) return;
        setSelectedIndex(
            selectedIndex === 0 ? mockGalleryItems.length - 1 : selectedIndex - 1
        );
    }, [selectedIndex]);

    const goToNext = useCallback(() => {
        if (selectedIndex === null) return;
        setSelectedIndex(
            selectedIndex === mockGalleryItems.length - 1 ? 0 : selectedIndex + 1
        );
    }, [selectedIndex]);

    // Keyboard navigation
    useLayoutEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return;

            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, closeLightbox, goToPrevious, goToNext]);

    return (
        <>
            {/* Gallery Grid */}
            <div
                ref={galleryRef}
                className="grid grid-cols-2 md:grid-cols-3 gap-3"
            >
                {mockGalleryItems.map((item, index) => (
                    <button
                        key={item.id}
                        onClick={() => openLightbox(index)}
                        className={`gallery-item group relative aspect-square overflow-hidden bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                            }`}
                    >
                        <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-[var(--ac-charcoal)]/0 group-hover:bg-[var(--ac-charcoal)]/40 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-[var(--ac-pearl)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Title on hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[var(--ac-charcoal)]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-sm text-[var(--ac-pearl)] truncate">
                                {item.title}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {selectedIndex !== null && (
                <div className="fixed inset-0 z-50 bg-[var(--ac-obsidian)]/95 flex items-center justify-center">
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-3 text-[var(--ac-silver)] hover:text-[var(--ac-pearl)] z-10 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Previous Button */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-[var(--ac-silver)] hover:text-[var(--ac-pearl)] z-10 transition-colors"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-[var(--ac-silver)] hover:text-[var(--ac-pearl)] z-10 transition-colors"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Image Container */}
                    <div className="relative w-full max-w-5xl max-h-[80vh] mx-4">
                        <div className="relative aspect-video">
                            <Image
                                src={mockGalleryItems[selectedIndex].src}
                                alt={mockGalleryItems[selectedIndex].title}
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* Caption */}
                        <div className="text-center mt-4">
                            <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-[var(--ac-pearl)]">
                                {mockGalleryItems[selectedIndex].title}
                            </h3>
                            <p className="text-sm text-[var(--ac-silver)] mt-1">
                                {mockGalleryItems[selectedIndex].description}
                            </p>
                        </div>
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {mockGalleryItems.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedIndex(index)}
                                className={`relative w-12 h-12 overflow-hidden transition-opacity ${index === selectedIndex
                                        ? 'ring-2 ring-[var(--ac-gold)] opacity-100'
                                        : 'opacity-50 hover:opacity-75'
                                    }`}
                            >
                                <Image
                                    src={item.thumbnail}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Counter */}
                    <div className="absolute top-4 left-4 text-sm text-[var(--ac-silver)]">
                        {selectedIndex + 1} / {mockGalleryItems.length}
                    </div>
                </div>
            )}
        </>
    );
}

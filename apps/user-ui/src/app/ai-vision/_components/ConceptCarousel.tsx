'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConceptCarouselProps {
    images: string[];
    aspectRatio?: 'square' | 'video' | 'portrait';
}

export default function ConceptCarousel({ images, aspectRatio = 'video' }: ConceptCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const aspectRatioClass = {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
    }[aspectRatio];

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    if (!images || images.length === 0) {
        return (
            <div className={`${aspectRatioClass} bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] flex items-center justify-center`}>
                <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">No images available</p>
            </div>
        );
    }

    return (
        <div className="relative group">
            <div className={`relative ${aspectRatioClass}`}>
                <Image
                    src={images[currentIndex] || '/placeholder-concept.jpg'}
                    alt={`Concept image ${currentIndex + 1}`}
                    fill
                    className="object-cover"
                    priority={currentIndex === 0}
                />
            </div>

            {images.length > 1 && (
                <>
                    {/* Navigation Buttons */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handlePrevious}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleNext}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                className={`h-2 rounded-full transition-all ${index === currentIndex
                                        ? 'w-8 bg-[var(--ac-gold)]'
                                        : 'w-2 bg-white/60 dark:bg-black/60'
                                    }`}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

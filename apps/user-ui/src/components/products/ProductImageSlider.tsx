// src/components/products/ProductImageSlider.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

import { cn } from '@/lib/utils';
import { ImageInfo } from '@/types/products';

type PropType = {
  images: ImageInfo[];
  options?: any;
};

export const ProductImageSlider: React.FC<PropType> = ({ images, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, ...options },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full h-full overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {images.map((image, index) => (
          <div
            className="relative flex-[0_0_100%] h-full transition-opacity duration-700 ease-in-out"
            key={image.file_id}
            style={{ opacity: index === selectedIndex ? 1 : 0 }}
          >
            <Image
              src={image.url}
              alt={`Product image ${index + 1}`}
              className="object-cover"
              fill
              priority={index === 0} // Prioritize loading the first image
              quality={90}
            />
          </div>
        ))}
      </div>

      {/* Slider Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
                'h-2 w-2 rounded-full transition-all duration-300',
                index === selectedIndex ? 'w-4 bg-white' : 'bg-white/40'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
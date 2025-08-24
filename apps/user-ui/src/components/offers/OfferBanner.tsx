import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BannerData {
  imageUrl: string;
  title: string;
  description?: string;
  linkUrl: string;
}

export const OfferBanner: React.FC<{ banner: BannerData }> = ({ banner }) => {
  return (
    <div className="relative w-full h-[50vh] min-h-[350px] bg-neutral-900 text-white">
      <Image
        src={banner.imageUrl}
        alt={banner.title}
        fill
        className="object-cover opacity-40"
        priority // The main banner is likely to be the LCP element
      />
      <div className="absolute inset-0 flex items-center justify-center text-center p-8">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl drop-shadow-lg">
            {banner.title}
          </h1>
          {banner.description && (
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
              {banner.description}
            </p>
          )}
          <Button asChild size="lg" className="mt-8 font-semibold text-lg">
            <Link href={banner.linkUrl}>
              Shop The Collection
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
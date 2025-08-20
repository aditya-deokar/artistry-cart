import React from 'react';
import Image from 'next/image';

import { Globe, Twitter, Instagram, Facebook } from 'lucide-react';
import { StarRating } from '@/components/products/StarRating';

interface ShopData { // Define the full shop data type
  name: string;
  avatar: { url: string } | null;
  coverBanner: string | null;
  ratings: number;
  socialLinks: { platform: string; url: string }[];
  _count: { reviews: number };
}

const SocialIcon = ({ platform }: { platform: string }) => {
    if (platform.toLowerCase() === 'twitter') return <Twitter size={20} />;
    if (platform.toLowerCase() === 'instagram') return <Instagram size={20} />;
    if (platform.toLowerCase() === 'facebook') return <Facebook size={20} />;
    return <Globe size={20} />;
};

export const ShopHeader: React.FC<{ shop: ShopData }> = ({ shop }) => {
  return (
    <header className="relative h-[45vh] min-h-[350px] bg-neutral-900">
      {shop.coverBanner ? (
        <Image src={shop.coverBanner} alt={`${shop.name} cover banner`} fill className="object-cover opacity-30" priority />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-neutral-900"></div>
      )}

      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8">
        <div className="flex items-end gap-6">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-neutral-800 flex-shrink-0 bg-neutral-900">
            {shop.avatar && <Image src={shop.avatar.url} alt={`${shop.name} avatar`} fill className="rounded-full object-cover" />}
          </div>
          <div className="pb-4">
            <h1 className="font-display text-3xl md:text-5xl text-white">{shop.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <StarRating rating={shop.ratings} />
                <span className="text-sm text-primary/70">({shop._count.reviews} reviews)</span>
              </div>
              {shop.socialLinks && shop.socialLinks.length > 0 && (
                <div className="flex items-center gap-3 border-l border-neutral-700 pl-4">
                  {shop.socialLinks.map(link => (
                    <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-accent transition-colors">
                        <SocialIcon platform={link.platform} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
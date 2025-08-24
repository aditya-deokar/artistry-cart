// src/components/sections/ProductFeature.tsx
import { FC } from 'react';
import Image from 'next/image';

import { formatPrice } from '@/lib/formatters'; // Assuming you have this utility

import { Bounded } from '../common/Bounded';
import { FadeIn } from '../animations/FadeIn';
import { ButtonLink } from '../common/ButtonLink';
import { ArtProduct } from '@/types/products';

type ProductFeatureProps = {
  heading: string;
  description: string;
  product: ArtProduct; // Use the new ArtProduct type
};

export const ProductFeature: FC<ProductFeatureProps> = ({ heading, description, product }) => {
  // Select images dynamically from the product's image array
  const primaryImage = product.images.find(img => img !== null);
  // Use the second image for the highlight, or fall back to the primary if it doesn't exist
  const secondaryImage = product?.images[1] || primaryImage;

  return (
    <Bounded className="overflow-hidden bg-background py-16 md:py-24 h-fit">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-3 lg:grid-rows-[auto,auto] mb-16">

        {/* MAIN FEATURE IMAGE */}
        <FadeIn className="lg:col-span-2 lg:row-span-2">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={product.title}
              width={500}
              height={800}
              className="h-fit w-full object-cover rounded-md"
            />
          )}
        </FadeIn>

        {/* HEADING & DESCRIPTION BLOCK */}
        <FadeIn className="space-y-6 self-start bg-foreground/10 p-10 lg:col-start-3 lg:row-start-1">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            {heading}
          </h2>
          <div className="max-w-lg text-base text-primary/90">
            <p>{description}</p>
          </div>
        </FadeIn>

        {/* PRODUCT HIGHLIGHT BOX */}
        <FadeIn className="relative self-end bg-foreground/10 lg:col-start-3" vars={{ delay: 0.3 }}>
          {secondaryImage && (
            <Image
              src={secondaryImage.url}
              alt={`A close-up of ${product.title}`}
              width={400}
              height={400}
              className="mx-auto -mt-10 w-2/3 -rotate-12 transition-transform duration-300 hover:rotate-0 hover:scale-105"
            />
          )}

          <div className="flex justify-between p-10 pt-4">
            <div className="space-y-1">
              <h3 className="font-display text-4xl">{product.title}</h3>
              {/* Use the dynamic subcategory */}
              <p className="mt-2 text-gray-400">{product.subcategory}</p>
              <ButtonLink
                href={`/products/${product.slug}`}
                variant="Secondary"
                className="mt-6"
              >
                Shop Now
              </ButtonLink>
            </div>
            {/* Use sale_price if available, otherwise regular_price */}
            <p className="mt-4 text-primary/90 font-medium" aria-label="Product price">
              <span>{formatPrice(product.sale_price ?? product.regular_price)}</span>
            </p>
          </div>
        </FadeIn>
      </div>
    </Bounded>
  );
};
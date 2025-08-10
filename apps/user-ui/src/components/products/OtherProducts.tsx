// src/components/products/OtherProducts.tsx
import { FC } from 'react';
import Image from 'next/image';

import { formatPrice } from '@/lib/formatters';

import { TransitionLink } from '../common/TransitionLink';
import { ArtProduct } from '@/types/products';

type OtherProductsProps = {
  products: ArtProduct[]; 
};

export const OtherProducts: FC<OtherProductsProps> = ({ products }) => {
  return (
    <div className="container mx-auto px-4">
      <h2 className="font-display mb-8 text-3xl md:text-4xl">
        You May Also Like
      </h2>

      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const primaryImage = product.image.find(img => img !== null);
          return (
            <li key={product.slug}> {/* Use the database ID for the key */}
              <TransitionLink href={`/products/${product.slug}`}>
                <div className="group">
                  <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    {primaryImage ? (
                       <Image
                         src={primaryImage.url}
                         alt={product.title}
                         fill
                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                         className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                       />
                    ) : (
                        <div className="w-full h-full bg-neutral-800"></div>
                    )}
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="font-display text-2xl">{product.title}</h3>
                    <p className="text-sm text-primary/90">{product.subcategory}</p>
                    <p className="text-base font-light">
                      {formatPrice(product.sale_price ?? product.regular_price)}
                    </p>
                  </div>
                </div>
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
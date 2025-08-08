// src/components/products/ProductCard.tsx
import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiPlus } from 'react-icons/hi2';
import { FadeIn } from '../animations/FadeIn';
import { ButtonLink } from '../common/ButtonLink';
import { ProductAttributes } from './ProductAttributes';
import type { Product } from '@/lib/data';

type ProductCardProps = {
  product: Product;
};

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
  return (
    <FadeIn
      className="relative z-10 grid min-h-[85vh] w-full items-center justify-items-start border border-white/10 p-4 text-left md:p-14 lg:p-20"
      vars={{ duration: 2.5 }}
      start="top 50%"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src='https://plus.unsplash.com/premium_photo-1676752176152-49612d2944e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          alt={product.featureImage.alt}
          className="object-cover opacity-40 md:opacity-100"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={90}
        />
      </div>

      <FadeIn
        className="relative z-10 grid translate-y-8"
        vars={{ duration: 2, delay: 0.1 }}
        start="top 50%"
      >
        <h3 className="font-display mb-3 text-5xl md:text-6xl lg:text-7xl">
          {product.title}
        </h3>
        <p className="mb-8 text-base font-semibold text-primary/90">Eau de Parfum</p>
        <div className="mb-10 max-w-md text-lg text-primary/90">
          <p>{product.description}</p>
        </div>
        <ProductAttributes
          scentProfile={product.scentProfile}
          mood={product.mood}
          className="mb-10"
        />
        <div className="flex flex-wrap gap-4">
          <ButtonLink href={`/products/${product.slug}`} variant="Secondary">
            Discover
          </ButtonLink>
          <ButtonLink href="#" variant="Primary">
            <HiPlus className="mr-2" /> <span>Add to Bag</span>
          </ButtonLink>
        </div>
      </FadeIn>
    </FadeIn>
  );
};
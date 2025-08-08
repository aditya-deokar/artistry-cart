// src/components/products/ProductDisplay.tsx
import { FC } from 'react';
import Image from 'next/image';
import { HiPlus } from 'react-icons/hi2';
import { FadeIn } from '../animations/FadeIn';
import { RevealText } from '../animations/RevealText';
import { Bounded } from '../common/Bounded';
import { ButtonLink } from '../common/ButtonLink';
import { ProductAttributes } from './ProductAttributes';
import type { Product } from '@/lib/data';
import { formatPrice } from '@/lib/formatters';

type ProductDisplayProps = {
  product: Product;
};

export const ProductDisplay: FC<ProductDisplayProps> = ({ product }) => {
  return (
    <Bounded>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <FadeIn className="relative aspect-square w-full">
                <Image
                    src='https://plus.unsplash.com/premium_photo-1676752176152-49612d2944e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    alt={product.bottleImage.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </FadeIn>
            <div className="relative z-10">
                <RevealText
                    text={product.title}
                    as="h1"
                    className="font-display mb-3 text-5xl md:text-6xl lg:text-7xl"
                />
                <p className="mb-4 text-base font-semibold text-gray-300">Eau de Parfum</p>
                <p className="mb-8 text-2xl font-light">{formatPrice(product.price)}</p>
                <div className="mb-10 max-w-md text-lg text-gray-300">
                    <p>{product.longDescription}</p>
                </div>
                <ProductAttributes
                    scentProfile={product.scentProfile}
                    mood={product.mood}
                    className="mb-10"
                />
                <div className="flex flex-wrap gap-4">
                    <ButtonLink href="#" variant="Primary">
                        <HiPlus className="mr-2" /> <span>Add to Bag</span>
                    </ButtonLink>
                </div>
            </div>
        </div>
    </Bounded>
  );
};
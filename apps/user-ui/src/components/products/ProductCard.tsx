import { FC } from 'react';
import { HiOutlineShoppingBag } from 'react-icons/hi2';
import Link from 'next/link';

import { FadeIn } from '../animations/FadeIn';
import { ButtonLink } from '../common/ButtonLink';
import { ProductImageSlider } from './ProductImageSlider'; 
import { ArtProduct, CustomSpecification, ImageInfo } from '@/types/products';


const ProductSpecs: FC<{ specs: CustomSpecification[], className?: string }> = ({ specs, className }) => {
  if (!specs || specs.length === 0) return null;


  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {specs.slice(0, 4).map((spec) => ( // Show up to 4 key specs
          <div key={spec.name} className="border-l-2 border-primary pl-3">
            <p className="text-sm font-semibold text-primary/80">{spec.name}</p>
            <p className="text-base font-medium text-white">{spec.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

type ProductCardProps = {
  product: ArtProduct;
};

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
  // CORRECTED: Use `product.images` instead of `product.image`
  const validImages = product.image?.filter((img:any): img is ImageInfo => !!img);

  return (
    <FadeIn
      className="relative z-10 grid min-h-[85vh] w-full items-center justify-items-start border border-white/10 p-4 text-left md:p-14 lg:p-20"
      vars={{ duration: 2.5 }}
      start="top 50%"
    >
      {/* BACKGROUND SLIDER */}
      <div className="absolute inset-0 z-0">
        {validImages?.length > 0 && <ProductImageSlider images={validImages} />}
         {/* Gradient Overlay for Text Readability */}
         <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
      </div>

      {/* CONTENT AREA */}
      <FadeIn
        className="relative z-20 grid max-w-xl translate-y-8"
        vars={{ duration: 2, delay: 0.1 }}
        start="top 50%"
      >
        <h3 className="font-display mb-3 text-5xl md:text-6xl lg:text-7xl">
          {product.title}
        </h3>
        {/* CORRECTED: Use `product.subCategory` (camelCase) */}
        <p className="mb-2 text-base font-semibold uppercase tracking-wider text-primary/90">
          {product.subCategory}
        </p>

        {/* NEW: Added Artist/Shop Name, which is a key part of the new schema */}
        <p className="mb-8 text-lg font-medium text-primary/80 hover:text-white transition-colors">
            {/* By <Link href={`/artist/${product.Shop.id}`}>{product.Shop.name}</Link> */}Shop Name
        </p>

        <div className="mb-10 max-w-lg text-lg text-primary/90">
          <p>{product.description}</p>
        </div>

        <ProductSpecs
          specs={product.custom_specifications}
          className="mb-10"
        />

        <div className="flex flex-wrap items-center gap-4">
          <ButtonLink href={`/product/${product.slug}`} variant="Secondary">
            Discover Details
          </ButtonLink>
          <ButtonLink href="/cart" variant="Primary">
            <HiOutlineShoppingBag className="mr-2 h-5 w-5" />
            <span>Add to Cart</span>
          </ButtonLink>
        </div>
      </FadeIn>
    </FadeIn>
  );
};
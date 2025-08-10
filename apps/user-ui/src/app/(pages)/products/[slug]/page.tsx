// src/app/products/[slug]/page.tsx

import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
// Assume you have updated data fetching functions
import { getProductBySlug, getOtherProducts } from '@/lib/data';
import { formatPrice } from '@/lib/formatters';
import { Bounded } from '@/components/common/Bounded';
import { OtherProducts } from '@/components/products/OtherProducts';
import { ButtonLink } from '@/components/common/ButtonLink';


import { FC } from 'react';
import { ArtProduct, CustomSpecification } from '@/types/products';
import { ProductGallery } from '@/components/products/ProductGallery';

// New component for displaying specs
const ProductSpecifications: FC<{ specs: CustomSpecification[] }> = ({ specs }) => (
    <div className="space-y-3">
        {specs.map(spec => (
            <div key={spec.name} className="flex justify-between border-b border-neutral-800 pb-2 text-sm">
                <span className="text-primary/70">{spec.name}</span>
                <span className="font-medium">{spec.value}</span>
            </div>
        ))}
    </div>
);

type ProductPageProps = {
  params: {
    slug: string;
  };
};

// export async function generateStaticParams() {
//   const products: ArtProduct[] = allProducts;
//   return products.map((product) => ({ slug: product.slug }));
// }

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getProductBySlug(params.slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const primaryImage = product.image.find(img => img !== null);

  return {
    title: `${product.title} - Artistry Cart`,
    description: product.description, 
    openGraph: {
      title: `${product.title} - Artistry Cart`,
      description: product.description,
      images: primaryImage ? [{ url: primaryImage.url, width: 1200, height: 630 }] : [],
    },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const product = getProductBySlug(slug);
  const otherProducts = getOtherProducts(slug);

  if (!product) {
    notFound();
  }

  const validImages = product.image.filter(img => img !== null);

  return (
    <Bounded className="py-10 md:py-16 mt-6">
      <div className="grid grid-cols-1 items-start gap-12 pb-10 lg:grid-cols-2 lg:gap-20 mb-20">
        
        <ProductGallery productTitle={product.title} images={validImages} />

        <div className="text-primary">
          <h1 className="font-display mb-4 border-b border-neutral-700 pb-2 text-4xl md:text-5xl">
            {product.title}
          </h1>

          <div className="space-y-6">
            <p className="text-md font-semibold uppercase tracking-wider text-primary/80">{product.subcategory}</p>

            <div
              className="prose prose-invert prose-p:text-primary/90 text-lg"
              dangerouslySetInnerHTML={{ __html: product.detailed_desc }}
            />

            <ProductSpecifications specs={product.custom_specifications} />
            
            <div className="flex items-baseline gap-4 pt-4">
               <span className="text-4xl font-light text-red-500">
                    {formatPrice(product.sale_price ?? product.regular_price)}
               </span>
               {product.sale_price && (
                   <span className="text-2xl text-primary/50 line-through">
                       {formatPrice(product.regular_price)}
                   </span>
               )}
            </div>
            
            <ButtonLink className="w-full uppercase py-3" href="#" variant="Secondary">
               Add to Cart
            </ButtonLink>

            {/* --- Reviews Section (static example) --- */}
          </div>
        </div>
      </div>

      <OtherProducts products={otherProducts} />
    </Bounded>
  );
}
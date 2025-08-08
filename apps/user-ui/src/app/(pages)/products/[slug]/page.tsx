// src/app/products/[slug]/page.tsx

import { type Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { HiStar } from "react-icons/hi2";

import { getProductBySlug, getOtherProducts, products as allProducts } from "@/lib/data";
import { formatPrice } from "@/lib/formatters";
import { Bounded } from "@/components/common/Bounded";
import { ProductAttributes } from "@/components/products/ProductAttributes";
import { OtherProducts } from "@/components/products/OtherProducts";
import { ButtonLink } from "@/components/common/ButtonLink";




type ProductPageProps = {
  params: {
    slug: string;
  };
};

/**
 * Generates static pages for all products at build time.
 * This improves performance and SEO.
 */
export async function generateStaticParams() {
  // We get all products from our local data source
  const products = allProducts;
  return products.map((product) => ({
    slug: product.slug,
  }));
}

/**

 * Generates metadata for the page dynamically based on the product.
 * This is crucial for SEO and sharing on social media.
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getProductBySlug(params.slug);

  if (!product) {
    return {
        title: "Product Not Found",
        description: "The requested product does not exist."
    };
  }

  return {
    title: `${product.title} - Artistry Cart`,
    description: `Discover ${product.title}, an exquisite fragrance from Artistry Cart. ${product.description}`,
    openGraph: {
      title: `${product.title} - Artistry Cart`,
      description: product.description,
      images: [
        {
          url: product.featureImage.url, // Using a high-quality feature image for sharing
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}


// The main page component
export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const product = getProductBySlug(slug);
  const otherProducts = getOtherProducts(slug);

  // If no product is found for the given slug, render the 404 page.
  if (!product) {
    notFound();
  }

  return (
    <Bounded className="py-10 md:py-16 mt-6 ">
      <div className="grid grid-cols-1 items-start gap-12 pb-10 lg:grid-cols-2 lg:gap-20 mb-20">
        
        {/* Image Section with Reflection Effect */}
        <div className="relative flex justify-center">
          {/* This image creates the reflection effect */}
          <Image
            src='https://plus.unsplash.com/premium_photo-1676752176152-49612d2944e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            alt={`${product.title} bottle reflection`}
            width={600}
            height={600}
            priority
            className="absolute top-[95%] -scale-y-100 opacity-20 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0)_50%,rgba(0,0,0,1)_100%)]"
          />
          {/* The main product image */}
          <Image
            src='https://plus.unsplash.com/premium_photo-1676752176152-49612d2944e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            alt={product.bottleImage.alt}
            width={600}
            height={600}
            priority
            className="relative"
          />
        </div>

        {/* Product Info Section */}
        <div className="text-primary">
          <h1 className="font-display mb-4 border-b border-neutral-700 pb-2 text-4xl md:text-5xl">
            {product.title}
          </h1>

          <div className="space-y-6">
            <p className="text-md font-semibold">Eau de Parfum Spray</p>

            {/* The detailed product description */}
            <p className="text-lg text-primary/90">{product.longDescription}</p>

            {/* Reusable component for product features */}
            <ProductAttributes
              mood={product.mood}
              scentProfile={product.scentProfile}
            />
            
            <p className="pt-4 text-4xl font-light">
              {formatPrice(product.price)}
            </p>

            
            <ButtonLink className="w-full uppercase py-3" href={`/products/${product.slug}`} variant="Secondary">
               Add to Bag
            </ButtonLink>

            {/* Reviews Section */}
            <div className="flex items-center gap-4 border-t border-neutral-700 pt-6">
              <a href="#" className="hover:text-neutral-300">
                763 total reviews
              </a>
              <div className="flex" aria-label="Rating: 4.4 out of 5 stars">
                {[...Array(4)].map((_, index) => (
                  <HiStar className="size-5 text-white" key={index} />
                ))}
                <HiStar className="size-5 text-neutral-500" />
              </div>
              <span>4.4/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Renders the "You May Also Like" section */}
      <OtherProducts products={otherProducts} />
    </Bounded>
  );
}
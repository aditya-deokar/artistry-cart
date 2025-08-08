// src/components/sections/ProductFeature.tsx
import { FC } from "react";
import Image from "next/image";

import { formatPrice } from "@/lib/formatters";
import type { Product } from "@/lib/data";
import { Bounded } from "../common/Bounded";
import { FadeIn } from "../animations/FadeIn";
import { ButtonLink } from "../common/ButtonLink";

type ProductFeatureProps = {
  heading: string;
  description: string;
  product: Product;
  image: {
      url: string;
      alt: string;
  }
};

export const ProductFeature: FC<ProductFeatureProps> = ({ heading, description, product, image }) => {
  return (
    <Bounded className="overflow-hidden bg-background py-16  md:py-24 h-fit">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-3 lg:grid-rows-[auto,auto] mb-16">
        
        <FadeIn className="lg:col-span-2 lg:row-span-2">
          <Image
            src='https://plus.unsplash.com/premium_photo-1676752176152-49612d2944e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            alt={image.alt}
            width={500}
            height={800}
            className="h-fit w-full object-cover"
          />
        </FadeIn>

        <FadeIn className="space-y-6 self-start bg-foreground/10 p-10 lg:col-start-3 lg:row-start-1">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            {heading}
          </h2>
          <div className="max-w-lg text-base text-primary/90">
            <p>{description}</p>
          </div>
        </FadeIn>

        <FadeIn className="relative self-end bg-foreground/10 lg:col-start-3" vars={{ delay: 0.3 }}>
          <Image
            src='https://plus.unsplash.com/premium_photo-1676752176152-49612d2944e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            alt={product.bottleImage.alt}
            width={400}
            height={400}
            className="mx-auto -mt-10 w-2/3 -rotate-12 md:-mt-20"
          />

          <div className="flex justify-between p-10 pt-4">
            <div className="space-y-1">
              <h3 className="font-display text-4xl">{product.title}</h3>
              <p className="mt-2 text-gray-400">Eau de Parfum</p>
              <ButtonLink
                href={`/products/${product.slug}`}
                variant="Secondary"
                className="mt-6"
              >
                Shop Now
              </ButtonLink>
            </div>
            <p className="mt-4 text-primary/90" aria-label="Product price">
              <span>{formatPrice(product.price)}</span>
            </p>
          </div>
        </FadeIn>
      </div>
    </Bounded>
  );
};
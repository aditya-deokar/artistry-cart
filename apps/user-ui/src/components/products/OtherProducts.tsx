// src/components/products/OtherProducts.tsx
import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/formatters";
import type { Product } from "@/lib/data";
import { TransitionLink } from "../common/TransitionLink";

type OtherProductsProps = {
  products: Product[];
};

export const OtherProducts: FC<OtherProductsProps> = ({ products }) => {
  return (
    <div className="container mx-auto px-4">
      <h2 className="font-display mb-8 text-3xl text-white md:text-4xl">
        You May Also Like
      </h2>

      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <TransitionLink href={`/products/${product.slug}`}>
            <div  className="group">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src='https://plus.unsplash.com/premium_photo-1676752176152-49612d2944e1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                  alt={product.bottleImage.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-4 space-y-1 text-white">
                <h3 className="font-display text-2xl">{product.title}</h3>
                <p className="text-sm text-neutral-400">Eau de Parfum</p>
                <p className="text-base font-light">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>
            </TransitionLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
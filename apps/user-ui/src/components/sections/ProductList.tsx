// src/components/sections/ProductList.tsx
import { FC } from "react";

import { ProductCard } from "../products/ProductCard"; // We will create this
import type { Product } from "@/lib/data";
import { Bounded } from "../common/Bounded";
import { RevealText } from "../animations/RevealText";

export type ProductListProps = {
  eyebrow: string;
  heading: string;
  body: string;
  products: Product[];
};

export const ProductList: FC<ProductListProps> = ({ eyebrow, heading, body, products }) => {
  return (
    <Bounded className="space-y-8 bg-background py-16 text-center  md:py-24">
      <div className="mx-auto space-y-8">
        <p className="text-sm font-light tracking-[0.2em] uppercase">{eyebrow}</p>
        <RevealText
          text={heading}
          as="h2"
          align="center"
          duration={1.5}
          staggerAmount={0.3}
          className="font-display text-5xl uppercase sm:text-6xl md:text-7xl lg:text-8xl"
        />

        <div className="mx-auto max-w-2xl text-lg text-balance text-primary/40">
          <p>{body}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Bounded>
  );
};
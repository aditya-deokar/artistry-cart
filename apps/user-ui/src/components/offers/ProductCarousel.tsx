import React from 'react';

 
import { ArtProduct } from '@/types/products';
import { ProductCard } from '../shop/ProductCard';

type ProductCarouselProps = {
  title: string;
  products: ArtProduct[];
};

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, products }) => {
  return (
    <div>
      <h2 className="font-display text-3xl md:text-4xl mb-8">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        
        {products.map(product => (
            <ProductCard key={product.id} product={product} />
           
        ))}
      </div>
    </div>
  );
};
// src/components/shop/ProductGrid.tsx
'use client';
import { motion } from 'framer-motion';

import { ArtProduct } from '@/types/products';
import { ProductCard } from './ProductCard';



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const ProductGrid = ({ products }: { products: ArtProduct[] }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
    >
      {products.map(product => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </motion.div>
  );
};
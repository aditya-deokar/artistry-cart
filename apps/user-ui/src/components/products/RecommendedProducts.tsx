
'use client';

import { FC } from 'react';
import { ProductList } from '../sections/ProductList';
import useRecommendations from '@/hooks/useRecommendations';
import { ProductCard } from '../shop/ProductCard'; // The smaller card
import { RevealText } from '../animations/RevealText';

interface RecommendedProductsProps {
    limit?: number;
    variant?: 'list' | 'grid';
    title?: string;
    description?: string;
}

export const RecommendedProducts: FC<RecommendedProductsProps> = ({
    limit,
    variant = 'list',
    title = "Recommended Picks",
    description = "Curated selections based on your unique taste and style."
}) => {
    const { data: products, isLoading, isError } = useRecommendations();

    if (isLoading || isError || !products || products.length === 0) {
        return null; // Or a skeleton/loader if desired
    }

    const displayProducts = limit ? products.slice(0, limit) : products;

    if (variant === 'grid') {
        return (
            <div className="space-y-8">
                <div className="text-left space-y-2">
                    <h3 className="font-display text-2xl md:text-3xl text-primary">{title}</h3>
                    <p className="text-primary/60 max-w-2xl">{description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayProducts.map((product:any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <ProductList
            eyebrow="Just for You"
            heading={title}
            body={description}
            products={displayProducts}
        />
    );
};

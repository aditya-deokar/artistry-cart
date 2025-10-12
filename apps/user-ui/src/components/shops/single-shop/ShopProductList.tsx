'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
// import { ProductCard } from '@/components/products/ProductCard'; 
import { Pagination } from '@/components/shop/Pagination';
import { ArtProduct } from '@/types/products';
import { ProductCard } from '@/components/shop/ProductCard';

interface ApiResponse {
    products: ArtProduct[];
    pagination: { totalPages: number; currentPage: number; };
}

export const ShopProductList: React.FC<{ shopId: string; totalProducts: number }> = ({ shopId, totalProducts }) => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ['shopProducts', shopId, page],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/api/shops/${shopId}/products?page=${page}`);
      return res.data.data; // Access data from the nested data property in the new API response
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div>
        <h2 className="font-display text-3xl mb-6">Products ({totalProducts})</h2>
        {isLoading && <p>Loading products...</p> /* Replace with a proper skeleton */}
        {isError && <p>Could not load products.</p>}
        
        {data?.products && data.products.length > 0 ? (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.products.map(product => <ProductCard key={product.id} product={product} />)}
                   
                </div>
                {data.pagination && data.pagination.totalPages > 1 && (
                    <div className="mt-12">
                        <Pagination 
                            currentPage={page}
                            totalPages={data.pagination.totalPages}
                            onPageChange={(newPage) => setPage(newPage)}
                        />
                    </div>
                )}
            </>
        ) : (
            <p>This shop has not listed any products yet.</p>
        )}
    </div>
  );
};
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';

import { ShopFilter } from '@/components/shops/all-shops/ShopFilter';
import { ShopGrid } from '@/components/shops/all-shops/ShopGrid';

import { Bounded } from '@/components/common/Bounded';
import { Pagination } from '@/components/shop/Pagination';
import { ShopCardData } from '@/components/shops/all-shops/ShopCard';

// Define the API response structure for type safety
interface AllShopsApiResponse {
  shops: (ShopCardData & { id: string })[]; // Ensure id is included in the shop data
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
  };
}

export default function AllShopsPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');

  // Fetch available categories from the API
  const { data: categoryData } = useQuery<string[]>({
    queryKey: ['shopCategories'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/product/api/shops/categories');
        return res.data.data.categories || ["prints", "sculptures", "paintings", "crafts"];
      } catch (error) {
        console.error("Failed to fetch shop categories:", error);
        return ["prints", "sculptures", "paintings", "crafts"]; // Fallback categories
      }
    },
  });
  
  const availableCategories = categoryData || ["prints", "sculptures", "paintings", "crafts"];

  // Fetch all shops based on the current page and category state
  const { data, isLoading, isError } = useQuery<AllShopsApiResponse>({
    queryKey: ['shops', page, category],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      
      // Only add category parameter if it's not 'all'
      if (category !== 'all') {
        params.append('category', category);
      }
      
      const res = await axiosInstance.get(`/product/api/shops?${params.toString()}`);
      return res.data.data; // Access data from the nested data property in the new API response
    },
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0); // Scroll to top for better UX
  };
  
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1); // Reset to page 1 whenever the filter changes
  };

  if (isError) {
    return <div className="text-center py-40">Failed to load shops. Please try again later.</div>;
  }

  return (
    <Bounded>
      <div className="py-16 text-center">
        <h1 className="font-display text-5xl">Discover Our Artists</h1>
        <p className="mt-4 text-lg text-primary/70 max-w-2xl mx-auto">
          Browse through our curated collection of talented artists and creators. Find unique pieces and support independent art.
        </p>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* --- Placement for ShopFilter --- */}
        <aside className="lg:col-span-1">
          <ShopFilter
            categories={availableCategories}
            activeCategory={category}
            onCategoryChange={handleCategoryChange}
          />
        </aside>

        {/* --- Placement for ShopGrid and Pagination --- */}
        <section className="lg:col-span-3">
          <ShopGrid shops={data?.shops} isLoading={isLoading} />
          
          {data?.pagination && data.pagination.totalPages > 1 && !isLoading && (
            <div className="mt-16">
              <Pagination
                currentPage={data.pagination.currentPage}
                totalPages={data.pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </section>
      </main>
    </Bounded>
  );
}
import axiosInstance from '@/utils/axiosinstance'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

const ProductPage = () => {

    const { data: products , isLoading, isError} = useQuery({
        queryKey: ['products'],
        queryFn: async()=>{
            const res= await axiosInstance.get('/product/api/get-all-products?page=1&limit=10');
            return res.data.products;
        },
        staleTime: 1000* 60* 2,
    });

    const { data: latestProducts , isLoading: latestProductsIsLoading, isError: latestProductsIsError} = useQuery({
        queryKey: ['latest-products'],
        queryFn: async()=>{
            const res= await axiosInstance.get('/product/api/get-all-products?page=1&limit=10&type=latest');
            return res.data.products;
        },
        staleTime: 1000* 60* 2,
    });



  return (
    <div>
       
    </div>
  )
}

export default ProductPage
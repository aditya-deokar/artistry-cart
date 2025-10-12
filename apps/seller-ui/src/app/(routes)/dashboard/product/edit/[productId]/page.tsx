'use client'

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CashOnDeliverySelector from '@/shared/components/cash-on-delivery';
import ColorSector from '@/shared/components/color-selector';
import CustomProperties from '@/shared/components/custom-properties';
import CustomSpecifications from '@/shared/components/custom-specifications';
import ImagePlaceholder from '@/shared/components/image-placeholders';
import Input from '@/shared/components/inputs/input';
import { TextEditor } from '@/shared/components/rich-editor';
import SizeSelector from '@/shared/components/size-selector';
import { useProductCategories, useProductDetails } from '@/hooks/useProducts';
import axiosInstance from '@/utils/axiosinstance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Interface for uploaded images matching our API requirements
export interface UploadedImages {
    file_id: string,
    url: string
}

// Interface for our form data that matches the expected API format
export interface ProductFormData {
    title: string;
    description: string;
    detailed_description: string;
    tags: string;
    warranty: string;
    category: string;
    subCategory: string;
    slug: string;
    regular_price: number;
    sale_price: number;
    stock: number;
    colors: string[];
    sizes: string[];
    cash_on_delivery: boolean;
    status: string;
    brand: string;
    video_url: string;
    custom_specifications: any[];
    images?: UploadedImages[];
}

// Type for product from API - using "any" for flexibility with the actual response
type ProductApiResponse = any;

const EditProduct = () => {
    const params = useParams<{ productId: string }>();
    const productId = params.productId;
    const router = useRouter();
    const queryClient = useQueryClient();
    
    const [openImageModal, setOpenImageModal] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [image, setImage] = useState<(UploadedImages | null)[]>([null]);
    const [selectedImage, setSelectedImage] = useState('');
    
    // Fetch product data
    const { data: product, isLoading: isProductLoading } = useProductDetails(productId);
    
    // Fetch categories
    const { data: categories = [], isLoading: isCategoriesLoading } = useProductCategories();
    
    // State for subcategories (since the API returns only main categories)
    const [subcategories, setSubcategories] = useState<string[]>([]);
    
    // For simplicity, let's define some common subcategories for demonstration
    // In a real app, you would fetch these from your API
    const getSubcategories = useMemo(() => {
        return (category: string): string[] => {
            const subcategoriesMap: Record<string, string[]> = {
                'Painting': ['Oil', 'Acrylic', 'Watercolor', 'Digital'],
                'Sculpture': ['Wood', 'Metal', 'Clay', 'Stone'],
                'Jewelry': ['Necklace', 'Earrings', 'Rings', 'Bracelets'],
                'Photography': ['Nature', 'Portrait', 'Urban', 'Abstract'],
                'Digital Art': ['2D', '3D', 'Animation', 'Mixed Media'],
            };
            
            return subcategoriesMap[category] || [];
        };
    }, []);

    // Form setup
    const { register, control, watch, setValue, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
        defaultValues: {
            title: '',
            description: '',
            detailed_description: '',
            tags: '',
            warranty: '',
            category: '',
            subCategory: '',
            slug: '',
            regular_price: 0,
            sale_price: 0,
            stock: 0,
            colors: [],
            sizes: [],
            cash_on_delivery: true,
            status: 'Active',
            brand: '',
            video_url: '',
            custom_specifications: [],
        }
    });

    // Watch for key fields
    const selectedCategory = watch("category");

    // Update subcategories when category changes
    useEffect(() => {
        if (selectedCategory) {
            setSubcategories(getSubcategories(selectedCategory));
        }
    }, [selectedCategory, getSubcategories]);

    // Update form when product data is loaded
    useEffect(() => {
        if (product) {
            console.log('Product data loaded:', product);
            
            // Cast product to any to access all properties
            const productData = product as ProductApiResponse;
            
            // Extract tags (if they exist)
            let tagsString = '';
            if (Array.isArray(productData.tags)) {
                tagsString = productData.tags.join(', ');
            }
            
            // Gather all form fields with fallbacks for missing properties
            const formData: ProductFormData = {
                title: productData.title || '',
                description: productData.description || '',
                detailed_description: productData.detailed_description || '',
                tags: tagsString,
                warranty: productData.warranty || '',
                category: productData.category || '',
                subCategory: productData.subCategory || '',
                slug: productData.slug || '',
                regular_price: productData.regular_price || 0,
                sale_price: productData.sale_price || 0,
                stock: productData.stock || 0,
                colors: Array.isArray(productData.colors) ? productData.colors : [],
                sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
                cash_on_delivery: productData.cash_on_delivery !== false,
                status: productData.status || 'Active',
                brand: productData.brand || '',
                video_url: productData.video_url || '',
                custom_specifications: productData.custom_specifications || [],
            };

            // Reset form with gathered data
            reset(formData);
            
            // Set each field individually to ensure values are applied
            Object.keys(formData).forEach(key => {
                setValue(key as keyof ProductFormData, formData[key as keyof typeof formData]);
            });
            
            // Update subcategories if a category is selected
            if (productData.category) {
                setSubcategories(getSubcategories(productData.category));
            }
            
            // Set images
            if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
                const productImages = productData.images.map((img: any) => ({
                    file_id: img.file_id,
                    url: img.url
                }));
                
                if (productImages.length < 8) {
                    productImages.push(null); // Add an empty placeholder if less than 8 images
                }
                
                setImage(productImages);
                // Set images without nulls for the form data
                const validImages = productImages.filter(img => img !== null) as UploadedImages[];
                setValue('images', validImages);
            }
        }
    }, [product, reset, setValue, getSubcategories]);

    // Handle form submission
    const updateProductMutation = useMutation({
        mutationFn: async (data: ProductFormData) => {
            return await axiosInstance.put(`/product/api/products/${productId}`, data);
        },
        onSuccess: () => {
            toast.success("Product updated successfully!");
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
            queryClient.invalidateQueries({ queryKey: ['seller-products'] });
            setIsChanged(false);
            router.push('/dashboard/all-products');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update product");
        }
    });

    const onSubmit = async (data: ProductFormData) => {
        // Convert comma-separated tags to array
        const tagsArray = data.tags.split(',').map((tag: string) => tag.trim());
        
        // Create a new object with the processed data
        const submitData = {
            ...data,
            tags: tagsArray,
            // Ensure we only submit non-null images
            images: image.filter(img => img !== null) as UploadedImages[]
        };
        
        updateProductMutation.mutate(submitData as ProductFormData);
    };

    // Image handling functions
    const convertFileBase64 = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageChange = async (file: File | null, index: number) => {
        if (!file) return;

        try {
            const fileName = await convertFileBase64(file);
            const response = await axiosInstance.post("/product/api/upload-product-image", { fileName });

            const uploadedImage: UploadedImages = {
                file_id: response.data.file_id,
                url: response.data.file_url,
            };

            const updatedImages = [...image];
            updatedImages[index] = uploadedImage;

            if (index === image.length - 1 && updatedImages.length < 8) {
                updatedImages.push(null);
            }

            setImage(updatedImages);
            // Filter out nulls for the form value
            setValue("images", updatedImages.filter(img => img !== null) as UploadedImages[]);
            setIsChanged(true);
        } catch (error) {
            console.log(error);
            toast.error("Failed to upload image");
        }
    };

    const handleRemoveImage = async (index: number) => {
        const updatedImages = [...image];
        const imageToDelete = updatedImages[index];

        if (!imageToDelete || typeof imageToDelete !== "object") return;

        try {
            await axiosInstance.delete("/product/api/delete-product-image", {
                data: { fileId: imageToDelete.file_id },
            });

            updatedImages.splice(index, 1);

            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null);
            }

            setImage(updatedImages);
            // Filter out nulls for the form value
            setValue("images", updatedImages.filter(img => img !== null) as UploadedImages[]);
            setIsChanged(true);
        } catch (error) {
            toast.error("Failed to delete image. Please try again.");
        }
    };

    const countWords = (text: string) => text.trim().split(/\s+/).length;

    if (isProductLoading) {
        return (
            <div className="p-8 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-96" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div>
                        <Skeleton className="h-64 w-full" />
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // Safely access product data with type casting
    const productData = product as ProductApiResponse;

    return (
        <form className='w-full mx-auto shadow-md p-8 rounded-lg'
            onSubmit={handleSubmit(onSubmit)}
        >
            {/* Heading and Breadcrumbs */}
            <h2 className='text-2xl py-2 font-semibold font-poppins'>Edit Product</h2>
            <div className='flex items-center mb-6'>
                <Link href={'/dashboard'} className='cursor-pointer text-secondary'>Dashboard</Link>
                <ChevronRight size={20} className='opacity-[0.8]' />
                <Link href={'/dashboard/all-products'} className='cursor-pointer text-secondary'>All Products</Link>
                <ChevronRight size={20} className='opacity-[0.8]' />
                <span>Edit Product</span>
            </div>

            {/* Content Layout */}
            <div className="py-4 w-full flex flex-col lg:flex-row gap-6">
                {/* Left side- Image Upload section */}
                <div className='lg:w-[35%]'>
                    <div className='grid grid-cols-2 gap-3 mt-0'>
                        {image?.map((img, index) => (
                            <div
                                key={index}
                                className={index === 0 ? 'col-span-2' : ''}
                            >
                                <ImagePlaceholder
                                    setOpenImageModal={setOpenImageModal}
                                    size='765 x 850'
                                    small={index !== 0}
                                    index={index}
                                    onImageChange={handleImageChange}
                                    onRemove={handleRemoveImage}
                                    setSelectedImage={setSelectedImage}
                                    selectedImage={selectedImage}
                                    image={image}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Form inputs */}
                <div className='lg:w-[65%]'>
                    <div className='w-full flex flex-col md:flex-row gap-6'>
                        <div className='w-full md:w-1/2 flex flex-col'>
                            {/* Product Title Input */}
                            <div className=''>
                                <Input 
                                    label='Product Title'
                                    placeholder='Enter product title'
                                    {...register("title", { required: "Title is required" })}
                                />
                                {errors.title && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.title?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    type='textarea'
                                    rows={7}
                                    cols={10}
                                    label='Short Description (Max 150 words)'
                                    placeholder='Enter product description for quick view'
                                    {...register("description", {
                                        required: "Description is required",
                                        validate: (value) => countWords(value) <= 150 || "Description can't exceed 150 words"
                                    })}
                                />
                                {errors.description && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.description?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Tags'
                                    placeholder='art, wood'
                                    {...register("tags", { required: "Separate related products tags with coma(,)" })}
                                />
                                {errors.tags && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.tags?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Warranty'
                                    placeholder='1 year / No Warranty'
                                    {...register("warranty", { required: "Warranty info is required" })}
                                />
                                {errors.warranty && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.warranty?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Slug'
                                    placeholder='product-name'
                                    {...register("slug", { required: "Slug is required for SEO" })}
                                />
                                {errors.slug && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.slug?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    type='number'
                                    label='Stock'
                                    placeholder='10'
                                    {...register("stock", { required: "Stock is required" })}
                                />
                                {errors.stock && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.stock?.message as string}</p>
                                )}
                            </div>
                        </div>

                        <div className='w-full md:w-1/2 flex flex-col'>
                            <div className=''>
                                <Label>Category</Label>
                                <Controller
                                    name="category"
                                    control={control}
                                    rules={{ required: "Category is required" }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories?.map((category: string) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.category && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.category?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Label>Sub Category</Label>
                                <Controller
                                    name="subCategory"
                                    control={control}
                                    rules={{ required: "Sub-category is required" }}
                                    render={({ field }) => (
                                        <Select
                                            disabled={!selectedCategory}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select sub-category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subcategories?.map((sub: string) => (
                                                    <SelectItem key={sub} value={sub}>
                                                        {sub}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.subCategory && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.subCategory?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    type='number'
                                    label='Regular Price (₹)'
                                    placeholder='1999'
                                    {...register("regular_price", { required: "Regular price is required" })}
                                />
                                {errors.regular_price && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.regular_price?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    type='number'
                                    label='Sale Price (₹)'
                                    placeholder='999'
                                    {...register("sale_price")}
                                />
                            </div>

                            <div className='mt-2'>
                                <Label>Product Status</Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    rules={{ required: "Status is required" }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Draft">Draft</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Brand'
                                    placeholder='Your brand name'
                                    {...register("brand")}
                                />
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Video URL'
                                    placeholder='https://youtube.com/watch?v=...'
                                    {...register("video_url")}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='w-full mt-4'>
                        <Label>Detailed Description</Label>
                        <Controller
                            name="detailed_description"
                            control={control}
                            rules={{ required: "Detailed description is required" }}
                            render={({ field }) => (
                                <TextEditor
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="Enter detailed product description..."
                                />
                            )}
                        />
                        {errors.detailed_description && (
                            <p className='text-red-500 text-xs mt-1'>{errors.detailed_description?.message as string}</p>
                        )}
                    </div>

                    <div className='mt-4'>
                        <Label className='text-lg font-medium'>Product Options</Label>
                        <div className='mt-2 flex flex-wrap gap-8'>
                            <CashOnDeliverySelector
                                control={control}
                                name="cash_on_delivery"
                            />

                            <ColorSector
                                control={control}
                                name="colors"
                            />

                            <SizeSelector
                                control={control}
                                name="sizes"
                                sizes={['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']}
                            />
                        </div>
                    </div>

                    <div className='mt-8'>
                        <CustomSpecifications
                            control={control}
                            name="custom_specifications"
                            setValue={setValue}
                        />
                    </div>

                    <div className='flex gap-2 mt-8'>
                        <Button
                            type='button'
                            variant={'outline'}
                            onClick={() => router.push('/dashboard/all-products')}
                        >
                            Cancel
                        </Button>

                        <Button
                            type='submit'
                            disabled={updateProductMutation.isPending}
                            className='flex items-center gap-1'
                        >
                            {updateProductMutation.isPending ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default EditProduct
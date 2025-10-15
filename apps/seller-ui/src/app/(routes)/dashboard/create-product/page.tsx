'use client'

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CashOnDeliverySelector from '@/shared/components/cash-on-delivery';
import ColorSector from '@/shared/components/color-selector';
import CustomProperties from '@/shared/components/custom-properties';
import CustomSpecifications from '@/shared/components/custom-specifications';
import DiscountSelector from '@/shared/components/discount-selector';
import ImagePlaceholder from '@/shared/components/image-placeholders';
import Input from '@/shared/components/inputs/input';
import { TextEditor } from '@/shared/components/rich-editor';
import SizeSelector from '@/shared/components/size-selector';
import axiosInstance from '@/utils/axiosinstance';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner';


const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

export interface UploadedImages {
    file_id: string,
    url: string
}

const CreateProduct = () => {

    const [openImageModal, setOpenImageModal] = useState(false);
    const [isChanged, setIsChanged] = useState(true);
    const [image, setImage] = useState<(UploadedImages | null)[]>([null]);
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm();
    const selectedCategory = watch("category");
    const regularPrice = watch("regular_price");

    const router = useRouter();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/product/api/categories");
                return res.data.data; // Updated to match API response structure
            } catch (error) {
                console.log(error);
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,

    });


    const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
        queryKey: ['shop-discounts'],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/discounts/seller"); // Updated route
            return res?.data?.data || [] // Updated to access data.data
        }
    });




    const categories = data?.categories || [];
    const subCategoriesData = data?.subCategories || {};

    const subcategories = useMemo(() => {
        return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
    }, [selectedCategory, subCategoriesData])


    // console.log(categories, subCategoriesData);


    const onsubmit = async(data: any) => {
        console.log("Form data:", data);
        
        try {
            setLoading(true);
            
            // Transform form data to match backend schema
            const productData = {
                title: data.title,
                description: data.description,
                detailed_description: data.detailed_description,
                warranty: data.warranty || undefined,
                custom_specifications: data.custom_specifications || undefined,
                slug: data.slug,
                tags: typeof data.tags === 'string' 
                    ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
                    : data.tags || [],
                cash_on_delivery: data.cash_on_delivery ?? true,
                brand: data.brand || undefined,
                video_url: data.video_url || undefined,
                category: data.category,
                subCategory: data.subCategory,
                colors: Array.isArray(data.colors) ? data.colors : [],
                sizes: Array.isArray(data.sizes) ? data.sizes : [],
                discountCodes: data.discounts || undefined, // Map 'discounts' to 'discountCodes'
                stock: parseInt(data.stock) || 0,
                sale_price: data.sale_price ? parseFloat(data.sale_price) : undefined,
                regular_price: parseFloat(data.regular_price),
                customProperties: data.customProperties || {},
                images: image.filter((img): img is UploadedImages => img !== null),
                status: 'Active' as const, // Default to Active, can be changed to 'Draft' for save draft
            };

            console.log("Transformed product data:", productData);
            
            const response = await axiosInstance.post("/product/api/products", productData);
            
            // The response now includes pricing information from PricingService
            // Backend automatically calculates: current_price, is_on_discount, and creates ProductPricing history
            const createdProduct = response.data.data;
            console.log("Created product with pricing:", createdProduct);
            
            router.push("/dashboard/all-products");
            toast.success("Product created successfully!");
        } catch (error: any) {
            console.error("Product creation error:", error);
            const errorMessage = error?.response?.data?.message || 
                               error?.response?.data?.error || 
                               "Failed to create product";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const convertFileBase64 = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error);
        })
    }
    const handleImageChange = async (file: File | null, index: number) => {

        if (!file) return;

        try {
            const fileName = await convertFileBase64(file);

            // console.log(fileName);

            const response = await axiosInstance.post("/product/api/images/upload", { fileName }); // Updated route

            const updatedImages = [...image];

            const uploadedImage: UploadedImages = {
                file_id: response.data.data.file_id, // Updated to access data.data
                url: response.data.data.file_url, // Updated to access data.data
            }

            updatedImages[index] = uploadedImage;

            if (index === image.length - 1 && updatedImages.length < 8) {
                updatedImages.push(null);
            }

            setImage(updatedImages);
            setValue("image", updatedImages);

        } catch (error) {
            console.log(error);
        }
    }

    const handleRemoveImage = async (index: number) => {
        // clone image array
        const updatedImages = [...image];
        const imageToDelete = updatedImages[index];

        if (!imageToDelete || typeof imageToDelete !== "object") return;

        try {
            // 1. Delete image from server
            await axiosInstance.delete("/product/api/images/delete", { // Updated route
                data: { fileId: imageToDelete.file_id },
            });

            // 2. Remove from local state only after successful deletion
            updatedImages.splice(index, 1);

            // 3. Add null placeholder if needed
            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null);
            }

            // 4. Update state and form value
            setImage(updatedImages);
            setValue("images", updatedImages);
        } catch (error) {
            // console.error("Failed to delete image:", error);
            toast.error("Failed to delete image. Please try again.");
        }
    };


    const countWords = (text: string) => text.trim().split(/\s+/).length;

    const handleSaveDraft = async () => {
        const formData = watch(); // Get all form values
        
        try {
            setLoading(true);
            
            // Transform form data to match backend schema with Draft status
            const productData = {
                title: formData.title || "Untitled Product",
                description: formData.description || "No description",
                detailed_description: formData.detailed_description || "No detailed description",
                warranty: formData.warranty || undefined,
                custom_specifications: formData.custom_specifications || undefined,
                slug: formData.slug || `draft-${Date.now()}`,
                tags: typeof formData.tags === 'string' 
                    ? formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
                    : formData.tags || [],
                cash_on_delivery: formData.cash_on_delivery ?? true,
                brand: formData.brand || undefined,
                video_url: formData.video_url || undefined,
                category: formData.category || "Uncategorized",
                subCategory: formData.subCategory || "General",
                colors: Array.isArray(formData.colors) ? formData.colors : [],
                sizes: Array.isArray(formData.sizes) ? formData.sizes : [],
                discountCodes: formData.discounts || undefined,
                stock: parseInt(formData.stock) || 0,
                sale_price: formData.sale_price ? parseFloat(formData.sale_price) : undefined,
                regular_price: parseFloat(formData.regular_price) || 0,
                customProperties: formData.customProperties || {},
                images: image.filter((img): img is UploadedImages => img !== null),
                status: 'Draft' as const, // Save as Draft
            };

            console.log("Saving draft:", productData);
            
            const response = await axiosInstance.post("/product/api/products", productData);
            
            toast.success("Product saved as draft!");
            router.push("/dashboard/all-products");
        } catch (error: any) {
            console.error("Draft save error:", error);
            const errorMessage = error?.response?.data?.message || 
                               error?.response?.data?.error || 
                               "Failed to save draft";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }


    return (
        <form className='w-full mx-auto shadow-md p-8 rounded-lg '
            onSubmit={handleSubmit(onsubmit)}
        >

            {/* Heading and Breadcrumbs */}
            <h2 className='text-2xl py-2 font-semibold font-poppins '>Create Product</h2>
            <div className='flex items-center '>
                <Link href={'/dashboard'} className='cursor-pointer text-secondary'>Dashboard</Link>
                <ChevronRight size={20} className='opacity-[0.8]' />
                <span>Create Product</span>
            </div>

            {/* Content Layout */}
            <div className="py-4 w-full flex gap-6">
                {/* Left side- Image Upload section */}
                <div className='md:w-[35%]'>
                    <div className='grid grid-cols-2 gap-3 mt-0'>
                        {image?.map((_, index:any) => (
                            <div
                                key={index}
                                className={index === 0 ? 'col-span-2' : ''} // First image spans 2 columns (full width)
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
                                    image= {image}
                                />
                            </div>
                        ))}
                    </div>
                </div>





                {/* Right Side - Form inputs */}

                <div className='md:w-[65%] '>
                    <div className='w-full flex gap-6'>


                        <div className='w-2/4 flex flex-col '>
                            {/* Product Title Input */}
                            <div className=''>
                                <Input label='Product Title'
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
                                    placeholder='1 year / No Warrenty'
                                    {...register("warranty", { required: "warranty is required!" })}
                                />
                                {errors.warranty && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.warranty?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Slug'
                                    placeholder='product-name'
                                    {...register("slug", {
                                        required: "slug is required!",
                                        pattern: {
                                            value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                            message: "Invalid Slug format! Only use lowercase letters, numbers "
                                        },
                                        minLength: {
                                            value: 3,
                                            message: "Slug must be at least 3 charecters long."
                                        },
                                        maxLength: {
                                            value: 50,
                                            message: "Slug cannot be longer that 50 charecters."
                                        }
                                    })}
                                />
                                {errors.slug && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.slug?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Brand'
                                    placeholder='Brand Name'
                                    {...register("brand", { required: "Brand Name is required!" })}
                                />
                                {errors.brand && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.brand?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <ColorSector control={control} errors={errors} />
                            </div>


                            <div className='mt-2'>
                                <CustomSpecifications control={control} errors={errors} />
                            </div>


                            <div className='mt-2'>
                                <CustomProperties control={control} errors={errors} />
                            </div>

                            <div className='mt-2'>
                                <CashOnDeliverySelector control={control} name="cashOnDelivery" />
                                {errors.cashOnDelivery && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.cashOnDelivery?.message as string}</p>
                                )}
                            </div>
                        </div>

                        <div className='w-2/4 space-y-2'>
                            <Label className="text-sm text-muted-foreground">Category</Label>

                            {isLoading ? (
                                <p className='text-primary/50'>Loading Categories...</p>
                            ) : isError ? (
                                <p className='text-red-500'>Failed to Load Categories</p>
                            ) : (
                                <Controller
                                    name='category'
                                    control={control}
                                    rules={{
                                        required: "Category is required"
                                    }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories?.map((cate: any) => (
                                                    <SelectItem key={cate} value={cate}>
                                                        {cate}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            )}

                            {errors.category && (
                                <p className='text-red-500 text-xs mt-1'>{errors.category?.message as string}</p>
                            )}


                            <div className='space-y-2'>

                                <Label className="text-sm text-muted-foreground">Sub Category</Label>

                                <Controller
                                    name="subcategory"
                                    control={control}
                                    rules={{ required: "Sub-Category is Required" }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Sub Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subcategories?.map((sub: any) => (
                                                    <SelectItem key={sub} value={sub}>
                                                        {sub}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.subcategory && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.subcategory?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2 h-[380px]'>
                                <label className='block font-semibold mb-1 text-primary/80'>Detailed Description(Min 100 words)</label>
                                <Controller
                                    name='detailed_desc'
                                    control={control}
                                    rules={{
                                        required: "Detailed Description is required and must be at least 100 words!",
                                        validate: (value) => {
                                            const wordCount = value.split(/\s+/).filter((word: string) => word).length;

                                            return (
                                                wordCount >= 100 || "Description must be at least 100 words!"
                                            )
                                        }
                                    }}
                                    render={({ field }) => (

                                        <TextEditor className='text-primary h-full rounded-md' value={field.value} onChange={field.onChange} />
                                    )}
                                />
                                {errors.detailed_desc && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.detailed_desc?.message as string}</p>
                                )}
                            </div>


                            <div className='mt-2'>
                                <Input
                                    label="Video URL"
                                    placeholder="https://www.youtube.com/embed/xzxzxzy"
                                    {...register("video_url", {
                                        // pattern: {
                                        //     value: /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]$/,
                                        //     message: "Enter a valid YouTube embed URL "
                                        // }
                                    })}
                                />
                                {errors.video_url && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.video_url?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Regular Price'
                                    placeholder='500'
                                    {...register("regular_price", {
                                        required: "Price is required",
                                        valueAsNumber: true,
                                        min: {
                                            value: 1,
                                            message: "Price must be at least 1"
                                        },
                                        validate: (value) => (
                                            !isNaN(value) || "Only numbers are allowed"
                                        )
                                    })}
                                />
                                {errors.regular_price && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.regular_price?.message as string}</p>
                                )}
                            </div>


                            <div className='mt-2'>
                                <Input
                                    label='Sale Price'
                                    placeholder='400'
                                    {...register("sale_price", {
                                        required: "Sale Price is required",
                                        valueAsNumber: true,
                                        min: {
                                            value: 1,
                                            message: "Sale must be at least 1"
                                        },
                                        validate: (value) => {
                                            if (isNaN(value)) return "Only Number are allowed!"

                                            if (regularPrice && value >= regularPrice) {
                                                return "Sale price must be less than Regular price";
                                            }

                                            return true;
                                        }
                                    })}
                                />
                                {errors.sale_price && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.sale_price?.message as string}</p>
                                )}
                            </div>


                            <div className='mt-2'>
                                <Input
                                    label='Stocks'
                                    placeholder='400'
                                    {...register("stocks", {
                                        required: "Stocks is required",
                                        valueAsNumber: true,
                                        min: {
                                            value: 1,
                                            message: "Stock must be at least 1"
                                        },
                                        max: {
                                            value: 1000,
                                            message: "Stocks cannot exceed 1000"
                                        },
                                        validate: (value) => {
                                            if (isNaN(value)) return "Only Number are allowed!"

                                            if (!Number.isInteger(value)) {
                                                return "Stock must be whole number!";
                                            }

                                            return true;
                                        }
                                    })}
                                />
                                {errors.stocks && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.stocks?.message as string}</p>
                                )}
                            </div>


                            <div className='mt-2'>
                                <SizeSelector control={control} name="selectedSizes" sizes={sizes} />
                                {errors.selectedSizes && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.selectedSizes?.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>

                                {discountLoading ? (
                                    <p className='text-primary/80'>Loading Discount Codes...</p>
                                ) : (
                                    <DiscountSelector control={control} discount={discountCodes} label='Select Discount Codes(Optional)' name='discounts' />
                                )}
                            </div>




                        </div>


                    </div>



                </div>
            </div>

            <div className='mt-6 flex justify-end gap-3'>
                {isChanged && (
                    <Button type='button'
                        onClick={handleSaveDraft}
                        variant={"secondary"}
                    >Save Draft</Button>
                )}

                <Button type="submit" variant="default" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Plus className="mr-1 h-4 w-4" />
                            Create Product
                        </>
                    )}
                </Button>

            </div>



        </form>
    )
}

export default CreateProduct
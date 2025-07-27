'use client'

import ColorSector from '@/shared/components/color-selector';
import CustomProperties from '@/shared/components/custom-properties';
import CustomSpecifications from '@/shared/components/custom-specifications';
import ImagePlaceholder from '@/shared/components/image-placeholders';
import Input from '@/shared/components/inputs/input';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

const CreateProduct = () => {

    const [openImageModal, setOpenImageModal] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [image, setImage] = useState<(File | null)[]>([null]);
    const [loading, setLoading] = useState(false);


    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm();

    const onsubmit = (data: any) => {
        console.log(data);
    }

    const handleImageChange = (file: File | null, index: number) => {
        const updatedImages = [...image];

        updatedImages[index] = file;

        if (index == image.length - 1 && image.length < 8) {
            updatedImages.push(null);

        }

        setImage(updatedImages);
        setValue("images", updatedImages);
    }

    const handleRemoveImage = (index: number) => {
        setImage((prevImages) => {
            let updatedImages = [...prevImages];

            if (index == -1) {
                updatedImages[0] = null;

            } else {
                updatedImages.splice(index, 1);

            }

            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null)
            }

            return updatedImages;
        })
        setValue("images", image)
    }

    const countWords = (text: string) => text.trim().split(/\s+/).length;


    return (
        <form className='w-full mx-auto shadow-md p-8 rounded-lg '
            onSubmit={handleSubmit(onsubmit)}
        >

            {/* Heading and Breadcrumbs */}
            <h2 className='text-2xl py-2 font-semibold font-poppins '>Create Product</h2>
            <div className='flex items-center '>
                <span className='cursor-pointer'>Dashboard</span>
                <ChevronRight size={20} className='opacity-[0.8]' />
                <span>Create Product</span>
            </div>

            {/* Content Layout */}
            <div className="py-4 w-full flex gap-6">
                {/* Left side- Image Upload section */}
                <div className='md:w-[35%] '>
                    {image?.length > 0 && (
                        <ImagePlaceholder
                            setOpenImageModal={setOpenImageModal}
                            size='765 x 850'
                            small={false}
                            index={0}
                            onImageChange={handleImageChange}
                            onRemove={handleRemoveImage}
                        />
                    )}

                    <div className='grid grid-cols-2 gap-3 mt-4 '>
                        {image?.slice(1).map((_, index) => (
                            <ImagePlaceholder
                                key={index}
                                setOpenImageModal={setOpenImageModal}
                                size='765 x 850'
                                small={true}
                                index={index + 1}
                                onImageChange={handleImageChange}
                                onRemove={handleRemoveImage}
                            />
                        ))}
                    </div>

                </div>




                {/* Right Side - Form inputs */}

                <div className='md:w-[65%] '>
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
                            {errors.decription && (
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
                                    required: "slug is required!" ,
                                    pattern: {
                                        value:/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                        message:"Invalid Slug format! Only use lowercase letters, numbers "
                                    },
                                    minLength:{
                                        value: 3,
                                        message: "Slug must be at least 3 charecters long."
                                    },
                                    maxLength:{
                                        value: 50,
                                        message:"Slug cannot be longer that 50 charecters."
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
                            <ColorSector control={control} errors={errors}/>
                        </div>


                        <div className='mt-2'>
                            <CustomSpecifications control={control} errors={errors}/>
                        </div>


                        <div className='mt-2'>
                            <CustomProperties control={control} errors={errors}/>
                        </div>

                    </div>
                </div>
            </div>





        </form>
    )
}

export default CreateProduct
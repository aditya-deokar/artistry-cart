import { shopCategories } from '@/utils/categories';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react'
import { useForm } from 'react-hook-form';

type Props = {
    sellerId: string;
    setActiveStep: (step: number) => void;
}

const CreateShop = ({ sellerId, setActiveStep, }: Props) => {

    const { register, handleSubmit, formState: { errors } } = useForm();

    const shopCreateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/create-shop`,
                data
            )

            return response.data;
        },
        onSuccess: () => {
            setActiveStep(3)
        }
    })

    const onSubmit = async (data: any) => {
        const shopData = { ...data, sellerId }

        shopCreateMutation.mutate(shopData);
    }

    const countWords = (text: string) => text.trim().split(/\s+/).length;



    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className='text-2xl font-semibold text-center mb-4'>Setup new Shop</h3>

                <label className='block text-gray-700 mb-1'>Name</label>
                <input type="text" placeholder='Shop Name'
                    className='w-full p-2 border border-border outline-0 rounded mb-1'
                    {...register("name", {
                        required: "Name is Required",
                    })}
                />
                {errors.name && (
                    <p className='text-red-500 text-sm'>
                        {String(errors.name.message)}
                    </p>
                )}

                <label className='block text-gray-700 mb-1'>Bio (max 100 words)</label>
                <textarea
                    cols={10}
                    rows={4}
                    placeholder='Shop Bio'
                    className='w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1'
                    {...register("bio", {
                        required: "Shop bio is Required",
                        validate: (value) => countWords(value) <= 100 || "Bio can't exceed 100 words",
                    })}
                />
                {errors.bio && (
                    <p className='text-red-500 text-sm'>
                        {String(errors.bio.message)}
                    </p>
                )}


                <label className='block text-gray-700 mb-1'>Address</label>
                <input type="text" placeholder='Shop Location'
                    className='w-full p-2 border border-border outline-0 rounded mb-1'
                    {...register("address", {
                        required: "Address is Required",
                    })}
                />
                {errors.address && (
                    <p className='text-red-500 text-sm'>
                        {String(errors.address.message)}
                    </p>
                )}


                <label className='block text-gray-700 mb-1'>Openning Hours</label>
                <input type="text" placeholder='e.g. Mon-Fri 9AM-6PM'
                    className='w-full p-2 border border-border outline-0 rounded mb-1'
                    {...register("opening_hours", {
                        required: "opening hours is Required",
                    })}
                />
                {errors.opening_hours && (
                    <p className='text-red-500 text-sm'>
                        {String(errors.opening_hours.message)}
                    </p>
                )}

                <label className='block text-gray-700 mb-1'>Website</label>
                <input type="url" placeholder='https://example.com'
                    className='w-full p-2 border border-border outline-0 rounded mb-1'
                    {...register("website", {
                        pattern: {
                            value: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:\/?#[\]@!$&'()*+,;=]*)?$/,
                            message: "Enter a valid URL"
                        },
                    })}
                />
                {errors.website && (
                    <p className='text-red-500 text-sm'>
                        {String(errors.website.message)}
                    </p>
                )}


                <label className='block text-primary/90 mb-1'>Select a category</label>
                <select
                    className='w-full p-2 border border-gray-700 outline-0 rounded-[4px]'
                    {...register("category", {
                        required: "Category is Required"
                    })}
                >
                    <option value="">Slect your Category</option>
                    {shopCategories.map((cate) => (
                        <option value={cate.value} key={cate.value}>
                            {cate.label}
                        </option>
                    ))}

                </select>
                {errors.category && (
                    <p className='text-red-500 text-sm'>
                        {String(errors.category.message)}
                    </p>
                )}


                <button
                    type='submit'
                    // variant={"default"} 
                    className='w-full mt-4'
                    // disabled={signUpMutation.isPending}
                >
                    Create
                    {/* {signUpMutation.isPending ? "Creating.. " : "Create"} */}
                </button>
                {/* {signUpMutation.isError && signUpMutation.error instanceof AxiosError && (
                    <p className='text-red-500 text-sm mt-2'>
                        {signUpMutation.error.response?.data?.message || signUpMutation.error.message}
                    </p>
                )} */}



            </form>
        </div>
    )
}

export default CreateShop
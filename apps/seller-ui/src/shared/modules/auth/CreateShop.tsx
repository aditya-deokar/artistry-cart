'use client'

import { shopCategories } from '@/utils/categories';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';


type Props = {
  sellerId: string;
  setActiveStep: (step: number) => void;
};

const CreateShop = ({ sellerId, setActiveStep }: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/create-shop`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    }
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h3 className='text-2xl font-semibold text-center mb-4'>Setup new Shop</h3>

        <div>
          <Label>Name</Label>
          <Input
            placeholder='Shop Name'
            {...register("name", {
              required: "Name is Required"
            })}
          />
          {errors.name && <p className='text-red-500 text-sm'>{String(errors.name.message)}</p>}
        </div>

        <div>
          <Label>Bio (max 100 words)</Label>
          <Textarea
            placeholder='Shop Bio'
            rows={4}
            {...register("bio", {
              required: "Shop bio is Required",
              validate: (value) => countWords(value) <= 100 || "Bio can't exceed 100 words"
            })}
          />
          {errors.bio && <p className='text-red-500 text-sm'>{String(errors.bio.message)}</p>}
        </div>

        <div>
          <Label>Address</Label>
          <Input
            placeholder='Shop Location'
            {...register("address", {
              required: "Address is Required"
            })}
          />
          {errors.address && <p className='text-red-500 text-sm'>{String(errors.address.message)}</p>}
        </div>

        <div>
          <Label>Opening Hours</Label>
          <Input
            placeholder='e.g. Mon-Fri 9AM-6PM'
            {...register("opening_hours", {
              required: "Opening hours is Required"
            })}
          />
          {errors.opening_hours && <p className='text-red-500 text-sm'>{String(errors.opening_hours.message)}</p>}
        </div>

        <div>
          <Label>Website</Label>
          <Input
            placeholder='https://example.com'
            type='url'
            {...register("website", {
              pattern: {
                value: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:\/?#[\]@!$&'()*+,;=]*)?$/,
                message: "Enter a valid URL"
              }
            })}
          />
          {errors.website && <p className='text-red-500 text-sm'>{String(errors.website.message)}</p>}
        </div>

        <div>
          <Label>Select a category</Label>
          <Select
            onValueChange={(value) => {
              // manually set value if needed later
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your Category" />
            </SelectTrigger>
            <SelectContent>
              {shopCategories.map((cate) => (
                <SelectItem value={cate.value} key={cate.value}>
                  {cate.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <select
            hidden
            {...register("category", {
              required: "Category is Required"
            })}
            defaultValue=""
          >
            <option value="">Select</option>
            {shopCategories.map((c) => (
              <option value={c.value} key={c.value}>{c.label}</option>
            ))}
          </select>
          {errors.category && <p className='text-red-500 text-sm'>{String(errors.category.message)}</p>}
        </div>

        <Button
          type='submit'
          className='w-full mt-4'
          disabled={shopCreateMutation.isPending}
        >
          {shopCreateMutation.isPending ? "Creating..." : "Create"}
        </Button>
      </form>
    </div>
  );
};

export default CreateShop;

"use client"


import axiosInstance from '@/utils/axiosinstance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ChevronRight, Plus, Trash } from 'lucide-react'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'

import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import Input from '@/shared/components/inputs/input'
import DiscountTypeSelector from '@/shared/components/discount-type-selector'
import { AxiosError } from 'axios'

const DiscountPage = () => {

    const closeRef = useRef<HTMLButtonElement>(null);

    const queryClient = useQueryClient();

    const { data: discountCodes = [], isLoading } = useQuery({
        queryKey: ['shop-discounts'],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-discount-codes");
            return res?.data?.discount_codes || []
        }
    });

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            publicName: "",
            discountType: "percentage",
            discountValue: "",
            discountCode: "",
        }
    });


    const createDiscountCodeMutation = useMutation({
        mutationFn: async (data) => {
            await axiosInstance.post("/product/api/create-discount-code", data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['shop-discounts']
            });
            reset();
            closeRef.current?.click();
        }
    })


    const handleDeleteClick = async (discount: any) => {

    }

    const onSubmit = async (data: any) => {
        if (discountCodes.length >= 8) {
            toast("You can only create up to 8 discount codes.");
            return;
        }

        createDiscountCodeMutation.mutate(data)
    }



    return (
        <div className='w-full min-h-screen p-8'>
            <div className='flex justify-between items-center mb-1'>
                <h2 className='text-2xl font-semibold'>Discount Codes</h2>

                <Dialog>
                    <form>
                        <DialogTrigger asChild>
                            <Button variant="default">
                                <Plus size={18} />
                                Create Discount</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit profile</DialogTitle>
                                <DialogDescription>
                                    Make changes to your profile here. Click save when you&apos;re
                                    done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Input
                                        label='Title (Public Name)'
                                        {...register("publicName", {
                                            required: "Title is required"
                                        })}
                                    />
                                    {errors.publicName && (
                                        <p className='text-red-500 text-xs mt-1'>{errors.publicName?.message as string}</p>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    {/* Discount Type */}
                                    <DiscountTypeSelector control={control} name='discountType' label='Discount Type' />
                                    {errors.discountType && (
                                        <p className='text-red-500 text-xs mt-1'>{errors.discountType?.message as string}</p>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    <Input
                                        label='Discount Value'
                                        type='number'
                                        {...register("discountValue", {
                                            required: "Value is required"
                                        })}
                                    />
                                    {errors.discountValue && (
                                        <p className='text-red-500 text-xs mt-1'>{errors.discountValue?.message as string}</p>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    <Input
                                        label='Discount Code'
                                        {...register("discountCode", {
                                            required: "Code is required"
                                        })}
                                    />
                                    {errors.discountCode && (
                                        <p className='text-red-500 text-xs mt-1'>{errors.discountCode?.message as string}</p>
                                    )}
                                </div>

                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        ref={closeRef}
                                        variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                    // disabled={createDiscountCodeMutation.isPending}
                                    onClick={handleSubmit(onSubmit)}>
                                    <Plus size={18} />
                                    {createDiscountCodeMutation.isPending ? "Creating.." : "Create"}
                                </Button>

                            </DialogFooter>
                            {createDiscountCodeMutation.error && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {(createDiscountCodeMutation.error as AxiosError<{ message: string }>)?.response?.data?.message || "Something went wrong"}
                                </p>
                            )}

                        </DialogContent>
                    </form>
                </Dialog>
            </div>


            {/*  Breadcrumbs */}

            <div className='flex items-center '>
                <Link href={'/dashboard'} className='cursor-pointer text-primary/60'>Dashboard</Link>
                <ChevronRight size={20} className='opacity-[0.8]' />
                <span>Discount Codes</span>
            </div>

            <div className='mt-8 bg-background p-6 rounded-lg '>
                <h3 className='text-lg font-semibold mb-4'>Your Discount Codes</h3>
                {isLoading ? (
                    <p className='text-primary/80 text-center'>Loading discounts...</p>
                ) : (
                    <Table className="border">
                        <TableHeader>
                            <TableRow className="border-border border-b">
                                <TableHead className="text-left p-3">Title</TableHead>
                                <TableHead className="text-left p-3">Type</TableHead>
                                <TableHead className="text-left p-3">Value</TableHead>
                                <TableHead className="text-left p-3">Code</TableHead>
                                <TableHead className="text-left p-3">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {discountCodes?.map((discount: any) => (
                                <TableRow
                                    key={discount?.id}
                                    className="border-b transition hover:bg-secondary"
                                >
                                    <TableCell className="p-3">{discount?.publicName}</TableCell>

                                    <TableCell className="p-3 capitalize">
                                        {discount.discountType === 'percentage'
                                            ? 'Percentage (%)'
                                            : 'Flat (Rupees)'}
                                    </TableCell>

                                    <TableCell className="p-3">
                                        {discount.discountType === 'percentage'
                                            ? `${discount.discountValue}%`
                                            : `${discount.discountValue}`}
                                    </TableCell>

                                    <TableCell className="p-3">{discount.discountCode}</TableCell>

                                    <TableCell className="p-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="text-red-500"
                                            onClick={() => handleDeleteClick(discount)}
                                        >
                                            <Trash size={18} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {!isLoading && discountCodes?.length == 0 && (
                    <p className='text-primary/80 text-center'>No Discounts Codes Available</p>
                )}
            </div>





        </div>
    )
}

export default DiscountPage
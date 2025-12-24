'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { AddressCard, AddressData } from './AddressCard';
import { AddressFormModal } from './AddressFormModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useStore } from '@/store';
import { motion } from 'framer-motion';
import { LoaderCircle, MapPin, Plus } from 'lucide-react';

export const AddressBookView = () => {
    const { setAddress } = useStore((state) => state.actions);
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressData | null>(null);

    // Fetch addresses
    const { data, isLoading, isError } = useQuery<AddressData[]>({
        queryKey: ['userAddresses'],
        queryFn: async () => (await axiosInstance.get('/auth/api/me/addresses')).data.addresses,
    });

    useEffect(() => {
        if (data) {
            setAddress(data[0]);
        }
    }, [data, setAddress]);

    // Mutation for creating/updating
    const { mutate, isPending } = useMutation({
        mutationFn: (address: Omit<AddressData, 'id'> | AddressData) => {
            const isEditing = 'id' in address;
            const url = isEditing ? `/auth/api/me/addresses/${address.id}` : '/auth/api/me/addresses';
            const method = isEditing ? 'patch' : 'post';
            return axiosInstance[method](url, address);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAddresses'] });
            setIsModalOpen(false);
            setEditingAddress(null);
            toast.success('Address saved successfully!');
        },
        onError: () => toast.error('Failed to save address.'),
    });

    // Delete mutation
    const { mutate: deleteAddress, isPending: isDeleting } = useMutation({
        mutationFn: async (id: string) => {
            return await axiosInstance.delete(`/auth/api/me/addresses/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAddresses'] });
            toast.success('Address deleted!');
        },
        onError: () => toast.error('Failed to delete address.'),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <LoaderCircle size={40} className="animate-spin text-[var(--ac-gold)]" />
                    <p className="text-[var(--ac-stone)] dark:text-[var(--ac-silver)] text-sm tracking-wide">
                        Loading addresses...
                    </p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ac-error)]/10 flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                        Unable to Load Addresses
                    </h3>
                    <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-sm">
                        We couldn&apos;t fetch your addresses. Please try refreshing the page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-8"
        >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-px bg-[var(--ac-gold)]" />
                        <p className="text-xs tracking-[0.2em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] font-medium">
                            Shipping Details
                        </p>
                    </div>
                    <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-tight">
                        Address Book
                    </h2>
                    <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mt-2">
                        Manage your saved shipping addresses for faster checkout.
                    </p>
                </div>
                <Button
                    onClick={() => { setEditingAddress(null); setIsModalOpen(true); }}
                    className="rounded-full px-6 bg-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] text-[var(--ac-ivory)] font-medium transition-all duration-300 flex-shrink-0"
                >
                    <Plus size={18} className="mr-2" />
                    Add New Address
                </Button>
            </div>

            {/* Address List */}
            {data && data.length > 0 ? (
                <div className="grid gap-4">
                    {data.map((addr, index) => (
                        <motion.div
                            key={addr.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                        >
                            <AddressCard
                                address={addr}
                                onEdit={() => {
                                    setEditingAddress(addr);
                                    setIsModalOpen(true);
                                }}
                                onDelete={() => deleteAddress(addr.id)}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 px-8 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-xl bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                    <div className="w-20 h-20 rounded-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] flex items-center justify-center mb-6">
                        <MapPin size={32} className="text-[var(--ac-stone)]" />
                    </div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                        No Addresses Saved
                    </h3>
                    <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-center max-w-sm mb-6">
                        Add your first shipping address for a faster checkout experience.
                    </p>
                    <Button
                        onClick={() => { setEditingAddress(null); setIsModalOpen(true); }}
                        variant="outline"
                        className="rounded-full px-6 border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:border-[var(--ac-gold)] hover:text-[var(--ac-gold)] transition-all duration-300"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Your First Address
                    </Button>
                </div>
            )}

            {/* Modal */}
            <AddressFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={mutate}
                isPending={isPending}
                initialData={editingAddress}
            />
        </motion.div>
    );
};
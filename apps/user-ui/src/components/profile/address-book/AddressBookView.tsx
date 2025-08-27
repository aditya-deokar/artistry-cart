'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';

import { AddressCard, AddressData } from './AddressCard';
import { AddressFormModal } from './AddressFormModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useStore } from '@/store';

export const AddressBookView = () => {

    const { setAddress } = useStore((state) => state.actions);
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressData | null>(null);

    // Fetch addresses
    const { data, isLoading } = useQuery<AddressData[]>({
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
            toast.success('Address saved!');

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
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="font-display text-3xl">Address Book</h2>
                    <p className="text-primary/70">Manage your saved shipping addresses.</p>
                </div>
                <Button onClick={() => { setEditingAddress(null); setIsModalOpen(true); }}>Add New Address</Button>
            </div>

            {/* Address List */}
            {isLoading ? <p>Loading addresses...</p> : (
                <div className="space-y-4">
                    {data?.map(addr => (
                        <AddressCard key={addr.id} address={addr} onEdit={() => {
                            setEditingAddress(addr);
                            setIsModalOpen(true);
                        }}
                            onDelete={() => deleteAddress(addr.id)}
                        />
                    ))}
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
        </div>
    );
};
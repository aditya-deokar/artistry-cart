'use client';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';


export const ProfileUpdateForm = ({ currentUser }: { currentUser: any }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: currentUser.name || '',
        email: currentUser.email || '',
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (updatedData: typeof formData) => {
            return axiosInstance.patch('/users/api/me', updatedData);
        },
        onSuccess: () => {
            toast.success('Profile updated!');
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['user'] }); // Invalidate global user state too
        },
        onError: () => toast.error('Failed to update profile.')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 border border-neutral-800 rounded-lg space-y-4">
             <h3 className="font-semibold text-lg">Personal Information</h3>
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <Input type="email" id="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
};
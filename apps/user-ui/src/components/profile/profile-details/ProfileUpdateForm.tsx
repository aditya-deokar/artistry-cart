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
        <form onSubmit={handleSubmit} className="p-8 border border-border rounded-xl bg-card space-y-6">
            <div className="border-b border-border pb-4 mb-6">
                <h3 className="font-display text-xl font-semibold">Personal Information</h3>
                <p className="text-muted-foreground text-sm mt-1">
                    Update your personal details here. Changes will take effect immediately.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none">Full Name</label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 rounded-lg" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none">Email Address</label>
                    <Input type="email" id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-11 rounded-lg" />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending} className="px-8 rounded-full h-11">
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
};
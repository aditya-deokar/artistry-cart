'use client';

import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Save, LoaderCircle } from 'lucide-react';
import { gsap } from 'gsap';

export const ProfileUpdateForm = ({ currentUser }: { currentUser: any }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: currentUser.name || '',
        email: currentUser.email || '',
    });
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const { mutate, isPending } = useMutation({
        mutationFn: (updatedData: typeof formData) => {
            return axiosInstance.patch('/users/api/me', updatedData);
        },
        onSuccess: () => {
            toast.success('Profile updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });

            // Success animation
            if (submitButtonRef.current) {
                gsap.to(submitButtonRef.current, {
                    scale: 1.05,
                    duration: 0.15,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.out',
                });
            }
        },
        onError: () => toast.error('Failed to update profile.')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate(formData);
    };

    // Input focus animation
    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        gsap.to(e.currentTarget, {
            borderColor: 'var(--ac-gold)',
            duration: 0.3,
            ease: 'power2.out',
        });
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        gsap.to(e.currentTarget, {
            borderColor: 'var(--ac-linen)',
            duration: 0.3,
            ease: 'power2.out',
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="relative p-8 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-xl bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] overflow-hidden"
        >
            {/* Decorative corner */}
            <div
                className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at top right, var(--ac-copper) 0%, transparent 70%)',
                    opacity: 0.04,
                }}
            />

            {/* Section Header */}
            <div className="border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)] pb-4 mb-6">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                    Personal Information
                </h3>
                <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-sm mt-1">
                    Update your personal details here. Changes will take effect immediately.
                </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label
                        htmlFor="name"
                        className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-wide"
                    >
                        Full Name
                    </label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="h-12 rounded-lg bg-[var(--ac-ivory)] dark:bg-[var(--ac-slate)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:border-[var(--ac-gold)] focus:ring-[var(--ac-gold)]/20 transition-all duration-300"
                        placeholder="Enter your full name"
                    />
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-wide"
                    >
                        Email Address
                    </label>
                    <Input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="h-12 rounded-lg bg-[var(--ac-ivory)] dark:bg-[var(--ac-slate)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:border-[var(--ac-gold)] focus:ring-[var(--ac-gold)]/20 transition-all duration-300"
                        placeholder="Enter your email address"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 mt-6 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                <Button
                    ref={submitButtonRef}
                    type="submit"
                    disabled={isPending}
                    className="px-8 h-12 rounded-full bg-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] text-[var(--ac-ivory)] font-medium tracking-wide transition-all duration-300 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <LoaderCircle className="animate-spin mr-2" size={18} />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} className="mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};
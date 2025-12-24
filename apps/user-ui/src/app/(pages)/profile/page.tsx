'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { ProfileDetailsView } from '@/components/profile/profile-details/ProfileDetailsView';
import { LoaderCircle } from 'lucide-react';

export default function ProfilePage() {
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const res = await axiosInstance.get('/auth/api/me');
            return res.data.user;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <LoaderCircle
                        size={40}
                        className="animate-spin text-[var(--ac-gold)]"
                    />
                    <p className="text-[var(--ac-stone)] dark:text-[var(--ac-silver)] text-sm tracking-wide">
                        Loading your profile...
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
                        Unable to Load Profile
                    </h3>
                    <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-sm">
                        We couldn&apos;t fetch your profile information. Please try refreshing the page.
                    </p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return <ProfileDetailsView user={user} />;
}
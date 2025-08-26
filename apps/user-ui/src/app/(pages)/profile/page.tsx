'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { ProfileDetailsView } from '@/components/profile/profile-details/ProfileDetailsView';

export default function ProfilePage() {
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const res = await axiosInstance.get('/users/api/me');
            return res.data.user;
        },
    });

    if (isLoading) return <div>Loading Profile...</div>;
    if (isError) return <div>Failed to load profile.</div>;
    if (!user) return null;

    return <ProfileDetailsView user={user} />;
}
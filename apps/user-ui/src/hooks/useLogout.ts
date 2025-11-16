// hooks/useLogout.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosinstance';
import { useAuthStore } from '@/store/authStore';

export const useLogout = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { setLoggedIn } = useAuthStore();

    return useMutation({
        mutationFn: async () => {
            // Uncomment if you have a logout API endpoint
            const response = await axiosInstance.post('/auth/api/logout-user');
            return response.data;
        },
        onSuccess: () => {
            setLoggedIn(false);
            queryClient.setQueryData(['user'], null);
            queryClient.removeQueries({ queryKey: ['user'] });
            router.push('/login');
        },
        onError: (error: any) => {
            console.error('Logout failed:', error);
        }
    });
};

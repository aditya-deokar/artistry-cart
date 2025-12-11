
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosinstance";
import useUser from "./useUser";

const fetchRecommendations = async (userId: string) => {
    if (!userId) return [];

    try {
        const response = await axiosInstance.get(`/recommendation/api/recommendations/${userId}`);
        return response.data?.recommendations || [];
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return [];
    }
};

const useRecommendations = () => {
    const { user } = useUser();
    const userId = user?.id;

    return useQuery({
        queryKey: ["recommendations", userId],
        queryFn: () => fetchRecommendations(userId),
        enabled: !!userId, // Only fetch if we have a userId
        staleTime: 1000 * 60 * 15, // 15 minutes
        retry: false,
    });
};

export default useRecommendations;

import { useAuthStore } from "@/store/authStore";
import axiosInstance from "@/utils/axiosinstance";
import { isProtected } from "@/utils/protected";
import { useQuery } from "@tanstack/react-query";

const fetchUser = async (isLoggedIn: boolean) => {
    if (!isLoggedIn) return null;
    
    const config = isProtected;
    try {
        const response = await axiosInstance.get("/auth/api/logged-in-user", config);
        console.log("Logged-in user response:", response.data);
        return response?.data?.user ?? null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

const useUser = () => {
    const { isLoggedIn } = useAuthStore();
    
    const {
        data: user,
        isPending,
        isError,
    } = useQuery({
        queryKey: ["user"],
        queryFn: () => fetchUser(isLoggedIn),
        enabled: isLoggedIn,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });

    return { user: user as any, isLoading: isPending, isError };
};

export default useUser;

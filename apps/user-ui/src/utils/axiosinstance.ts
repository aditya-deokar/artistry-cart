import axios from "axios";
import { runRedirectToLogin } from "./redirect";
import { useAuthStore } from "@/store/authStore";

const axiosInstance = axios.create({
    baseURL: typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_SERVER_URI,
    withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// Function to clear store data (cart, wishlist, etc.)
const clearStoreData = () => {
    // Clear localStorage directly since we can't use hooks here
    const storageKey = 'artistry-cart-storage';
    try {
        localStorage.removeItem(storageKey);
    } catch (e) {
        console.error('Failed to clear store data:', e);
    }
};

// handlelogout and prevent infinite loops
const handleLogout = () => {
    // 1. Always set loggedIn state to false effectively logging the user out in the client state
    useAuthStore.getState().setLoggedIn(false);

    // 2. Clear store data (cart, wishlist, etc.)
    clearStoreData();

    const publicPaths = ["/login", "/signup", "/forgot-password", "/"];

    const currentPath = window.location.pathname;

    // Check exact matches
    if (publicPaths.includes(currentPath)) return;

    // Check for public sections
    if (currentPath.startsWith('/product') || currentPath.startsWith('/shops')) return;

    runRedirectToLogin()
}

// handle adding a new access token to queued requests
const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback);
}

// Exwecute queued requests after refresh
const onRefreshSuccess = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
};

// Handling API request
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const is401 = error?.response?.status == 401;
        const isRetry = originalRequest?._retry;
        const isAuthRequired = originalRequest?.requireAuth === true;

        if (is401 && !isRetry && isAuthRequired) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));

                })
            }

            originalRequest._retry = true;
            isRefreshing = true;
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                isRefreshing = false;
                onRefreshSuccess();

                return axiosInstance(originalRequest);

            } catch (error) {
                isRefreshing = false;
                refreshSubscribers = [];
                handleLogout();

                return Promise.reject(error);
            }

        }


        return Promise.reject(error)
    }
)

export default axiosInstance
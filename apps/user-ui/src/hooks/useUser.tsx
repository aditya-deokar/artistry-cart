import { useAuthStore } from "@/store/authStore";
import axiosInstance from "@/utils/axiosinstance";
import { isProtected } from "@/utils/protected";
import { useQuery } from "@tanstack/react-query";




const fetchUser = async(isLoggedIn: boolean) => {
    const config= isLoggedIn ? isProtected : {};
    const response = await axiosInstance.get("/auth/api/logged-in-user", config);
    console.log("Logged-in user response:", response.data);
     return response?.data?.user ?? null;
};

const useUser = ()=>{

    const { setLoggedIn , isLoggedIn} = useAuthStore()
    const {
        data: user,
        isPending,
        isError,
    } = useQuery({
        queryKey:["user"],
        queryFn: () => fetchUser(isLoggedIn),
        staleTime: 1000* 60 * 5,
        retry: false,
        // @ts-ignore
        onSuccess: ()=> {
            setLoggedIn(true);
        },
        onError: ()=>{
            setLoggedIn(false)
        }


    });

    return { user : user as any , isLoading:isPending , isError };


}

export default useUser;


'use client'

import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

type FormData = {
    email: string;
    password: string;
};

import { motion } from 'framer-motion';

const LoginPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const router = useRouter();
    const queryClient = useQueryClient();
    const { setLoggedIn } = useAuthStore();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const searchParams = useSearchParams();

    React.useEffect(() => {
        const error = searchParams.get('error');
        const message = searchParams.get('message');

        if (error === 'login_required') {
            toast.error("Please login to access this page");
        }
        if (message) {
            toast.success(message);
        }
    }, [searchParams]);

    const loginMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/login-user`,
                data,
                {
                    withCredentials: true
                }
            );
            return response.data;
        },
        onSuccess: (data) => {
            setServerError(null);

            // Update auth state
            setLoggedIn(true);

            // Invalidate and refetch user query immediately
            queryClient.invalidateQueries({
                queryKey: ['user'],
                refetchType: 'active'
            });

            router.push("/");
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message: string })?.message || "Invalid Credentials!";
            setServerError(errorMessage);
            setLoggedIn(false);
        },
    });

    const onSubmit = (data: FormData) => {
        loginMutation.mutate(data);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-display font-bold tracking-tight">Welcome back</h1>
                <p className="text-muted-foreground mt-2">
                    Enter your email to sign in using your account.
                </p>
            </div>

            <div className="space-y-6">
                <Button variant="outline" className="w-full h-12 gap-3 text-base font-normal rounded-xl border-muted-foreground/20 hover:bg-accent hover:text-accent-foreground transition-all duration-300">
                    <UserIcon
                        size={20}
                        className="text-[#DB4437]"
                        aria-hidden="true"
                    />
                    Continue with Google
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                            {...register("email", {
                                required: "Email is Required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid Email Address",
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="text-sm font-medium text-destructive mt-1">
                                {String(errors.email.message)}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary hover:underline underline-offset-4"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={passwordVisible ? "text" : "password"}
                                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 transition-all duration-300"
                                placeholder="••••••••"
                                {...register("password", {
                                    required: "Password is Required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    }
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm font-medium text-destructive mt-1">
                                {String(errors.password.message)}
                            </p>
                        )}
                    </div>

                    <Button
                        disabled={loginMutation?.isPending}
                        type="submit"
                        className="w-full h-12 text-base rounded-xl font-medium transition-all duration-300 hover:scale-[1.01]"
                    >
                        {loginMutation?.isPending ? "Signing in..." : "Sign in"}
                    </Button>

                    {serverError && (
                        <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-3 rounded-lg">
                            {serverError}
                        </p>
                    )}
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/signup" className="font-semibold text-primary hover:underline underline-offset-4">
                        Sign up
                    </Link>
                </p>
            </div>
        </motion.div>
    );
};

export default LoginPage;

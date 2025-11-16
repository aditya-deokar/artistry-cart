'use client'

import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';

type FormData = {
    email: string;
    password: string;
};

const LoginPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);

    const router = useRouter();
    const queryClient = useQueryClient();
    const { setLoggedIn } = useAuthStore();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

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
        <div className='w-full py-10 min-h-[85vh]'>
            <h1 className='text-4xl font-poppins font-semibold text-center'>Login</h1>
            <p className='text-center text-lg font-medium py-3'>Home . Login</p>

            <div className='w-full flex justify-center'>
                <div className='md:w-[480px] p-8 shadow rounded-lg bg-accent'>
                    <h3 className='text-3xl font-semibold text-center mb-2'>Login to Artistry Cart</h3>
                    <p className='text-center text-gray-500 mb-4'>Don't have an account? {' '}
                        <Link href={'/signup'} className='text-blue-500'>Sign up</Link>
                    </p>

                    <Button variant="outline" className='w-full'>
                        <UserIcon
                            className="text-[#DB4437] dark:text-white/60"
                            size={16}
                            aria-hidden="true"
                        />
                        Login with Google
                    </Button>

                    <div className='flex items-center my-5 text-sm text-primary/60'>
                        <div className='flex-1 border-t' />
                        <span className='px-3'>or Sign in with Email</span>
                        <div className='flex-1 border-t' />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <label className='block text-primary/90 mb-1'>Email</label>
                        <input
                            type="email"
                            placeholder='Support@artistrycart.com'
                            className='w-full p-2 border border-border outline-0 rounded mb-1'
                            {...register("email", {
                                required: "Email is Required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid Email Address",
                                },
                            })}
                        />
                        {errors.email && (
                            <p className='text-red-500 text-sm'>
                                {String(errors.email.message)}
                            </p>
                        )}

                        <label className='block text-primary/90 mb-1 mt-3'>Password</label>
                        <div className='relative'>
                            <input
                                type={passwordVisible ? "text" : "password"}
                                placeholder='Min. 6 characters'
                                className='w-full p-2 border border-border outline-0 rounded mb-1'
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
                                className='absolute inset-y-0 p-2 origin-center right-3 flex items-center text-primary/80'
                            >
                                {passwordVisible ? <Eye /> : <EyeOff />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className='text-red-500 text-sm'>
                                {String(errors.password.message)}
                            </p>
                        )}

                        <div className='flex justify-between items-center my-4'>
                            <label htmlFor="" className='flex items-center text-primary/80'>
                                <input
                                    type="checkbox"
                                    className='mr-2'
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                />
                                Remember Me
                            </label>

                            <Link
                                href={'/forgot-password'}
                                className='text-blue-500 text-sm'
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            disabled={loginMutation?.isPending}
                            type='submit'
                            variant={"default"}
                            className='w-full'
                        >
                            {loginMutation?.isPending ? "Logging in..." : "Login"}
                        </Button>

                        {serverError && (
                            <p className='text-red-500 text-sm mt-2'>{serverError}</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

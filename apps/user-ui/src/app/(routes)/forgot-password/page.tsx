'use client'
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';

type FormData = {
    email: string;
    password: string;
};



const ForgotPasswordPage = () => {

    const [step, setStep] = useState<"email" | "otp" | "reset">("email");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(true);
    const [serverError, setServerError] = useState<string | null>(null);


    const inputRef = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const startResendTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }

                return prev - 1;
            })
        }, 1000)
    }

    const requestOtpMutation = useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/forgot-password-user}`,
                {
                    email
                });

            return response.data;
        },

        onSuccess: (_, { email }) => {
            setUserEmail(email);
            setStep("otp");
            setServerError(null);
            setCanResend(false);
            startResendTimer();
        },

        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || "Invalide OTP, Try again!";
            setServerError(errorMessage);
        },
    })

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userEmail) return;

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/verify-forgot-password-user}`,
                {
                    email: userEmail,
                    otp: otp.join("")
                });
            return response.data;
        },

        onSuccess: () => {
            setStep("reset")
            setServerError(null);

        },

        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || "Invalide OTP, Try again!";
            setServerError(errorMessage);
        },
    })

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ password }: { password: string }) => {
            if (!password) return

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/reset-password-user}`,
                {
                    email: userEmail,
                    newPassword: password
                });

            return response.data;
        },

        onSuccess: () => {
            setStep("email");
            // toast.success("Password reset successfully! Please login with your new password.")
            setServerError(null);
            router.push("/login");
        },

        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message;
            setServerError(errorMessage || "Failed to reset password , Try Again!");
        },
    })

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < inputRef.current.length - 1) {
            inputRef.current[index + 1]?.focus();
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Backspace" && !otp[index] && index > 0) {
            inputRef.current[index - 1]?.focus();
        }
    }

    const onSubmitEmail = ({ email }: { email: string }) => {
        requestOtpMutation.mutate({ email });
    }
    const onSubmitPassword = ({ password }: { password: string }) => {
        resetPasswordMutation.mutate({ password });
    }




    return (
        <div className='w-full py-10 min-h-[85vh]'>
            <h1 className='text-4xl font-poppins font-semibold text-center'>Forgot Password</h1>
            <p className='text-center text-lg font-medium py-3 '>Home .Forgot Password</p>

            <div className='w-full flex justify-center'>
                <div className='md:w-[480px] p-8 shadow rounded-lg bg-accent'>
                    {step === "email" && (
                        <>
                            <h3 className='text-3xl font-semibold text-center mb-2'>Login to Artistry Cart</h3>
                            <p className='text-center text-gray-500 mb-4'>Go back to login{' '}

                                <Link href={'/login'} className='text-blue-500'>Login</Link>
                            </p>


                            <div className='flex items-center my-5 text-sm text-primary/60'>
                                <div className='flex-1 border-t ' />
                                <span className='px-3'>or Sign in with Email</span>
                                <div className='flex-1 border-t ' />
                            </div>

                            <form onSubmit={handleSubmit(onSubmitEmail)}>
                                <label className='block text-primary/90 mb-1'>Email</label>
                                <input type="email" placeholder='Support@artistrycart.com'
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


                                <Button
                                    disabled={requestOtpMutation.isPending}
                                    type='submit' variant={"default"}
                                    className='w-full mt-4'>
                                    {requestOtpMutation.isPending ? "Submitting..." : "Submit"}
                                </Button>

                                {serverError && (
                                    <p className='text-red-500 text-sm mt-2'>{serverError}</p>
                                )}


                            </form>
                        </>
                    )}


                    {step === "otp" && (
                        <div >
                            <h3 className='text-xl font-semibold text-center mb-4'>Enter OTP</h3>
                            <div className='flex justify-center gap-6 '>
                                {otp.map((digit, index) => (
                                    <input type="text" key={index} ref={(el) => {
                                        if (el) inputRef.current[index] = el;
                                    }}
                                        maxLength={1}
                                        className='w-12 h-12 text-center border border-border outline-none rounded'
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    />
                                ))}
                            </div>

                            <Button className='w-full mt-4 text-lg cursor-pointer py-2 rounded-lg'
                                disabled={verifyOtpMutation.isPending}
                                onClick={() => verifyOtpMutation.mutate()}
                            >
                                {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                            </Button>

                            <p className='text-center text-sm mt-4'>
                                {canResend ? (
                                    <Button
                                        onClick={() => requestOtpMutation.mutate({ email: userEmail! })}
                                        className='cursor-pointer'
                                    >Resend OTP</Button>
                                ) : (`Resend OTP in ${timer}`)}
                            </p>
                            {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                                <p className='text-red-500 mt-2 text-sm'>{verifyOtpMutation.error?.message || verifyOtpMutation.error?.response?.data?.message}</p>
                            )}
                        </div>
                    )}

                    {step === "reset" && (
                        <>
                            <h3 className='text-xl font-semibold text-center mb-4'>
                                Resend Password
                            </h3>

                            <form onSubmit={handleSubmit(onSubmitPassword)}>
                                <label className='block text-primary/90 mb-1'>New Password</label>

                                <input type={"password"}
                                    placeholder='Min. 6 charecters'
                                    className='w-full p-2 border border-border outline-0 rounded mb-'
                                    {...register("password", {
                                        required: "Password is Required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 charecters",
                                        }
                                    })}
                                />

                                {errors.password && (
                                    <p className='text-red-500 text-sm'>
                                        {String(errors.password.message)}
                                    </p>
                                )}

                                <Button
                                    type='submit'
                                    variant={"default"}
                                    className='w-full mt-4'
                                    disabled={resetPasswordMutation.isPending}
                                >
                                    {resetPasswordMutation.isPending ? "Resetting ..." : "Reset Password"}
                                </Button>
                            </form>
                        </>
                    )}


                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage
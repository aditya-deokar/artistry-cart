'use client'
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

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
                `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/forgot-password-user`,
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
                `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/verify-forgot-password-user`,
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
                `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/reset-password-user`,
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            {step === "email" && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-6"
                >
                    <div className="mb-8 text-center sm:text-left">
                        <h1 className="text-3xl font-display font-bold tracking-tight">Forgot password?</h1>
                        <p className="text-muted-foreground mt-2">
                            Enter your email address to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Email</label>
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
                            {errors.email && <p className="text-sm font-medium text-destructive mt-1">{String(errors.email.message)}</p>}
                        </div>

                        <Button
                            disabled={requestOtpMutation.isPending}
                            type="submit"
                            className="w-full h-12 text-base rounded-xl font-medium transition-all duration-300 hover:scale-[1.01]"
                        >
                            {requestOtpMutation.isPending ? "Sending code..." : "Send Reset Code"}
                        </Button>

                        {serverError && <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-3 rounded-lg">{serverError}</p>}
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                            Back to login
                        </Link>
                    </p>
                </motion.div>
            )}

            {step === "otp" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
                    <div className="mb-8">
                        <h3 className="text-3xl font-display font-bold tracking-tight">Enter Code</h3>
                        <p className="text-muted-foreground mt-2">We sent a code to {userEmail}</p>
                    </div>

                    <div className="flex justify-center gap-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                ref={(el) => { if (el) inputRef.current[index] = el; }}
                                maxLength={1}
                                className="w-14 h-14 text-center text-2xl font-semibold border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            />
                        ))}
                    </div>

                    <Button
                        disabled={verifyOtpMutation.isPending}
                        onClick={() => verifyOtpMutation.mutate()}
                        className="w-full h-12 text-base rounded-xl font-medium mt-4 transition-all duration-300 hover:scale-[1.01]"
                    >
                        {verifyOtpMutation.isPending ? "Verifying..." : "Verify Code"}
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        {canResend ? (
                            <button onClick={() => requestOtpMutation.mutate({ email: userEmail! })} className="text-primary font-medium hover:underline">
                                Resend code
                            </button>
                        ) : (
                            <span>Resend code in {timer}s</span>
                        )}
                    </div>
                    {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                        <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg">
                            {verifyOtpMutation.error?.message || (verifyOtpMutation.error?.response?.data as any)?.message}
                        </p>
                    )}
                </motion.div>
            )}

            {step === "reset" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="mb-8 text-center sm:text-left">
                        <h3 className="text-3xl font-display font-bold tracking-tight">Reset Password</h3>
                        <p className="text-muted-foreground mt-2">Create a new strong password.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">New Password</label>
                            <input
                                type="password"
                                placeholder="Min. 6 characters"
                                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                                {...register("password", {
                                    required: "Password is Required",
                                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                                })}
                            />
                            {errors.password && <p className="text-sm font-medium text-destructive mt-1">{String(errors.password.message)}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base rounded-xl font-medium transition-all duration-300 hover:scale-[1.01]"
                            disabled={resetPasswordMutation.isPending}
                        >
                            {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                </motion.div>
            )}
        </motion.div>
    );
}

export default ForgotPasswordPage
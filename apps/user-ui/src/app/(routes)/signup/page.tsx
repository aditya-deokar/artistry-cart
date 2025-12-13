'use client'
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from "axios"
import { motion } from 'framer-motion';

type FormData = {
    name: string;
    email: string;
    password: string;
};



const SignUpPage = () => {

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [showOtp, setshowOtp] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [userData, setUserData] = useState<FormData | null>(null);
    const inputRef = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const signUpMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/user-registration`,
                data
            );
            return response.data;
        },
        onSuccess: (_, formData) => {
            setUserData(formData);
            setshowOtp(true);
            setCanResend(false);
            setTimer(60);
            startResendTimer();
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/verify-user`,
                {
                    ...userData,
                    otp: otp.join(""),
                }
            );
            return response.data;
        },
        onSuccess: () => {
            router.push("/login");

        }
    });

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

    const reSendOtp = () => {
        if (userData) {
            signUpMutation.mutate(userData);
        }
    }

    const onSubmit = (data: FormData) => {
        // console.log(data);
        signUpMutation.mutate(data);
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            {!showOtp ? (
                <>
                    <div className="mb-8 text-center sm:text-left">
                        <h1 className="text-3xl font-display font-bold tracking-tight">Create an account</h1>
                        <p className="text-muted-foreground mt-2">
                            Enter your details below to create your account
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* OAuth Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Button
                                variant="outline"
                                className="h-12 gap-2 text-sm font-normal rounded-xl border-muted-foreground/20 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                                onClick={() => {
                                    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/oauth/google`;
                                }}
                                type="button"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </Button>

                            <Button
                                variant="outline"
                                className="h-12 gap-2 text-sm font-normal rounded-xl border-muted-foreground/20 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                                onClick={() => {
                                    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/oauth/github`;
                                }}
                                type="button"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                                </svg>
                                GitHub
                            </Button>

                            <Button
                                variant="outline"
                                className="h-12 gap-2 text-sm font-normal rounded-xl border-muted-foreground/20 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                                onClick={() => {
                                    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/oauth/facebook`;
                                }}
                                type="button"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with email
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                                    {...register("name", { required: "Name is Required" })}
                                />
                                {errors.name && <p className="text-sm font-medium text-destructive mt-1">{String(errors.name.message)}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Email</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                                    {...register("email", {
                                        required: "Email is Required",
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid Email Address" },
                                    })}
                                />
                                {errors.email && <p className="text-sm font-medium text-destructive mt-1">{String(errors.email.message)}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Password</label>
                                <div className="relative">
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        placeholder="Create a password"
                                        className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 transition-all duration-300"
                                        {...register("password", {
                                            required: "Password is Required",
                                            minLength: { value: 6, message: "Password must be at least 6 characters" }
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
                                {errors.password && <p className="text-sm font-medium text-destructive mt-1">{String(errors.password.message)}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base rounded-xl font-medium transition-all duration-300 hover:scale-[1.01]"
                                disabled={signUpMutation.isPending}
                            >
                                {signUpMutation.isPending ? "Creating account..." : "Create account"}
                            </Button>
                        </form>

                        {signUpMutation?.isError && signUpMutation.error instanceof AxiosError && (
                            <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg text-center">
                                {(signUpMutation.error?.response?.data as any)?.message || signUpMutation.error?.message}
                            </p>
                        )}

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </>
            ) : (
                <div className="space-y-6 text-center">
                    <div className="mb-8">
                        <h3 className="text-3xl font-display font-bold tracking-tight">Verify email</h3>
                        <p className="text-muted-foreground mt-2">
                            We sent a verification code to {userData?.email}
                        </p>
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
                        className="w-full h-12 text-base rounded-xl font-medium mt-6 transition-all duration-300 hover:scale-[1.01]"
                        disabled={verifyOtpMutation.isPending}
                        onClick={() => verifyOtpMutation.mutate()}
                    >
                        {verifyOtpMutation.isPending ? "Verifying..." : "Verify Email"}
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        {canResend ? (
                            <button onClick={reSendOtp} className="text-primary font-medium hover:underline">
                                Resend verification code
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
                </div>
            )}
        </motion.div>
    )
}

export default SignUpPage
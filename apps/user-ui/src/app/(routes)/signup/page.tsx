'use client'
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, UserIcon } from 'lucide-react';
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

                        <Button variant="outline" className="w-full h-12 gap-3 text-base font-normal rounded-xl border-muted-foreground/20 hover:bg-accent hover:text-accent-foreground transition-all duration-300">
                            <UserIcon size={20} className="text-[#DB4437]" aria-hidden="true" />
                            Sign up with Google
                        </Button>

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
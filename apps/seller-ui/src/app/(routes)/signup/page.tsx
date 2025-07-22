'use client'


import { Eye, EyeOff, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from "axios"
import { useMutation } from '@tanstack/react-query';
import { countries } from '@/utils/countries';

// type FormData = {
//     name: string;
//     email: string;
//     password: string;
// };



const SignUpPage = () => {

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [showOtp, setshowOtp] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [sellerData, setSellerData] = useState<FormData | null>(null);
    const [sellerId, setSellerId] =useState(null);
    const inputRef = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const signUpMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/seller-registration`,
                data
            );
            return response.data;
        },
        onSuccess: (_, formData) => {
            setSellerData(formData);
            setshowOtp(true);
            setCanResend(false);
            setTimer(60);
            startResendTimer();
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!sellerData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/verify-seller`,
                {
                    ...sellerData,
                    otp: otp.join(""),
                }
            );
            return response.data;
        },
        onSuccess: (data) => {
            setSellerId(data?.seller?.id);
            setActiveStep(2);
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
        if (sellerData) {
            signUpMutation.mutate(sellerData);
        }
    }

    const onSubmit = (data: any) => {
        // console.log(data);
        signUpMutation.mutate(data);
    }
    return (
        <div className="w-full flex flex-col items-center pt-10 min-h-screen">

            {/* Stepper */}

            <div className='mb-8 w-full md:w-1/2 relative items-center justify-between flex'>
                <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />

                {[1, 2, 3].map((step, index) => (
                    <div key={step} className=''>
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold 
                            ${step <= activeStep ? 'bg-blue-600 ' : 'bg-gray-300'}`}>
                            {step}
                        </div>
                        <span className='mt-[-15px] '>
                            {step == 1 ? "Create Account" : step == 2 ? "Setup Shop" : "Connect Bank"}
                        </span>
                    </div>
                ))}
            </div>

            {/* steps contents */}

            <div className='w-[480px] p-8 shadow rounded-lg'>
                {activeStep == 1 && (
                    <>
                        {!showOtp ? (
                            <form onSubmit={handleSubmit(onSubmit)}>

                                <h3 className='text-2xl font-semibold text-center mb-4'>Create Account</h3>

                                <label className='block text-primary/90 mb-1'>Name</label>
                                <input type="text" placeholder='Aditya Deokar'
                                    className='w-full p-2 border border-border outline-0 rounded mb-1'
                                    {...register("name", {
                                        required: "Name is Required",
                                    })}

                                />
                                {errors.name && (
                                    <p className='text-red-500 text-sm'>
                                        {String(errors.name.message)}
                                    </p>
                                )}


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

                                <label className='block text-primary/90 mb-1'>Phone Number</label>
                                <input type="tel" placeholder='999*******'
                                 className='w-full p-2 border border-border outline-0 rounded mb-1'
                                 {...register("phone_number", {
                                    required:"Phone Number is required",
                                    pattern:{
                                        value:/^\+?[1-9]\d{1,14}$/,
                                        message:"Invalide phone number format",
                                    },
                                    minLength: {
                                        value: 10,
                                        message: "Phone Number must be at least 10 digits"
                                    },
                                    maxLength: {
                                        value: 15,
                                        message: "Phone Number cannot exceed 15 digits"
                                    }
                                 })}
                                />
                                {errors.phone_number && (
                                        <p className='text-red-500 text-sm'>
                                            {String(errors.phone_number.message)}
                                        </p>
                                )}


                                <label className='block text-primary/90 mb-1'>Country</label>
                                <select 
                                    className='w-full p-2 border border-gray-700 outline-0 rounded-[4px]'
                                    {...register("country",{
                                        required: "Country is Required"
                                    })}
                                >
                                    <option value="">Slect your country</option>
                                    {countries.map((country)=>(
                                        <option value={country.code} key={country.code}>
                                            {country.name}
                                        </option>
                                    ))}

                                </select>
                                {errors.country && (
                                        <p className='text-red-500 text-sm'>
                                            {String(errors.country.message)}
                                        </p>
                                )}


                                <label className='block text-primary/90 mb-1'>Password</label>
                                <div className='relative'>
                                    <input type={passwordVisible ? "text" : "password"}
                                        placeholder='Min. 6 charecters'
                                        className='w-full p-2 border border-border outline-0 rounded mb-1'
                                        {...register("password", {
                                            required: "Password is Required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 charecters",
                                            }
                                        })}
                                    />
                                    <button onClick={() => setPasswordVisible(!passwordVisible)}
                                        className='absolute inset-y-0 p-2 origin-center right-3 flex item-center text-primary/80'
                                    >
                                        {passwordVisible ? <Eye /> : <EyeOff />}
                                    </button>
                                    {errors.password && (
                                        <p className='text-red-500 text-sm'>
                                            {String(errors.password.message)}
                                        </p>
                                    )}



                                </div>

                                <button
                                    type='submit'
                                    // variant={"default"} 
                                    className='w-full mt-4'
                                    disabled={signUpMutation.isPending}
                                >
                                    {signUpMutation.isPending ? "Signing up.. " : "Signup"}
                                </button>
                                {signUpMutation.isError && signUpMutation.error instanceof AxiosError && (
                                    <p className='text-red-500 text-sm mt-2'>
                                        { signUpMutation.error.response?.data?.message || signUpMutation.error.message }
                                    </p>
                                )}

                                <p 
                                    className='pt-3 text-center'
                                >Already have an account?{' '}
                                    <Link href={"/login"} className='text-blue-500'>Login</Link>
                                </p>

                            </form>
                        ) : (
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

                                <button className='w-full mt-4 text-lg cursor-pointer py-2 rounded-lg'
                                    disabled={verifyOtpMutation.isPending}
                                    onClick={() => verifyOtpMutation.mutate()}
                                >
                                    {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                                </button>

                                <p className='text-center text-sm mt-4'>
                                    {canResend ? (
                                        <button
                                            onClick={reSendOtp}
                                            className='cursor-pointer'
                                        >Resend OTP</button>
                                    ) : (`Resend OTP in ${timer}`)}
                                </p>
                                {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                                    <p className='text-red-500 mt-2 text-sm'>{verifyOtpMutation.error?.message || verifyOtpMutation.error?.response?.data?.message}</p>
                                )}

                               
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    )
}

export default SignUpPage
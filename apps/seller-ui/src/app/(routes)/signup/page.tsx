'use client'

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from "axios";
import { useMutation } from '@tanstack/react-query';
import { countries } from '@/utils/countries';
import CreateShop from '@/shared/modules/auth/CreateShop';
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const SignUpPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [showOtp, setshowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const inputRef = useRef<(HTMLInputElement | null)[]>([]);

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
      });
    }, 1000);
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
    signUpMutation.mutate(data);
  }

  const connectStripe = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/create-stripe-link`, { sellerId });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Stripe Connection Error");
    }
  }

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-screen">
      {/* Stepper */}
      <div className='mb-8 w-full md:w-1/2 relative items-center justify-between flex'>
        <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />
        {[1, 2, 3].map((step) => (
          <div key={step} className='flex flex-col items-center'>
            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold 
                ${step <= activeStep ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              {step}
            </div>
            <span className='text-xs mt-1'>
              {step == 1 ? "Create Account" : step == 2 ? "Setup Shop" : "Connect Bank"}
            </span>
          </div>
        ))}
      </div>

      {/* Card Wrapper */}
      <Card className="w-full max-w-[480px] p-6 shadow rounded-lg">
        <CardContent>
          {activeStep === 1 && (
            <>
              {!showOtp ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <h3 className='text-2xl font-semibold text-center'>Create Account</h3>

                  <div>
                    <Label>Name</Label>
                    <Input placeholder="Aditya Deokar" {...register("name", { required: "Name is Required" })} />
                    {errors.name && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input type="email" placeholder="support@artistrycart.com"
                      {...register("email", {
                        required: "Email is Required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid Email Address",
                        },
                      })}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{String(errors.email.message)}</p>}
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <Input placeholder="999*******" {...register("phone_number", {
                      required: "Phone Number is required",
                      pattern: {
                        value: /^\+?[1-9]\d{1,14}$/,
                        message: "Invalid phone number format",
                      },
                      minLength: { value: 10, message: "Must be at least 10 digits" },
                      maxLength: { value: 15, message: "Max 15 digits" },
                    })} />
                    {errors.phone_number && <p className="text-red-500 text-sm">{String(errors.phone_number.message)}</p>}
                  </div>

                  <div className='w-full space-y-1'>
                    <Label>Country</Label>
                    <Select  {...register("country", { required: "Country is Required" })} defaultValue="">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent >
                        {countries.map((country) => (
                          <SelectItem value={country.code} key={country.code}>{country.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-red-500 text-sm">{String(errors.country.message)}</p>}
                  </div>

                  <div>
                    <Label>Password</Label>
                    <div className="relative">
                      <Input type={passwordVisible ? "text" : "password"} placeholder="Min. 6 characters"
                        {...register("password", {
                          required: "Password is Required",
                          minLength: { value: 6, message: "Min 6 characters" }
                        })} />
                      <Button type="button" variant="ghost" size="icon"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute right-2 top-2.5 h-7 w-7 p-0"
                      >
                        {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm">{String(errors.password.message)}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
                    {signUpMutation.isPending ? "Signing up..." : "Signup"}
                  </Button>

                  {signUpMutation.isError && signUpMutation.error instanceof AxiosError && (
                    <p className='text-red-500 text-sm mt-2'>
                      {signUpMutation.error.response?.data?.message || signUpMutation.error.message}
                    </p>
                  )}

                  <p className='pt-3 text-center text-sm'>
                    Already have an account? <Link href="/login" className='text-blue-500'>Login</Link>
                  </p>
                </form>
              ) : (
                <>
                  <h3 className='text-xl font-semibold text-center mb-4'>Enter OTP</h3>
                  <div className='flex justify-center gap-4'>
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => { if (el) inputRef.current[index] = el }}
                        maxLength={1}
                        className='w-12 h-12 text-center text-lg'
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      />
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => verifyOtpMutation.mutate()}
                    disabled={verifyOtpMutation.isPending}
                  >
                    {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <p className='text-center text-sm mt-4'>
                    {canResend ? (
                      <Button variant="link" onClick={reSendOtp}>Resend OTP</Button>
                    ) : (`Resend OTP in ${timer}`)}
                  </p>
                  {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                    <p className='text-red-500 mt-2 text-sm'>{verifyOtpMutation.error?.message || verifyOtpMutation.error?.response?.data?.message}</p>
                  )}
                </>
              )}
            </>
          )}

          {activeStep === 2 && (
            <CreateShop sellerId={sellerId!} setActiveStep={setActiveStep} />
          )}

          {activeStep === 3 && (
            <div className='text-center'>
              <h1 className='text-2xl font-semibold'>Withdraw Method</h1>
              <Button className='w-full mt-6' onClick={connectStripe}>Connect Stripe</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;

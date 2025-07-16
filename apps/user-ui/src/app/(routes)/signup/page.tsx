'use client'
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import  axios ,{ AxiosError } from "axios"

type FormData = {
    name: string;
    email: string;
    password: string;
};



const SignUpPage = () => {

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showOtp, setshowOtp] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [userData, setUserData] = useState<FormData |null>(null);
    const inputRef = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const signUpMutation = useMutation({
        mutationFn: async(data:FormData)=>{
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`,
                 data
                );
            return response.data;
        },
        onSuccess: (_, formData)=>{
            setUserData(formData);
            setshowOtp(true);
            setCanResend(false);
            setTimer(60);
            startResendTimer();
        }
    });

    const verifyOtpMutation= useMutation({
        mutationFn: async()=>{
            if(!userData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`,
                {
                    ...userData,
                    otp: otp.join(""),
                }
            );
           return response.data;
        },  
        onSuccess :()=>{
            router.push("/login");
            
        }
    });

    const startResendTimer= ()=>{
        const interval = setInterval(()=>{
            setTimer((prev)=>{
                if(prev <= 1){
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }

                return prev -1 ;
            })
        }, 1000)
    }

    const handleOtpChange =(index:number, value:string)=>{
        if(!/^[0-9]?$/.test(value)) return;

        const newOtp= [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if(value && index < inputRef.current.length -1 ){
            inputRef.current[index +1]?.focus();
        }
    }

    const handleOtpKeyDown = (index: number, e:React.KeyboardEvent<HTMLInputElement>)=>{
        if(e.key == "Backspace" && !otp[index] && index > 0){
            inputRef.current[index -1 ]?.focus();
        }
    }

    const reSendOtp =()=>{

    }

    const onSubmit = (data: FormData) => {
        // console.log(data);
        signUpMutation.mutate(data);
    }
    return (
        <div className='w-full py-10 min-h-[85vh]'>
            <h1 className='text-4xl font-poppins font-semibold text-center'>Sign Up</h1>
            <p className='text-center text-lg font-medium py-3 '>Home . Signup</p>

            <div className='w-full flex justify-center'>
                <div className='md:w-[480px] p-8 shadow rounded-lg bg-accent'>
                    <h3 className='text-3xl font-semibold text-center mb-2'>Signup to Artistry Cart</h3>
                    <p className='text-center text-gray-500 mb-4'>Already have an account? {' '}

                        <Link href={'/login'} className='text-blue-500'>log in</Link>
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
                        <div className='flex-1 border-t '/>
                            <span className='px-3'>or Sign in with Email</span>
                        <div className='flex-1 border-t '/>
                    </div>



                   {!showOtp ? (
                     <form onSubmit={handleSubmit(onSubmit)}>

                         <label className='block text-primary/90 mb-1'>Name</label>
                        <input type="text" placeholder='Aditya Deokar' 
                        className='w-full p-2 border border-border outline-0 rounded mb-1'
                        {...register("name",{
                            required:"Name is Required",
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
                        {...register("email",{
                            required:"Email is Required",
                            pattern:{
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ ,
                                message: "Invalid Email Address",
                            },
                        })}
                        
                        />
                        {errors.email && (
                            <p className='text-red-500 text-sm'>
                                {String(errors.email.message)}
                            </p>
                        )}

                        <label className='block text-primary/90 mb-1'>Password</label>
                        <div className='relative'>
                            <input type={passwordVisible ? "text" : "password"}
                            placeholder='Min. 6 charecters'
                            className='w-full p-2 border border-border outline-0 rounded mb-'
                            {...register("password", {
                                required:"Password is Required",
                                minLength:{
                                    value: 6, 
                                    message:"Password must be at least 6 charecters",
                                }
                            })}
                            />
                            <button  onClick={()=> setPasswordVisible(!passwordVisible)}
                                className='absolute inset-y-0 p-2 origin-center right-3 flex item-center text-primary/80'
                                >
                                    {passwordVisible ? <Eye/> : <EyeOff/> }
                            </button>
                            {errors.password && (
                                <p className='text-red-500 text-sm'>
                                    {String(errors.password.message)}
                                </p>
                            )}

                            

                        </div>

                        <Button 
                            type='submit' 
                            variant={"default"} 
                            className='w-full mt-4'
                            disabled={signUpMutation.isPending}
                            >
                            {signUpMutation.isPending ? "Signing up.. " : "Signup"}
                        </Button>

                        {serverError && (
                            <p className='text-red-500 text-sm mt-2'>{serverError}</p>
                        )}


                    </form>
                   ) : (
                    <div >
                        <h3 className='text-xl font-semibold text-center mb-4'>Enter OTP</h3>
                        <div className='flex justify-center gap-6 '>
                            {otp.map((digit, index)=>(
                                <input type="text" key={index} ref={(el)=>{
                                    if(el) inputRef.current[index]= el;
                                }}
                                maxLength={1}
                                className='w-12 h-12 text-center border border-border outline-none rounded'
                                value={digit}
                                onChange={(e)=> handleOtpChange(index, e.target.value)}
                                onKeyDown={(e)=> handleOtpKeyDown(index, e)}
                                />
                            ))}
                        </div>

                        <Button className='w-full mt-4 text-lg cursor-pointer py-2 rounded-lg'
                        disabled={verifyOtpMutation.isPending}
                        onClick={()=> verifyOtpMutation.mutate()}
                        >
                             {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"} 
                        </Button>

                        <p className='text-center text-sm mt-4'>
                            {canResend ? (
                                <Button
                                onClick={reSendOtp}
                                className='cursor-pointer'
                                >Resend OTP</Button>
                            ):(`Resend OTP in ${timer}`)}
                        </p>
                        {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                            <p className='text-red-400 mt-2'>{verifyOtpMutation.error.message}</p>
                        )}
                    </div>
                   )}


                </div>
            </div>
        </div>
    )
}

export default SignUpPage
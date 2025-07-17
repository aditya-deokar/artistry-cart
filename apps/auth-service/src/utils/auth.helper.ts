import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler';
import { NextFunction, Request, Response } from 'express';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendMail';
import prisma from '../../../../packages/libs/prisma';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export const validationRegistrationData =(data:any, userType:'user' | 'seller') => {
    const { name , email, password, phone_number, country } =data;

    if(!name || !email || !password || (userType === 'seller' && (!phone_number || !country)) ){
        throw new ValidationError(`Missing Required fields!`)
    }

    if(!emailRegex.test(email)){
        throw new ValidationError("Invalid email format!");
    }

}


export const checkOTPRestrictions = async(email:string, next:NextFunction) => {
    if(await redis.get(`otp-lock:${email}`)){
        return next( new ValidationError("Account locked due to multiple failed attempts! Try again after 30 minutes"));
    }

    if(await redis.get(`otp_spam_lock:${email}`)){
        return next(new ValidationError("Too many OTP requests! Please wait 1 hour before requesting again."));
    }

    if(await redis.get(`otp_cooldown:${email}`)){
        return next(new ValidationError("Please wait 1 minute before requesting a new OTP!"));
    }
}

export const sendOTP = async(name:string, email:string, template:string) => {
    const otp = crypto.randomInt(1000, 9999).toString();

    await sendEmail(email, 'Verify Your Email', template, {name, otp});

    // Redis 
    await redis.set(`otp:${email}`, otp, 'EX', 300);
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);

}


export const trackOTPRequests = async (email:string, next:NextFunction)=>{
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

    if(otpRequests >= 2){
        await redis.set(`otp_span_lock:${email}`, "locked" , "EX", 3600);
        return next (new ValidationError("Too many OTP requests. Please wait 1 hour before requesting again."))
    }

    await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600)
}


export const verifyOTP= async(email:string, otp:string, next:NextFunction)=>{
    const storedOtp= await redis.get(`otp:${email}`)
    if(!storedOtp) throw next(new ValidationError("Invalide or Expired OTP!"));

    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

    if(storedOtp !== otp ){
        if(failedAttempts >= 2){
            await redis.set(`otp_lock:${email}`, "locked", "EX", 1800);
            await redis.del(`otp_lock:${email}`, failedAttemptsKey);

            
            throw new ValidationError("Too many failed attempts, Your account is locked for 30 mins!")
            
        }

        await redis.set(failedAttemptsKey, failedAttempts +1, "EX", 300 );

        
        throw new ValidationError(`Incorrect OTP. ${2 - failedAttempts} attempts left.`)
        
    }

    await redis.del(`otp:${email}`, failedAttemptsKey);

}

export const handleForgotPassword = async(req:Request, res:Response, next:NextFunction, userType: "user"| "seller")=>{
    try {
        const { email } =req.body;

        if(!email) throw new ValidationError("Email is Required!");

        // find user / seller in DB
        const user = userType === 'user' && await prisma.users.findUnique({
            where:{
                email: email
            }
        });

        if(!user) throw new ValidationError(`${userType} not Found!`);

        // Check otp restriction 
        await checkOTPRestrictions(email, next);
        await trackOTPRequests(email, next);


        // Generate OTP and send
        await sendOTP(user.name, email, "forgot-password-user-mail");

        res.status(200).json({
            message: "OTP sent to email. Please verify your account."
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
} 


export const verifyForgotPasswordOTP= async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const { email, otp} = req.body;
        if(!email || !otp){
            throw new ValidationError("Email and OTP are required!");
        }

        await verifyOTP(email, otp, next);

        res.status(200).json({
            message: "OTP verified, You can now reset your password."
        });

    } catch (error) {
        next(error)
    }
}
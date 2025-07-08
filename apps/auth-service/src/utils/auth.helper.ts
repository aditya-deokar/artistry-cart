import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler';
import { NextFunction } from 'express';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendMail';

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
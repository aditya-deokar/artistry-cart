// Register a new user

import { Request, Response, NextFunction } from "express";
import {
  checkOTPRestrictions,
  sendOTP,
  trackOTPRequests,
  validationRegistrationData,
  verifyOTP,
} from "../utils/auth.helper";
import bcrypt from 'bcryptjs';
import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/prisma";

// Register User
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body)
    validationRegistrationData(req.body, "user");

    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: {
        email: email
      } ,
    });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await checkOTPRestrictions(email, next);

    await trackOTPRequests(email, next);

    await sendOTP(name, email, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });

  } catch (error) {
    console.log(error);
    return next(error);
  }
};


// Verify User with OTP

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name }= req.body;

    if(!email || !otp || !password || !name){
      return next(new ValidationError("All feilds are Required"));

    }

    const existingUser = await prisma.users.findUnique({
      where:{
        email: email
      }
    })

    if(existingUser){
      return next(new ValidationError("User already exists with this email!"));
    }

    await verifyOTP(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data:{
        name : name,
        email : email,
        password : hashedPassword,
      
      }
    })

    res.status(201).json({
      success: true,
      message: "User Registered Successfully!"
    });

    
  } catch (error) {
    return next(error) 
  }
}

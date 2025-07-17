// Register a new user

import { Request, Response, NextFunction } from "express";
import {
  checkOTPRestrictions,
  handleForgotPassword,
  sendOTP,
  trackOTPRequests,
  validationRegistrationData,
  verifyForgotPasswordOTP,
  verifyOTP,
} from "../utils/auth.helper";
import bcrypt from "bcryptjs";
import { AuthError, ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/prisma";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";

// Register User
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    validationRegistrationData(req.body, "user");

    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: {
        email: email,
      },
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
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return next(new ValidationError("All feilds are Required"));
    }

    const existingUser = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await verifyOTP(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: "User Registered Successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

// Login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and Password are required!"));
    }

    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return next(new AuthError("User doen't exists!"));
    }

    // verify password
    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) {
      return next(new AuthError("Invalid email or password"));
    }

    // Generate Access and Refresh Tokens

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: "user",
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        role: "user",
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    // Store the refresh and access token in an HTTPOnly secure cookie
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    res.status(200).json({
      meassage: "Login successfull!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Refresh Token User
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return new ValidationError("Unauthorized! No Refresh Token ");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || decoded.role) {
      return new JsonWebTokenError("Forbidden Invalid refresh tokens.");
    }

    // let account ;
    // if(decoded.role == "user"){
    const user = await prisma.users.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return new AuthError("Forbidden! user not found");
    }

    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    setCookie(res, "access_token", newAccessToken);
    return res.status(201).json({
      success:true
    })


  } catch (error) {
    return next(error);
  }
};

// get login user info
export const getUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user= req.user;

    res.status(201).json({
      success: true,
      user
    });

    
  } catch (error) {
    next(error)
  }
}


// user Forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, "user");
};

// Verify Forgot Password OTP
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgotPasswordOTP(req, res, next);
};

// Reset user password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassord } = req.body;

    if (!email || !newPassord) {
      return next(new ValidationError("Email and new Password are required!"));
    }

    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return next(new ValidationError("User Not Found!"));
    }

    const isSamePassword = await bcrypt.compare(newPassord, user.password!);

    if (isSamePassword) {
      return next(
        new ValidationError("New Password cannot be same as Old password!")
      );
    }

    // Hash new Password
    const hashedPassword = await bcrypt.hash(newPassord, 10);

    await prisma.users.update({
      where: {
        email: email,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

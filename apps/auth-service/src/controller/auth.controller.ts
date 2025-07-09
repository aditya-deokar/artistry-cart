// Register a new user

import { Request, Response, NextFunction } from "express";
import {
  checkOTPRestrictions,
  sendOTP,
  trackOTPRequests,
  validationRegistrationData,
} from "../utils/auth.helper";

import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/prisma";

export const userRegistration = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validationRegistrationData(req.body, "user");

    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: email,
    });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await checkOTPRestrictions(email, next);

    await trackOTPRequests(email, next);

    await sendOTP(email, name, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });

  } catch (error) {
    // console.log(error);
    return next(error);
  }
};

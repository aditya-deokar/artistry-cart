// Register a new user

import { Request, Response, NextFunction } from "express";
import Stripe from "stripe"
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
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import { createUniqueSlug, generateSlug } from "../utils/slugify";

interface TokenPayload {
    id: string;
    role: "user" | "seller";
}

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

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

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
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized. Refresh token is missing." });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as TokenPayload;


    if (!decoded.id || !decoded.role) {
      return res.status(403).json({ message: "Forbidden. Invalid refresh token payload." });
    }

    let account;
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      return res.status(403).json({ message: "Forbidden. No account found for this token." });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: account.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" } // A short-lived access token
    );

    
    // Generate a new refresh token as well
    const newRefreshToken = jwt.sign(
      { id: account.id, role: decoded.role },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" } // A longer-lived refresh token
    );

    // Set both new tokens in cookies
    setCookie(res, "access_token", newAccessToken);
    setCookie(res, "refresh_token", newRefreshToken); 

    req.user = account;
    req.role = decoded.role;

    
    return res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully.",
    });

  } catch (error) {
    
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Unauthorized. Refresh token has expired." });
    }
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Unauthorized. Refresh token is invalid." });
    }

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



// Register a new Seller
export const registerSeller = async(req:Request, res: Response, next:NextFunction)=>{
  try {
    validationRegistrationData(req.body, "seller");
    const {name, email} = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: {
        email: email
      }
    })

    if(existingSeller) {
      throw new ValidationError("Seller already exists with this email!");
    }

    await checkOTPRestrictions(email, next);
    await trackOTPRequests(email, next);
    await sendOTP(name, email, "seller-activation");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account."
    })

  } catch (error) {
    next(error);
  }
}

// verify seller with OTP
export const verifySeller = async(req:Request, res: Response, next:NextFunction)=>{
  try {
    const {email, otp, password, name, phone_number, country} = req.body;

    if(!email|| !otp || !password || !name || !phone_number || !country){
      return next(new ValidationError("All Fields are required!"))
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: {
        email: email
      }
    })

    if(existingSeller) {
      throw new ValidationError("Seller already exists with this email!");
    }

    await verifyOTP(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data:{
        name : name,
        email : email,
        password: hashedPassword,
        country :country,
        phone_number: phone_number,
      },
    })

    res.status(201).json({
      seller,
      message: "Seller Registered successfully!"
    })

    
  } catch (error) {
    next(error);
  }
}


// create new Shop
// export const createShop = async(req:Request, res: Response, next:NextFunction)=>{
//   try {
//     const { name, bio, address, opening_hours, website, category, sellerId } = req.body;

//     if(!name || !bio|| !address || !opening_hours || !category || !sellerId){
//       return next(new ValidationError("All fields are required!"))
//     }

//     const shopData : any={
//       name: name,
//       bio: bio,
//       address: address,
//       opening_hours: opening_hours,
//       category: category,
//       sellerId: sellerId,
//     };

//     if(website && website.trim() !== ""){
//       shopData.website = website;
//     }

//     const shop= await prisma.shops.create({
//       data:shopData
//     });

//     res.status(201).json({
//       success: true,
//       shop
//     })

//   } catch (error) {
//     next(error);
//   }
// }

// create new Shop
export const createShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } = req.body;

    // 1. Validation remains the same
    if (!name || !bio || !address || !opening_hours || !category || !sellerId) {
      return next(new ValidationError("All fields are required!"));
    }

    // 2. Generate the base slug from the shop name
    const baseSlug = generateSlug(name);

    // 3. Ensure the slug is unique by checking the database
    const uniqueSlug = await createUniqueSlug(baseSlug, prisma);

    // 4. Prepare the shop data, now including the unique slug
    const shopData: any = {
      name: name,
      slug: uniqueSlug, 
      bio: bio,
      address: address,
      opening_hours: opening_hours,
      category: category,
      sellerId: sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    // 5. Create the shop in the database with the new data
    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop, 
    });

  } catch (error) {
    next(error);
  }
};


const stripe= new Stripe(process.env.STRIPE_SECRETE_KEY!, {
  apiVersion : "2025-06-30.basil"
})

// create stripe connect account link
export const createStripeConnection = async(req:Request, res: Response, next:NextFunction)=>{
  try {
    const { sellerId } = req.body;

    if(!sellerId) return next(new ValidationError("Seller Id is Reqiured!"))
  
    const seller= await prisma.sellers.findUnique({
      where:{
        id: sellerId,
      }
    })

    if(!seller){
      return next(new ValidationError("Seller is Not available with this id!"));
    }

    const account = await stripe.accounts.create({
      type: "express",
      email: seller.email,
      country: "US",
      capabilities:{
        card_payments:{
          requested:true
        },
        transfers:{
          requested:true,
        },
      }
    })

    await prisma.sellers.update({
      where:{
        id: sellerId,
      },
      data:{
        stripeId: account.id
      }
    })

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type:"account_onboarding",
    }) 

    res.json({
      url: accountLink.url
    })

    } catch (error) {
    return next(error);
  }
}


// Login Seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and Password are required!"));
    }

    const user = await prisma.sellers.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return next(new AuthError("Seller doen't exists!!"));
    }

    // verify password
    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) {
      return next(new AuthError("Invalid email or password"));
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    // Generate Access and Refresh Tokens

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: "seller",
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        role: "seller",
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
      seller: {
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

// get login seller info
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller= req.user;
    console.log(seller)

    res.status(200).json({
      success: true,
      seller:seller
    });

    
  } catch (error) {
    next(error)
  }
}
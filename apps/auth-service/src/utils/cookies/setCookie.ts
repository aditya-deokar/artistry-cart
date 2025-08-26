import { Response } from "express";

export const setCookie = (res: Response, name: string, value: string) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie(name, value, {
    httpOnly: true,
    secure: isProd,                          // ❌ don't force in dev
    sameSite: isProd ? "none" : "lax",       // "none" for cross-site prod, "lax" is fine in dev
    maxAge: 7 * 24 * 60 * 60 * 1000,         // 7 days
    path: "/",                               // make sure it's available everywhere
  });
};

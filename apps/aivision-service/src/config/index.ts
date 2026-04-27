import { getHost, getPort } from "../../../../packages/utils/runtime";

export const config = {
  host: getHost(),
  port: getPort(6006),
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    url: process.env.DATABASE_URL || "",
  },

  googleApiKey: process.env.GOOGLE_API_KEY!,
  huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,

  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_API_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_API_KEY!,
    urlEndpoint:
      process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/adityadeokar/",
  },

  jwtSecret: process.env.ACCESS_TOKEN_SECRET!,

  rateLimit: {
    generate: { limit: 10, windowMs: 60000 },
    search: { limit: 30, windowMs: 60000 },
    concepts: { limit: 60, windowMs: 60000 },
    default: { limit: 100, windowMs: 60000 },
  },

  models: {
    text: "gemini-2.5-pro",
    flash: "gemini-2.5-flash",
    image: "gemini-2.5-flash-image",
  },
};

export function validateEnv(): void {
  const required = ["GOOGLE_API_KEY", "ACCESS_TOKEN_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
  }
}

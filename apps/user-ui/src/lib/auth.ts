import 'server-only'; // Ensures this code never runs on the client
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import prisma from '../../../../packages/libs/prisma';

// Define the shape of the user object we want to return
// This excludes sensitive fields like the password hash.
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  avatar: any; // Prisma's Json type is 'any'
  role: string;
}

/**
 * A server-side utility to get the currently authenticated user.
 * Reads the JWT from cookies, verifies it, and fetches user data from the database.
 * 
 * @returns {Promise<AuthenticatedUser | null>} The user object or null if not authenticated.
 */
export const getCurrentUser = async (): Promise<AuthenticatedUser | null> => {
  // 1. Get the token from the HTTP-only cookies
  const token = (await cookies()).get('access_token')?.value;

  // 2. If no token exists, the user is not logged in.
  if (!token) {
    return null;
  }

  try {
    // 3. Verify the token using the secret key.
    // This will throw an error if the token is invalid, expired, or malformed.
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET!) as { id: string };

    // 4. If token is valid, use the ID from the token to fetch the user from the database.
    const user = await prisma.users.findUnique({
      where: {
        id: decoded.id,
      },
      // 5. Select only the necessary, non-sensitive fields.
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    // The user object will be returned. If the user was deleted but the token is
    // still valid, this will correctly return null.
    return user;

  } catch (error) {
    // 6. If token verification fails (e.g., expired), an error is thrown.
    // We catch it and treat the user as unauthenticated.
    console.error('Authentication error:', error);
    return null;
  }
};
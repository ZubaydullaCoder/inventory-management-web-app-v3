import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

/**
 * Initializes NextAuth.js with the provided configuration.
 * This file exports the core handlers and helper functions for authentication.
 *
 * - `handlers`: The GET and POST handlers for the catch-all API route.
 * - `auth`: A server-side helper to get the current session.
 * - `signIn`: A server-side function to initiate the sign-in process.
 * - `signOut`: A server-side function to initiate the sign-out process.
 *
 * @see /src/app/api/auth/[...nextauth]/route.js
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

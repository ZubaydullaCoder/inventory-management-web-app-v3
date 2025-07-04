/**
 * This is the catch-all API route for NextAuth.js.
 * It exports the GET and POST handlers from the main auth configuration.
 * All authentication-related requests (e.g., /api/auth/signin/google, /api/auth/callback/google)
 * are handled by this single route.
 *
 * @see /src/auth.js
 */
import { GET, POST } from "@/auth";

export { GET, POST };

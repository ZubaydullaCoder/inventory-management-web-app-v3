import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

/**
 * Initializes and exports the NextAuth.js middleware.
 * This function leverages the `authorized` callback within `authConfig`
 * to protect application routes.
 */
export default NextAuth(authConfig).auth;

/**
 * The matcher configuration specifies which routes the middleware will run on.
 * This pattern ensures the middleware is applied to all paths except for
 * static assets and internal Next.js files, providing comprehensive security.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, which have their own auth checks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

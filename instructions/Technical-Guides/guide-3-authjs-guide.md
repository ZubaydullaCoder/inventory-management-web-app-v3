**Guide Document 3: Auth.js (NextAuth.v5): Best Practices for Google Authentication (JavaScript + JSDoc Edition)**

**Version:** 1.1
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction**

This document outlines best practices for implementing Google OAuth authentication using Auth.js (NextAuth.v5) within the "Retail Inventory & Finance Manager" Next.js application. The application will use **JavaScript with JSDoc annotations**. The primary goal is to secure the application and manage user sessions via a JSON Web Token (JWT) strategy, without a database adapter.

**2. Core Principles**

- **OAuth 2.0 with Google:** Leverage Google as the identity provider.
- **JWT Session Strategy:** User sessions will be managed via JWTs stored in secure, HTTP-only cookies.
- **App Router Integration:** All patterns are tailored for the Next.js App Router.
- **JSDoc for Clarity:** JSDoc comments will be used to define the structure of session and token objects, providing clarity for the AI agent.

**3. Configuration Files and Environment Variables**

- **Environment Variables (`.env.local`):**

  - `AUTH_SECRET`: A secret key used to encrypt JWTs. **Crucial for security.**
  - `AUTH_GOOGLE_ID`: Google OAuth Client ID.
  - `AUTH_GOOGLE_SECRET`: Google OAuth Client Secret.
  - `AUTH_URL`: The canonical URL of your deployment.
  - `AUTH_TRUST_HOST=true`: Required for Vercel and similar platforms.

- **Main Auth.js Configuration (`src/lib/auth.config.js`):**

  ```javascript
  // src/lib/auth.config.js
  import GoogleProvider from "next-auth/providers/google";

  /**
   * @type {import('next-auth').NextAuthConfig}
   */
  export const authConfig = {
    providers: [
      GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    ],
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

        if (isOnDashboard) {
          if (isLoggedIn) return true;
          return false; // Redirect unauthenticated users to login page
        } else if (isLoggedIn) {
          if (nextUrl.pathname === "/login") {
            return Response.redirect(new URL("/dashboard", nextUrl));
          }
        }
        return true;
      },
      async jwt({ token, user, account }) {
        // On initial sign-in, persist user data to the token
        if (account && user) {
          token.id = user.id;
          // Example for future: token.role = 'owner';
        }
        return token;
      },
      async session({ session, token }) {
        // Expose user ID and other custom properties to the client-side session object
        if (token.id && session.user) {
          // @ts-ignore - We are intentionally modifying the session user object
          session.user.id = token.id;
        }
        // if (token.role && session.user) {
        //   // @ts-ignore
        //   session.user.role = token.role;
        // }
        return session;
      },
    },
  };
  ```

- **Main Auth Initialization (`src/auth.js`):**

  ```javascript
  // src/auth.js
  import NextAuth from "next-auth";
  import { authConfig } from "./lib/auth.config"; // Adjust path

  export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
  } = NextAuth(authConfig);
  ```

**4. API Route Handler**

- Create the catch-all API route for NextAuth.js.
- File: `src/app/api/auth/[...nextauth]/route.js`
  ```javascript
  // src/app/api/auth/[...nextauth]/route.js
  export { GET, POST } from "@/auth";
  ```

**5. Middleware for Route Protection**

- Create a `middleware.js` file in your `src` directory.

  ```javascript
  // src/middleware.js
  import NextAuth from "next-auth";
  import { authConfig } from "./lib/auth.config"; // Adjust path

  // Initialize NextAuth with the config that includes the `authorized` callback
  const { auth } = NextAuth(authConfig);

  export default auth;

  export const config = {
    // Matcher to specify which routes the middleware should run on.
    matcher: [
      "/dashboard/:path*",
      // Exclude NextAuth's own API routes and public static assets.
      "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
    ],
  };
  ```

**6. Accessing Session Data**

- **Server Components:**

  ```javascript
  // Example: src/app/dashboard/page.jsx (Server Component)
  import { auth } from "@/auth";
  import { redirect } from "next/navigation";

  export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
      redirect("/login");
    }

    /**
     * JSDoc type casting to inform the editor about our custom session shape.
     * @type {import('next-auth').Session & { user: { id: string } }}
     */
    const typedSession = session;

    return (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {typedSession.user.name}!</p>
        <p>Your ID: {typedSession.user.id}</p>
      </div>
    );
  }
  ```

- **Client Components (`useSession` hook):**

  - First, create and add a Session Provider to your root layout.

  ```javascript
  // src/components/providers/SessionProviderWrapper.jsx
  'use client';
  import { SessionProvider } from 'next-auth/react';

  /**
   * @param {{ children: React.ReactNode }} props
   */
  export default function SessionProviderWrapper({ children }) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  // src/app/layout.jsx
  import SessionProviderWrapper from '@/components/providers/SessionProviderWrapper';

  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </body>
      </html>
    );
  }
  ```

  - Then, use the hook in your Client Components:

  ```javascript
  // Example: src/components/features/auth/LoginButton.jsx (Client Component)
  "use client";
  import { useSession, signIn, signOut } from "next-auth/react";

  export default function LoginButton() {
    const { data: session, status } = useSession();

    if (status === "loading") {
      return <button disabled>Loading...</button>;
    }

    if (session) {
      return (
        <>
          <p>Signed in as {session.user?.email}</p>
          <button onClick={() => signOut({ callbackUrl: "/" })}>
            Sign Out
          </button>
        </>
      );
    }

    return (
      <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
        Sign in with Google
      </button>
    );
  }
  ```

**7. Custom Login Page**

- Create your custom login page at `src/app/login/page.jsx`. This page will use the `LoginButton` component to trigger the `signIn('google')` action.

**8. Manual User Data Persistence (If Needed)**

Since no adapter is used, user data from Google isn't automatically saved to your database. If you need to sync user profiles:

1.  Create an API endpoint (e.g., `/api/users/sync`).
2.  Call this endpoint from the `jwt` or `signIn` callback in `auth.config.js` after a successful Google authentication.
    ```javascript
    // Inside authConfig callbacks:
    // async jwt({ token, user, account }) {
    //   if (account?.provider === "google" && user) {
    //     try {
    //       await fetch(`${process.env.AUTH_URL}/api/users/sync`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //           providerAccountId: user.id,
    //           email: user.email,
    //           name: user.name,
    //           image: user.image,
    //         }),
    //       });
    //     } catch (error) {
    //       console.error("Error syncing user to DB:", error);
    //     }
    //   }
    //   return token;
    // },
    ```

**9. Security Considerations**

- **`AUTH_SECRET`:** Keep it secret and strong.
- **Redirect URIs:** Configure them correctly in your Google Cloud Console.
- **JWT Contents:** Only include necessary information in the JWT.
- **Role-Based Access Control (RBAC):** The foundation for RBAC is laid by adding a `role` to the JWT in the `jwt` callback. This `role` can then be checked in middleware or server components to control access. This will be detailed in the "Application Security" guide.

This guide provides the AI agent with the necessary instructions to implement Google authentication using Auth.js (NextAuth.v5) in a secure and best-practice manner using JavaScript and JSDoc.

// src/lib/auth.config.js

import GoogleProvider from "next-auth/providers/google";
import prisma from "./prisma";
import { upsertUserAndCreateShop } from "./data/users";

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
    /**
     * This callback is triggered on a successful sign-in.
     * It calls our encapsulated service function to handle database operations.
     */
    async signIn({ user, account }) {
      if (account?.provider !== "google") return false;
      try {
        const dbUser = await upsertUserAndCreateShop(user);
        return dbUser !== null;
      } catch (error) {
        console.error("Sign-in callback error:", error);
        return false;
      }
    },

    /**
     * Controls access to protected routes.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        if (nextUrl.pathname === "/login") {
          // Redirect authenticated users from login page to dashboard
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      return true;
    },

    /**
     * This callback enriches the JWT with data from your database.
     * It's called after a successful sign-in to create the token.
     */
    async jwt({ token, user }) {
      // On initial sign-in, find the user in your database.
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // Persist the database ID and role to the token.
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },

    /**
     * This callback creates the final session object from the JWT data.
     * This is the missing piece that makes the user ID available to your app.
     */
    async session({ session, token }) {
      // Transfer the user ID and role from the token to the session object.
      if (token.id && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

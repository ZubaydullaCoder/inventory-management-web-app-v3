import GoogleProvider from "next-auth/providers/google";
import { upsertUserAndCreateShop } from "./services/user-service"; // <-- IMPORT THE SERVICE

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
     * It now calls our encapsulated service function to handle database operations.
     */
    async signIn({ user, account }) {
      if (account?.provider !== "google") return false;

      try {
        // Call the service function to handle user creation/verification.
        const dbUser = await upsertUserAndCreateShop(user);

        // If the service function returns a user, the sign-in is successful.
        // If it returns null (due to an error), the sign-in is blocked.
        return dbUser !== null;
      } catch (error) {
        console.error("Sign-in callback error:", error);
        // Prevent sign-in on unexpected errors.
        return false;
      }
    },

    // ... (the rest of your authorized, jwt, and session callbacks remain unchanged) ...
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        if (nextUrl.pathname === "/login") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.id && session.user) {
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    },
  },
};

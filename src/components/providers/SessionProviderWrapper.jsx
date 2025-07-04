"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side wrapper for NextAuth.js SessionProvider.
 * This component makes the session context available to all child components.
 *
 * @param {{
 *   children: React.ReactNode;
 *   session?: import('next-auth').Session;
 * }} props - Component props
 * @returns {JSX.Element} Session provider wrapper
 */
export default function SessionProviderWrapper({ children, session }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Authentication modal component that provides a modal dialog for user authentication.
 * This component manages its own open/closed state internally using the composition pattern.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.trigger - Element that opens the modal when clicked
 * @param {React.ReactNode} props.children - Content to render inside the modal body
 * @returns {JSX.Element} Modal dialog for authentication
 */
export default function AuthModal({ trigger, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to RetailManager</DialogTitle>
          <DialogDescription>
            Sign in to start managing your shop's inventory and finances.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

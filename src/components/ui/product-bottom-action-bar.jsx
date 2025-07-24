"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * ProductBottomActionBar - A floating action bar that appears at the bottom
 * when products are selected in the data table.
 * 
 * @param {Object} props
 * @param {Array} props.selectedProducts - Array of selected product objects
 * @param {Function} props.onClearSelection - Handler to clear row selection
 * @param {boolean} [props.visible] - Whether the action bar should be visible
 * @param {Element|DocumentFragment} [props.container] - Container element for portal
 * @param {React.ReactNode} props.children - Action buttons and content
 * @param {string} [props.className] - Additional CSS classes
 */
export function ProductBottomActionBar({
  selectedProducts = [],
  onClearSelection,
  visible: visibleProp,
  container: containerProp,
  children,
  className,
  ...props
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && onClearSelection) {
        onClearSelection();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClearSelection]);

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  if (!container) return null;

  const visible = visibleProp ?? selectedProducts.length > 0;
  const selectedCount = selectedProducts.length;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          role="toolbar"
          aria-orientation="horizontal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={cn(
            "fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit flex-wrap items-center justify-center gap-2 rounded-md border bg-background p-2 text-foreground shadow-lg",
            className,
          )}
          {...props}
        >
          {/* Selection Counter */}
          <div className="flex h-8 items-center rounded-md border bg-muted/50 px-3">
            <span className="whitespace-nowrap text-sm font-medium">
              {selectedCount} {selectedCount === 1 ? "product" : "products"} selected
            </span>
            <Separator
              orientation="vertical"
              className="mx-2 h-4"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-muted"
              onClick={onClearSelection}
              title="Clear selection (Esc)"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Clear selection</span>
            </Button>
          </div>

          {/* Action Buttons */}
          {children && (
            <>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center gap-1.5">
                {children}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    container,
  );
}

/**
 * ProductBottomActionBarAction - A styled action button for the bottom action bar
 * 
 * @param {Object} props
 * @param {string} [props.tooltip] - Tooltip text for the button
 * @param {boolean} [props.isPending] - Whether the action is pending
 * @param {string} [props.variant] - Button variant
 * @param {string} [props.size] - Button size
 */
export function ProductBottomActionBarAction({
  size = "sm",
  variant = "outline",
  className,
  children,
  ...props
}) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "h-8 gap-1.5 border-border/50 bg-background/80 backdrop-blur-sm hover:bg-accent/80",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

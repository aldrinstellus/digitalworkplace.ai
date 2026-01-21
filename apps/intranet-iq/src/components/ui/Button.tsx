"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[var(--accent-ember)] to-[var(--accent-copper)] text-white hover:from-[var(--accent-ember-soft)] hover:to-[var(--accent-ember)] shadow-lg shadow-[var(--accent-ember)]/20",
  secondary:
    "bg-[var(--bg-slate)] text-[var(--text-primary)] hover:bg-[var(--bg-slate)]/80 border border-[var(--border-subtle)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)]",
  outline:
    "bg-transparent text-[var(--accent-ember)] border border-[var(--accent-ember)]/50 hover:bg-[var(--accent-ember)]/10 hover:border-[var(--accent-ember)]",
  danger:
    "bg-[var(--error)] text-white hover:bg-[var(--error)]/90 shadow-lg shadow-[var(--error)]/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-lg gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2.5",
  icon: "p-2 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ember)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-obsidian)]",
          variantClasses[variant],
          sizeClasses[size],
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {size !== "icon" && children}
        {!loading && rightIcon}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

// Icon Button - A special case for icon-only buttons
interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "children"> {
  icon: React.ReactNode;
  label: string; // For accessibility
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant = "ghost", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size="icon"
        className={className}
        aria-label={label}
        title={label}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);
IconButton.displayName = "IconButton";

// Button Group - For grouping related buttons
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg overflow-hidden border border-[var(--border-subtle)]",
        "[&>button]:rounded-none [&>button]:border-0 [&>button:not(:last-child)]:border-r [&>button:not(:last-child)]:border-[var(--border-subtle)]",
        className
      )}
    >
      {children}
    </div>
  );
}

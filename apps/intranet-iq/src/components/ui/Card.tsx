"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined" | "glow";
  hover?: boolean;
  className?: string;
}

const variantClasses = {
  default: "bg-[var(--bg-charcoal)] border border-[var(--border-subtle)]",
  elevated: "bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] shadow-lg",
  outlined: "bg-transparent border border-[var(--border-default)]",
  glow: "bg-[var(--bg-charcoal)] border border-[var(--accent-ember)]/20 shadow-lg shadow-[var(--accent-ember)]/5",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = "default", hover = true, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl overflow-hidden",
          variantClasses[variant],
          className
        )}
        whileHover={
          hover
            ? {
                y: -4,
                boxShadow: "0 20px 40px rgba(16, 185, 129, 0.1)",
                borderColor: "rgba(16, 185, 129, 0.2)",
              }
            : undefined
        }
        whileTap={hover ? { scale: 0.99 } : undefined}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = "Card";

// Card Header
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("p-5 border-b border-[var(--border-subtle)]", className)}>
      {children}
    </div>
  );
}

// Card Title
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold text-[var(--text-primary)]", className)}>
      {children}
    </h3>
  );
}

// Card Description
interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-[var(--text-muted)] mt-1", className)}>
      {children}
    </p>
  );
}

// Card Content
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

// Card Footer
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        "p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-obsidian)]/30",
        className
      )}
    >
      {children}
    </div>
  );
}

// Stat Card - commonly used on dashboards
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  className,
}: StatCardProps) {
  const changeColors = {
    positive: "text-[var(--success)]",
    negative: "text-[var(--error)]",
    neutral: "text-[var(--text-muted)]",
  };

  return (
    <Card className={className}>
      <CardContent className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
          {change && (
            <p className={cn("text-sm mt-1", changeColors[changeType])}>{change}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-[var(--accent-ember)]/10 text-[var(--accent-ember)]">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

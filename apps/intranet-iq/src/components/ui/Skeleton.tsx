"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
}

const variantClasses = {
  text: "rounded",
  circular: "rounded-full",
  rectangular: "",
  rounded: "rounded-lg",
};

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn("skeleton", variantClasses[variant], className)}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

// Pre-built skeleton patterns for common use cases

// Text skeleton with multiple lines
interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

export function TextSkeleton({ lines = 3, className }: TextSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-4"
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}

// Avatar skeleton
interface AvatarSkeletonProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const avatarSizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

export function AvatarSkeleton({ size = "md", className }: AvatarSkeletonProps) {
  return (
    <Skeleton variant="circular" className={cn(avatarSizes[size], className)} />
  );
}

// Card skeleton
interface CardSkeletonProps {
  showImage?: boolean;
  showAvatar?: boolean;
  className?: string;
}

export function CardSkeleton({
  showImage = false,
  showAvatar = false,
  className,
}: CardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl overflow-hidden",
        className
      )}
    >
      {showImage && <Skeleton variant="rectangular" className="w-full h-40" />}
      <div className="p-5 space-y-4">
        {showAvatar && (
          <div className="flex items-center gap-3">
            <AvatarSkeleton />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-4 w-24" />
              <Skeleton variant="text" className="h-3 w-16" />
            </div>
          </div>
        )}
        <Skeleton variant="text" className="h-5 w-3/4" />
        <TextSkeleton lines={2} />
      </div>
    </div>
  );
}

// Table row skeleton
interface TableRowSkeletonProps {
  columns?: number;
  className?: string;
}

export function TableRowSkeleton({
  columns = 4,
  className,
}: TableRowSkeletonProps) {
  return (
    <div className={cn("flex items-center gap-4 p-4", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-4 flex-1"
          width={i === 0 ? "30%" : undefined}
        />
      ))}
    </div>
  );
}

// List item skeleton
interface ListItemSkeletonProps {
  showAvatar?: boolean;
  className?: string;
}

export function ListItemSkeleton({
  showAvatar = true,
  className,
}: ListItemSkeletonProps) {
  return (
    <div className={cn("flex items-center gap-4 p-3", className)}>
      {showAvatar && <AvatarSkeleton />}
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="h-4 w-1/2" />
        <Skeleton variant="text" className="h-3 w-1/3" />
      </div>
    </div>
  );
}

// Stat card skeleton
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton variant="text" className="h-4 w-20" />
          <Skeleton variant="text" className="h-8 w-24" />
          <Skeleton variant="text" className="h-3 w-16" />
        </div>
        <Skeleton variant="rounded" className="w-12 h-12" />
      </div>
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" className="h-5 w-32" />
        <Skeleton variant="rounded" className="h-8 w-24" />
      </div>
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            className="flex-1 rounded-t"
            height={`${40 + Math.random() * 60}%`}
          />
        ))}
      </div>
    </div>
  );
}

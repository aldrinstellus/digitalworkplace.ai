"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Toast types
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const toast = useCallback(
    (options: Omit<Toast, "id">) => {
      context.addToast(options);
    },
    [context]
  );

  return {
    toast,
    success: (title: string, description?: string) =>
      toast({ type: "success", title, description }),
    error: (title: string, description?: string) =>
      toast({ type: "error", title, description }),
    warning: (title: string, description?: string) =>
      toast({ type: "warning", title, description }),
    info: (title: string, description?: string) =>
      toast({ type: "info", title, description }),
  };
}

// Toast Container
function ToastContainer() {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts, removeToast } = context;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual Toast Item
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const typeConfig: Record<
  ToastType,
  { icon: React.ElementType; bgColor: string; iconColor: string; borderColor: string }
> = {
  success: {
    icon: CheckCircle2,
    bgColor: "bg-[var(--success)]/10",
    iconColor: "text-[var(--success)]",
    borderColor: "border-[var(--success)]/30",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-[var(--error)]/10",
    iconColor: "text-[var(--error)]",
    borderColor: "border-[var(--error)]/30",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-[var(--warning)]/10",
    iconColor: "text-[var(--warning)]",
    borderColor: "border-[var(--warning)]/30",
  },
  info: {
    icon: Info,
    bgColor: "bg-[var(--accent-ember)]/10",
    iconColor: "text-[var(--accent-ember)]",
    borderColor: "border-[var(--accent-ember)]/30",
  },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { id, type, title, description, duration = 5000 } = toast;
  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-[var(--bg-charcoal)] shadow-lg backdrop-blur-sm",
        config.borderColor
      )}
    >
      <div className={cn("p-1.5 rounded-lg", config.bgColor)}>
        <Icon className={cn("w-4 h-4", config.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
        )}
      </div>

      <motion.button
        onClick={() => onRemove(id)}
        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)] transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="w-4 h-4" />
      </motion.button>

      {/* Progress bar */}
      {duration > 0 && (
        <motion.div
          className={cn(
            "absolute bottom-0 left-0 h-0.5 rounded-b-xl",
            type === "success" && "bg-[var(--success)]",
            type === "error" && "bg-[var(--error)]",
            type === "warning" && "bg-[var(--warning)]",
            type === "info" && "bg-[var(--accent-ember)]"
          )}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

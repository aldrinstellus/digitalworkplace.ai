"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // Authenticated users go to dashboard
        router.replace("/dashboard");
      } else {
        // Unauthenticated users go to sign-in
        router.replace("/sign-in");
      }
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading spinner while checking auth and redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full"
        />
        <p className="text-white/50 text-sm">Loading...</p>
      </motion.div>
    </div>
  );
}

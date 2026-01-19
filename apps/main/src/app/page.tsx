"use client";

import { useEffect } from "react";
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Redirect signed-in users to dashboard
  useEffect(() => {
    if (isLoaded && user) {
      router.push("/dashboard");
    }
  }, [isLoaded, user, router]);

  // Show loading while checking auth
  if (!isLoaded || user) {
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

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center p-8 bg-[#0f0f1a]">
      <SignedOut>
        <div className="text-center max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6 text-white"
          >
            <span className="text-white/60">digital</span>
            <span className="text-white">workplace</span>
            <span className="text-green-400">.ai</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/50 mb-8"
          >
            Your AI-powered digital workplace solution. Sign in to get started.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 justify-center"
          >
            <Link
              href="/sign-in"
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full"
          />
        </div>
      </SignedIn>
    </div>
  );
}

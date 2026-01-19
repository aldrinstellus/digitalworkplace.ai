"use client";

import { motion } from "framer-motion";
import FloatingAvatars from "@/components/login/FloatingAvatars";
import AnimatedLoginForm from "@/components/login/AnimatedLoginForm";

export default function SignInPage() {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left Panel - Floating Avatars */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:block w-1/2 h-full relative"
      >
        <FloatingAvatars />
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 h-full flex items-center justify-center bg-white relative"
      >
        {/* Subtle pattern background */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Form content */}
        <div className="relative z-10 w-full max-w-md">
          <AnimatedLoginForm />
        </div>

        {/* Bottom gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      </motion.div>
    </div>
  );
}

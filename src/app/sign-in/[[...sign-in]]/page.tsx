"use client";

import { motion } from "framer-motion";
import LoginBackground from "@/components/login/LoginBackground";
import AnimatedLoginForm from "@/components/login/AnimatedLoginForm";

export default function SignInPage() {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left Panel - World Map Background */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:block w-1/2 h-full relative"
      >
        <LoginBackground />
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 h-full flex items-center justify-center bg-neutral-50 relative overflow-y-auto py-12"
      >
        {/* Form content */}
        <div className="relative z-10 w-full flex justify-center">
          <AnimatedLoginForm />
        </div>
      </motion.div>
    </div>
  );
}

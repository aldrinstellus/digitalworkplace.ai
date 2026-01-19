"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function SSOCallback() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
        <p className="text-white/70 text-sm">Completing sign in...</p>
      </motion.div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}

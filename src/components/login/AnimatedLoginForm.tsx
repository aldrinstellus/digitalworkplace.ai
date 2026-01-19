"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AnimatedLoginForm = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(clerkError.errors?.[0]?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "oauth_google" | "oauth_github") => {
    if (!isLoaded || !signIn) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(clerkError.errors?.[0]?.message || "OAuth sign-in failed");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[440px] px-4"
    >
      {/* Logo */}
      <motion.div variants={itemVariants} className="flex justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0L40 20L20 40L0 20L20 0Z" fill="#0d9488" />
              <path d="M20 8L32 20L20 32L8 20L20 8Z" fill="#14b8a6" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-bold text-teal-600">Digital Workplace</span>
            <span className="block text-sm font-semibold text-teal-500">AI</span>
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-900">Sign In</h1>
        <p className="text-neutral-500 text-xs font-medium mt-1">
          Enter your details to get signed in to your account.
        </p>
      </motion.div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-bold text-neutral-900 mb-2">
            Work Email / Username
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address / username"
            className="w-full h-[44px] px-4 rounded-full border border-neutral-300 transition-all duration-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white text-sm"
          />
        </motion.div>

        {/* Password Input */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-bold text-neutral-900 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full h-[44px] px-4 pr-12 rounded-full border border-neutral-300 transition-all duration-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </motion.div>

        {/* Forgot Password Link */}
        <motion.div variants={itemVariants} className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-neutral-900 hover:text-teal-600 transition-colors"
          >
            Forgot Password?
          </Link>
        </motion.div>

        {/* Sign In Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            disabled={!isValid || isLoading}
            whileHover={{ scale: isValid ? 1.01 : 1 }}
            whileTap={{ scale: isValid ? 0.99 : 1 }}
            className={`w-full h-[44px] rounded-full font-semibold text-sm transition-all duration-200 ${
              isValid
                ? "bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-600 rounded-full"
                />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </motion.div>

        {/* SSO Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            type="button"
            onClick={() => handleOAuthSignIn("oauth_google")}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full h-[44px] rounded-full font-semibold text-sm text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 transition-all duration-200"
          >
            Sign In with Single Sign-On (SSO)
          </motion.button>
        </motion.div>
      </form>

      {/* Sign Up Link */}
      <motion.div
        variants={itemVariants}
        className="mt-8 text-center text-sm text-neutral-500"
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-teal-600 hover:text-teal-500 transition-colors"
        >
          Sign up
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedLoginForm;

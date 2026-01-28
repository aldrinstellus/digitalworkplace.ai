"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SSOCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Handle any URL errors from OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (errorParam) {
      console.error("OAuth error:", errorParam, errorDescription);
      setError(errorDescription || errorParam);
      // Redirect back to sign-in after showing error
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    }
  }, [router]);

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0f0f1a]">
        <div className="flex flex-col items-center gap-4 max-w-md px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-white/80 text-sm">Sign-in failed: {error}</p>
          <p className="text-white/40 text-xs">Redirecting back to sign-in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0f0f1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Signing you in...</p>
      </div>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
      />
    </div>
  );
}

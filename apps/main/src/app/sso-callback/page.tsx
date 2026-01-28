"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Let Clerk handle the OAuth callback
        await handleRedirectCallback({
          signInForceRedirectUrl: "/dashboard",
          signUpForceRedirectUrl: "/dashboard",
          signInFallbackRedirectUrl: "/dashboard",
          signUpFallbackRedirectUrl: "/dashboard",
        });
      } catch (error) {
        console.error("SSO callback error:", error);
        // On error, redirect to sign-in
        router.push("/sign-in");
      }
    };

    handleCallback();
  }, [handleRedirectCallback, router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0f0f1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
